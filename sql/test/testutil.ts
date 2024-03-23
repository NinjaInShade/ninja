import { loadEnv } from '@ninjalib/util';
import path from 'node:path';
import sql from '~/index';

export async function getDB() {
    await loadEnv(path.join(process.cwd(), '.env'));
    const port = process.env.DB_PORT;
    const settings = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: port ? +port : 3306,
        database: 'test',
    };
    const db = new sql.MySQL(settings);
    await db.connect();
    return db;
}
