import util from '@ninjalib/util';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import sql from '../index.js';

type User = {
    id: number;
    first_name: string;
    last_name: string | null;
    email: string;
    created: string;
    timestamp: string;
};

describe('MySQL queries', () => {
    let db: sql.MySQL;

    const rollbackHook = async (fn: Function) => {
        try {
            await db.transaction(async () => {
                await fn();
                throw new Error('rollback');
            });
        } catch (err) {
            if (err.message === 'rollback') {
                return;
            }
            throw err;
        }
    };

    const setupData = async () => {
        const createDBQuery = `CREATE DATABASE testing`;
        const createTableQuery = `
            CREATE TABLE testing.users (
                id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) DEFAULT NULL,
                email VARCHAR(255) NOT NULL,
                created TIMESTAMP NOT NULL DEFAULT NOW(),
                timestamp TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `;
        const insertDataQuery = `
            INSERT INTO testing.users (first_name, last_name, email)
            VALUES
                ('leon', 'michalak', 'leonmichalak@gmail.com'),
                ('leon', 'obama', 'obamaleon@gmail.com'),
                ('bob', NULL, 'bob@hotmail.com'),
                ('ryan', NULL, 'ryan_.@gmail.com'),
                ('mike', 'tyson', 'miketyson@gmail.com'),
                ('mark', NULL, 'whalberg@outlook.com'),
                ('michael', 'jordan', 'nbamichael@gmail.com'),
                ('mike', 'imposter', 'mikeimposter@gmail.com')
        `;
        await db.transaction(async () => {
            await db.query(createDBQuery);
            await db.query(createTableQuery);
            await db.query(insertDataQuery);
        });
    };

    const destroyData = async () => {
        await db.transaction(async () => {
            await db.query(`DROP DATABASE testing`);
        });
    };

    before(async () => {
        await util.server.loadEnv();
        const settings = {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            database: 'tracker',
        };
        db = new sql.MySQL(settings);
        await db.connect();
        await setupData();
    });

    after(async () => {
        await destroyData();
        await db.dispose();
    });

    it('[query] should throw if query param is undefined', async () => {
        await assert.rejects(async () => await db.query<User>('SELECT * FROM testing.users WHERE first_name = ?', [undefined]), { message: 'Query parameter 1 is undefined' });
    });

    it('[query] should throw if table does not exist', async () => {
        await assert.rejects(async () => await db.query<User>('SELECT * FROM not_defined'), { message: `Query failed: Table 'tracker.not_defined' doesn't exist` });
    });

    it('[query] should throw if column in where condition does not exist', async () => {
        await assert.rejects(async () => await db.query<User>('SELECT * FROM testing.users WHERE not_defined = ?', ['test']), { message: `Query failed: Unknown column 'not_defined' in 'where clause'` });
    });

    it('[getRows] should get all rows', async () => {
        const users = await db.getRows<User>('testing.users');
        assert.equal(users.length, 8);
    });

    it('[getRows] should get all rows based on where condition', async () => {
        const users = await db.getRows<User>('testing.users', { first_name: 'leon' });
        assert.equal(users.length, 2);
    });

    it('[getRows] should return empty array if no matches found', async () => {
        const users = await db.getRows<User>('testing.users', { first_name: 'not', last_name: 'defined' });
        assert.equal(users.length, 0);
    });

    it('[getRow] should get row', async () => {
        const user = await db.getRow<User>('testing.users');
        assert.equal(user.first_name, 'leon');
        assert.equal(user.last_name, 'michalak');
        assert.equal(user.email, 'leonmichalak@gmail.com');
    });

    it('[getRow] should get row based on where condition', async () => {
        const user = await db.getRow<User>('testing.users', { first_name: 'mike', last_name: 'tyson' });
        assert.equal(user.first_name, 'mike');
        assert.equal(user.last_name, 'tyson');
        assert.equal(user.email, 'miketyson@gmail.com');
    });

    it('[getRow] should return default value if no row found', async () => {
        const user = await db.getRow<User, string>('testing.users', { first_name: 'made', last_name: 'up' }, 'not_found');
        assert.equal(user, 'not_found');
    });

    it(`[insertOne] should insert an entry into the database and return created row's id`, async () => {
        await rollbackHook(async () => {
            const id = await db.insertOne('testing.users', { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' });
            const newRow = await db.getRow<User>('testing.users', { id });
            assert.equal(newRow.first_name, 'new');
            assert.equal(newRow.last_name, 'guy');
            assert.equal(newRow.email, 'newguy@gmail.com');
        });
    });
});
