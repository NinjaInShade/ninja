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

describe('MySQL transactions', () => {
    let db: sql.MySQL;

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
        await util.loadEnv();
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

    it(`should throw when trying to run 'START TRANSACTION' manually`, async () => {
        await assert.rejects(async () => await db.query('START TRANSACTION'), { message: `Manually handling transactions is forbidden. Use 'db.transaction()' instead` });
    });

    it(`should throw when trying to run 'BEGIN' manually`, async () => {
        await assert.rejects(async () => await db.query('BEGIN'), { message: `Manually handling transactions is forbidden. Use 'db.transaction()' instead` });
    });

    it(`should throw when trying to run 'COMMIT' manually`, async () => {
        await assert.rejects(async () => await db.query('COMMIT'), { message: `Manually handling transactions is forbidden. Use 'db.transaction()' instead` });
    });

    it(`should throw when trying to run 'ROLLBACK' manually`, async () => {
        await assert.rejects(async () => await db.query('ROLLBACK'), { message: `Manually handling transactions is forbidden. Use 'db.transaction()' instead` });
    });

    it(`should throw when trying to run an INSERT query without transaction`, async () => {
        await assert.rejects(async () => await db.query(`INSERT INTO irrelevant (name) VALUES ('test')`), { message: `Cannot run 'INSERT' query without a transaction` });
    });

    it(`should throw when trying to run an UPDATE query without transaction`, async () => {
        await assert.rejects(async () => await db.query(`UPDATE irrelevant SET name = 'bob'`), { message: `Cannot run 'UPDATE' query without a transaction` });
    });

    it(`should throw when trying to run a DELETE query without transaction`, async () => {
        await assert.rejects(async () => await db.query(`DELETE FROM irrelevant`), { message: `Cannot run 'DELETE' query without a transaction` });
    });

    it(`should throw when trying to run a CREATE query without transaction`, async () => {
        await assert.rejects(async () => await db.query(`CREATE DATABASE irrelevant`), { message: `Cannot run 'CREATE' query without a transaction` });
    });

    it(`should throw when trying to run a DROP query without transaction`, async () => {
        await assert.rejects(async () => await db.query(`DROP DATABASE irrelevant`), { message: `Cannot run 'DROP' query without a transaction` });
    });

    it(`should throw when trying to run an ALTER query without transaction`, async () => {
        await assert.rejects(async () => await db.query(`ALTER TABLE irrelevant ADD COLUMN test INT(11) NOT NULL`), { message: `Cannot run 'ALTER' query without a transaction` });
    });

    it('should not insert into the database if transaction errors', async () => {
        const usersBefore = await db.getRows<User>('testing.users');
        assert.equal(usersBefore.length, 8);

        try {
            await db.transaction(async () => {
                const query = `
                    INSERT INTO testing.users (first_name, last_name, email)
                    VALUES
                        ('bob', 'thomas', 'thomasbob@gmail.com')
                `;
                await db.query(query, []);
                throw new Error('pretend_error');
            });
        } catch (err) {
            if (err.message !== 'pretend_error') {
                throw err;
            }
        }

        const usersAfter = await db.getRows<User>('testing.users');
        assert.equal(usersAfter.length, 8);
    });

    it(`should successfully commit to db if transaction doesn't error`, async () => {
        const usersBefore = await db.getRows<User>('testing.users');
        assert.equal(usersBefore.length, 8);

        await db.transaction(async () => {
            const query = `
                    INSERT INTO testing.users (first_name, last_name, email)
                    VALUES
                        ('bob', 'thomas', 'thomasbob@gmail.com')
                `;
            await db.query(query, []);
        });

        const usersAfter = await db.getRows<User>('testing.users');
        assert.equal(usersAfter.length, 9);
    });
});
