import * as mysql from 'mysql2/promise';
import { Transaction, type TX } from './Transaction';
import { migrator, type Migration } from './migrate';
import util from '@ninjalib/util';

interface ConnectionOptions extends mysql.ConnectionOptions {
    // TODO: potential for extra options in the future
}

export type Row = Record<string, any>;

type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER';

const log = util.logger('sql:mysql');

const CONN_RETRY_TIMEOUT = 2500;
const CONN_RETRY_START_LOGS = 3; // Start logging db is not ready need to retry after `n` attempts

/**
 * MySQL ORM
 */
export default class MySQL {
    private pool: mysql.Pool | undefined;

    public options: ConnectionOptions;
    public log: util.Logger = log;

    constructor(opts: ConnectionOptions = {}) {
        const defaultOpts = {
            user: 'root',
            password: 'root',
            host: 'localhost',
            port: '3306',
        };

        this.options = Object.assign({}, defaultOpts, opts);
    }

    /**
     * Creates a MySQL connection
     */
    public async connect() {
        if (this.pool) {
            throw new Error('You already have an open pool, do not try to connect again!');
        }

        let retries = 0;

        return new Promise<void>((resolve, reject) => {
            try {
                const pool = mysql.createPool(this.options);
                pool.on('connection', (connection) => {
                    connection.on('error', (err) => {
                        log.error(`MySQL pool connection error: ${err}`);
                    });
                });
                const testConnection = async () => {
                    try {
                        await pool.query('SELECT 1');
                        this.pool = pool;
                        resolve();
                    } catch (err) {
                        if (retries > CONN_RETRY_START_LOGS) {
                            log.warn(`Database not ready yet, retrying... (${retries + 1} attempts)`);
                        }
                        retries++;
                        setTimeout(testConnection, CONN_RETRY_TIMEOUT);
                    }
                };
                void testConnection();
            } catch (err) {
                reject(new Error(`Failed to create pool: ${err.message}`));
            }
        });
    }

    /**
     * Disconnects your MySQL connection
     */
    public async dispose() {
        if (this.pool) {
            await this.pool.end();
            this.pool = undefined;
        }
    }

    /**
     * Runs the code in a transaction context, rolling back if it encounter any error
     */
    public async transaction(fn: (tx: TX) => Promise<any>) {
        if (!this.pool) {
            throw new Error("DB connection hasn't been initialised");
        }
        const connection = await this.pool.getConnection();
        const tx = new Transaction(this, connection) as TX; // TODO: fix typing
        try {
            await connection.beginTransaction();
            const result = await fn(tx);
            await connection.commit();
            return result;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.destroy();
        }
    }

    /**
     * Returns the type of query being performed
     */
    public getQueryType(query: string): QueryType | null {
        const re = /(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|USE)/im;
        const match = query.match(re);
        const queryType = match?.length ? match[0] : null;
        return queryType as QueryType | null;
    }

    /**
     * Proxy method that every query method should go through
     */
    private async _query<T extends Row>(connection: mysql.Pool | mysql.Connection, query: string, values: any[] = []) {
        // Only allow `db.transaction()` to handle transactions
        const bannedQueries = ['START TRANSACTION', 'BEGIN', 'COMMIT', 'ROLLBACK'];
        for (const bannedQuery of bannedQueries) {
            if (query.toUpperCase().includes(bannedQuery)) {
                throw new Error(`Manually handling transactions is forbidden. Use 'db.transaction()' instead`);
            }
        }

        // Check for undefined parameters
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            if (value === undefined) {
                throw new Error(`Query parameter ${i + 1} is undefined`);
            }
        }

        try {
            const [results] = await connection.query(query, values);
            return results as T[];
        } catch (err) {
            throw new Error(`Query failed: ${err.message}`);
        }
    }

    /**
     * Performs a query and returns the results
     */
    public async query<T extends Row>(query: string, values?: any[]) {
        if (!this.pool) {
            throw new Error("DB connection hasn't been initialised");
        }
        const queryType = this.getQueryType(query);
        if (!queryType) {
            log.warn('Unknown query type', query);
        } else if (queryType !== 'SELECT') {
            log.debug(`Running '${queryType}' query without a transaction`);
        }
        return await this._query<T>(this.pool, query, values);
    }

    /**
     * Migrate the DB.
     * Keeps track of which steps it's done and knows which steps to execute next.
     */
    public migrate(migration: Migration) {
        return migrator(migration, this);
    }

    /**
     * Returns rows found from the given table and conditions
     */
    public async getRows<T extends Row>(table: string, where: Row = {}) {
        const args = [table];
        let query = `
            SELECT *
            FROM ??
            WHERE TRUE
        `;

        for (const [key, value] of Object.entries(where)) {
            query += `AND ?? = ?\n`;
            args.push(key, value);
        }

        return await this.query<T>(query, args);
    }

    /**
     * Returns first row found from the given table and conditions.
     * @param defaultValue returns this if no row could be found - defaults to `null`.
     */
    public async getRow<T extends Row>(table: string, where?: Row): Promise<T>;
    public async getRow<T extends Row, K>(table: string, where?: Row, defaultValue?: K): Promise<T | K>;
    public async getRow<T extends Row, K>(table: string, where?: Row, defaultValue?: K): Promise<T | K> {
        const rows = await this.getRows<T>(table, where);
        return rows.length ? rows[0] : defaultValue;
    }

    /**
     *  Inserts one row into the given table and returns the created rows' id
     */
    public async insertOne<T extends Row>(table: string, data: Row): Promise<number> {
        const fields = Object.keys(data);
        const values = Object.values(data);

        let query = `
            INSERT INTO ?? (${fields.map(() => '??').join(', ')})
            VALUES (${values.map(() => '?').join(', ')})
        `;
        const args = [table, ...fields, ...values];
        const result = await this.query<T>(query, args);
        return result.insertId as number;
    }

    /**
     * Inserts multiple rows into the given table and returns the first created rows' id
     */
    public async insertMany<T extends Row>(table: string, data: Row[]): Promise<number | null> {
        if (!data.length) {
            return null;
        }

        const fields: string[] = [];
        const values: Array<Array<any>> = [];

        // Populate fields from first data object
        for (const field of Object.keys(data[0])) {
            fields.push(field);
        }

        for (const entry of data) {
            const _values: any[] = [];
            for (const [key, value] of Object.entries(entry)) {
                if (!fields.includes(key)) {
                    throw new Error(`Got field mismatch, '${key}' isn't part of the fields. Make sure every dataset has the same fields`);
                }
                _values.push(value);
            }
            values.push(_values);
        }

        const query = `
            INSERT INTO ?? (${fields.map(() => '??').join(', ')})
            VALUES ${values.map((_values) => `\n(${_values.map(() => '?').join(', ')})`).join(',')}
        `;
        const args = [table, ...fields, ...values.flat()];

        const result = await this.query<T>(query, args);
        return result.insertId as number;
    }

    /**
     * Inserts row/s into the given table but if primary key matches it updates the row
     */
    public async upsert(table: string, data: Row[]) {
        if (!data.length) {
            return;
        }

        const fields: string[] = [];
        const values: Array<Array<any>> = [];

        // Populate fields from first data object
        for (const field of Object.keys(data[0])) {
            fields.push(field);
        }

        for (const entry of data) {
            const _values: any[] = [];
            for (const [key, value] of Object.entries(entry)) {
                if (!fields.includes(key)) {
                    throw new Error(`Got field mismatch, '${key}' isn't part of the fields. Make sure every dataset has the same fields`);
                }
                _values.push(value);
            }
            values.push(_values);
        }

        const query = `
            INSERT INTO ?? (${fields.map(() => '??').join(', ')})
            VALUES ${values.map((_values) => `\n(${_values.map(() => '?').join(', ')})`).join(',')}
            ON DUPLICATE KEY UPDATE ${fields.map(() => `\n?? = VALUES(??)`).join(',')}
        `;
        const args = [table, ...fields, ...values.flat(), ...fields.flatMap((x) => [x, x])];

        await this.query(query, args);
    }

    /**
     * Deletes from the given table, deleting only the rows matching the given conditions
     */
    public delete(table: string, where: Row = {}) {
        const args = [table];
        let query = `
            DELETE FROM ??
            WHERE TRUE
        `;

        for (const [key, value] of Object.entries(where)) {
            query += `AND ?? = ?\n`;
            args.push(key, value);
        }

        return this.query(query, args);
    }

    public helpers = {
        getRows: this.getRows,
        getRow: this.getRow,
        insertOne: this.insertOne,
        insertMany: this.insertMany,
        upsert: this.upsert,
        delete: this.delete,
    };
}
