import { describe, it, before, after } from 'node:test';
import { getDB } from './testutil';
import assert from 'node:assert';
import sql from '~/index';

type User = {
    id: number;
    first_name: string;
    last_name: string | null;
    email: string;
    created: string;
    timestamp: string;
};

describe('MySQL transactions', async () => {
    let db: sql.MySQL;

    const setupData = async () => {
        await db.query(`DROP TABLE IF EXISTS tx_test`);
        const createTableQuery = `
            CREATE TABLE tx_test (
                id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) DEFAULT NULL,
                email VARCHAR(255) NOT NULL,
                created TIMESTAMP NOT NULL DEFAULT NOW(),
                timestamp TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `;
        const insertDataQuery = `
            INSERT INTO tx_test (first_name, last_name, email)
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
        await db.query(createTableQuery);
        await db.query(insertDataQuery);
    };

    before(async () => {
        db = await getDB();
        await setupData();
    });

    after(async () => {
        await db.query(`DROP TABLE tx_test`);
        await db.dispose();
    });

    it(`should throw when trying to run transaction queries manually`, async () => {
        const forbidden = ['START TRANSACTION', 'BEGIN', 'COMMIT', 'ROLLBACK'];
        for (const query of forbidden) {
            await assert.rejects(async () => await db.query(query), {
                message: `Manually handling transactions is forbidden. Use 'db.transaction()' instead`,
            });
        }
    });

    it('should have access to helpers', async () => {
        await db.transaction(async (tx) => {
            for (const method of Object.keys(db.helpers)) {
                assert.ok(method in tx);
                assert.ok(typeof tx[method] === 'function');
            }
        });
    });

    it('should not insert into the database if transaction errors', async () => {
        assert.equal((await db.getRows<User>('tx_test')).length, 8);
        try {
            await db.transaction(async (tx) => {
                await tx.insertOne('tx_test', { first_name: 'bob', last_name: 'thomas', email: 'thomasbob@gmail.com' });
                throw new Error('pretend_error');
            });
        } catch (err) {
            if (err.message !== 'pretend_error') {
                throw err;
            }
        }
        // should stay as 8 rows because transaction failed, so all queries should have been rolled back
        assert.equal((await db.getRows<User>('tx_test')).length, 8);
    });

    it(`should successfully commit to db if transaction doesn't error`, async () => {
        assert.equal((await db.getRows<User>('tx_test')).length, 8);
        await db.transaction(async (tx) => {
            await tx.insertOne('tx_test', { first_name: 'bob', last_name: 'thomas', email: 'thomasbob@gmail.com' });
        });
        // should be 9 rows now because transaction was committed
        assert.equal((await db.getRows<User>('tx_test')).length, 9);
    });

    it('should not leak queries within transactions into other connections', async () => {
        assert.equal((await db.getRows<User>('tx_test')).length, 9);
        await db.transaction(async (tx) => {
            // insert using transaction connection
            await tx.insertOne('tx_test', { first_name: 'bob', last_name: 'thomas', email: 'thomasbob@gmail.com' });
            // assert the new row exists in the transaction connection
            assert.equal((await tx.getRows<User>('tx_test')).length, 10);
            // assert the same amount of rows exist as before in the main connection
            assert.equal((await db.getRows<User>('tx_test')).length, 9);
        });
        // should be 10 rows now because transaction was committed
        assert.equal((await db.getRows<User>('tx_test')).length, 10);
    });

    it('should not leak queries within transactions into other transactions', async () => {
        assert.equal((await db.getRows<User>('tx_test')).length, 10);
        await db.transaction(async (tx) => {
            await db.transaction(async (tx2) => {
                // insert using transaction connection
                await tx.insertOne('tx_test', { first_name: 'bob', last_name: 'thomas', email: 'thomasbob@gmail.com' });
                // assert the new row exists in the transaction connection
                assert.equal((await tx.getRows<User>('tx_test')).length, 11);
                // assert the same amount of rows exist as before in the other transaction connection
                assert.equal((await tx2.getRows<User>('tx_test')).length, 10);
            });
        });
        // should be 11 rows now because transaction was committed
        assert.equal((await db.getRows<User>('tx_test')).length, 11);
    });
});
