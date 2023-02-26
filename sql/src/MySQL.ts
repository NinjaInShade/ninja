import * as mysql from 'mysql2/promise';

interface ConnectionOptions extends mysql.ConnectionOptions {
    // TODO: potential for extra options in the future
}

type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER';

/**
 * MySQL ORM
 */
export default class MySQL {
    private pool: mysql.Pool;
    private transactionConnection: mysql.PoolConnection | null;

    public options: ConnectionOptions;

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
        try {
            this.pool = mysql.createPool(this.options);
        } catch (err) {
            throw new Error(`Failed to create pool: ${err.message}`);
        }
    }

    /**
     * Disconnects your MySQL connection
     */
    public async dispose() {
        await this.pool.end();
    }

    /**
     * Runs the code in a transaction context, rolling back if it encounter any error
     */
    public async transaction(fn: Function) {
        const connection = await this.pool.getConnection();
        this.transactionConnection = connection;
        try {
            await connection.beginTransaction();
            await fn();
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            this.transactionConnection = null;
        }
    }

    /**
     * Returns the type of query being performed
     */
    private getQueryType(query: string): QueryType | null {
        const re = /(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|USE)/im;
        const match = query.match(re);
        const queryType = match.length ? match[0] : null;
        return queryType as QueryType | null;
    }

    /**
     * Proxy method that every query method should go through
     */
    private async _query<T extends Record<string, any>>(query: string, values?: any[]): Promise<T[]>;
    private async _query<T extends Record<string, any>>(query: string, values?: any[], includeFields?): Promise<[T[], mysql.FieldPacket[]]>;
    private async _query(query: string, values: any[] = [], includeFields: boolean = false) {
        // This makes sure we use the right connection depending if we're in a transaction context
        const _connection = this.transactionConnection ?? this.pool;

        // Only allow `db.transaction()` to handle transactions
        const bannedQueries = ['START TRANSACTION', 'BEGIN', 'COMMIT', 'ROLLBACK'];
        for (const bannedQuery of bannedQueries) {
            if (query.toUpperCase().includes(bannedQuery)) {
                throw new Error(`Manually handling transactions is forbidden. Use 'db.transaction()' instead`);
            }
        }

        // Enforce non-select queries requiring transactions
        const queryType = this.getQueryType(query);
        if (queryType !== 'SELECT' && !this.transactionConnection) {
            throw new Error(`Cannot run '${queryType}' query without a transaction`);
        }

        // Check for undefined parameters
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            if (value === undefined) {
                throw new Error(`Query parameter ${i + 1} is undefined`);
            }
        }

        let results;
        let fields;
        try {
            [results, fields] = await _connection.query(query, values);
        } catch (err) {
            throw new Error(`Query failed: ${err.message}`);
        }

        if (includeFields) {
            return [results, fields];
        }

        return results;
    }

    /**
     * Performs a query and returns the results
     */
    public async query<T extends Record<string, any>>(query: string, values?: any[]) {
        return await this._query<T>(query, values);
    }

    /**
     * Returns rows found from the given table and conditions
     */
    public async getRows<T extends Record<string, any>>(table: string, where: Record<string, any> = {}) {
        const args = [table];
        let query = `
            SELECT *
            FROM ??
            WHERE TRUE
        `;

        for (const [key, value] of Object.entries(where)) {
            query += `AND ?? = ?`;
            args.push(key, value);
        }

        return await this._query<T>(query, args);
    }

    /**
     * Returns first row found from the given table and conditions
     */
    public async getRow<T extends Record<string, any>>(table: string, where?: Record<string, any>): Promise<T>;
    public async getRow<T extends Record<string, any>, K = any>(table: string, where?: Record<string, any>, defaultValue?: K): Promise<T | K>;
    public async getRow<T>(table: string, where: Record<string, any> = {}, defaultValue: boolean = null) {
        const rows = await this.getRows<T>(table, where);
        return rows.length ? rows[0] : defaultValue;
    }

    /**
     *  Inserts one row into the given table and returns the created rows' id
     */
    public async insertOne<T = number>(table: string, data: Record<string, any>): Promise<T> {
        const fields = Object.keys(data);
        const values = Object.values(data);

        let query = `
            INSERT INTO ?? (${fields.map(() => '??').join(', ')})
            VALUES (${values.map(() => '?').join(', ')})
        `;
        const args = [table, ...fields, ...values];

        return ((await this._query<T>(query, args)) as unknown as mysql.ResultSetHeader).insertId as T;
    }

    /**
     * Inserts multiple rows into the given table and returns the first created rows' id
     */
    public async insertMany<T = number>(table: string, dataset: Record<string, any>[]): Promise<T> {
        const fields: string[] = [];
        const values: Array<Array<any>> = [];

        // Populate fields from first data object
        for (const field of Object.keys(dataset[0])) {
            fields.push(field);
        }

        for (const entry of dataset) {
            const _values: any[] = [];
            for (const [key, value] of Object.entries(entry)) {
                if (!fields.includes(key)) {
                    throw new Error(`Got field mismatch, '${key}' isn't part of the fields. Make sure every dataset has the same fields`);
                }
                _values.push(value);
            }
            values.push(_values);
        }

        let query = `
            INSERT INTO ?? (${fields.map(() => '??').join(', ')})
            VALUES ${values.map((_values) => `\n(${_values.map(() => '?').join(', ')})`).join(',')}
        `;
        const args = [table, ...fields, ...values.flat()];

        return ((await this._query<T>(query, args)) as unknown as mysql.ResultSetHeader).insertId as T;
    }
}
