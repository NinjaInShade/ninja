import type MySQL from './MySQL';
import * as mysql from 'mysql2/promise';

export class Transaction {
    private instance: MySQL;
    private connection: mysql.Connection;

    constructor(instance: MySQL, connection: mysql.Connection) {
        this.instance = instance;
        this.connection = connection;

        // Add helpers
        for (const [helper, fn] of Object.entries(this.instance.helpers)) {
            Object.assign(this, { [helper]: fn });
        }
    }

    /** Performs a query and returns the results */
    public async query<T extends Record<string, any>>(query: string, values?: any[]): Promise<T[]> {
        const queryType = this.instance.getQueryType(query);
        if (!queryType) {
            this.instance.log.warn('Unknown query type', query);
        }
        return await this.instance._query<T>(this.connection, query, values);
    }
}

export type TX = Transaction & { [K in keyof MySQL['helpers']]: MySQL['helpers'][K] };
