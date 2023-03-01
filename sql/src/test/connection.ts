import util from '@ninjalib/util';
import { describe, it, after } from 'node:test';
import sql from '../index.js';

describe('MySQL connection', () => {
    let db: sql.MySQL;

    after(async () => {
        await db.dispose();
    });

    it('should connect to local database without error', async () => {
        await util.loadEnv();
        const settings = {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            database: 'tracker',
        };
        db = new sql.MySQL(settings);
        await db.connect();
    });
});
