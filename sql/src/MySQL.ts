import * as mysql from 'mysql2/promise';

interface ConnectionOptions extends mysql.ConnectionOptions {
    // TODO: potential for extra options in the future
}

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
            this.pool = await mysql.createPool(this.options);
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
            throw new Error(`Error whilst in transaction: ${err.message}`);
        } finally {
            this.transactionConnection = null;
        }
    }

    /**
     * Proxy method that every query method should go through
     */
    private async _query<T>(query: string, values: any[]): Promise<T>;
    private async _query<T>(query: string, values: any[], includeFields?): Promise<[T, mysql.FieldPacket[]]>;
    private async _query(query, values = [], includeFields = false) {
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            if (value === undefined) {
                throw new Error(`Query parameter ${i} is undefined`);
            }
        }

        let results;
        let fields;
        try {
            // This makes sure we use the right connection depending if we're in a transaction context
            const _connection = this.transactionConnection ?? this.pool;
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
    public async query<T>(query: string, values?: any[]) {
        return await this._query<T>(query, values);
    }
}
