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

describe('MySQL queries', async () => {
    let db: sql.MySQL;

    const rollbackHook = async (fn: Function) => {
        try {
            await db.transaction(async (tx) => {
                await fn(tx);
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
        const createTableQuery = `
            CREATE TABLE query_test (
                id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) DEFAULT NULL,
                email VARCHAR(255) NOT NULL,
                created TIMESTAMP NOT NULL DEFAULT NOW(),
                timestamp TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `;
        const insertDataQuery = `
            INSERT INTO query_test (first_name, last_name, email)
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
        await db.query(`DROP TABLE query_test`);
        await db.dispose();
    });

    it('[query] should throw if query param is undefined', async () => {
        await assert.rejects(async () => await db.query<User>('SELECT * FROM query_test WHERE first_name = ?', [undefined]), {
            message: 'Query parameter 1 is undefined',
        });
    });

    it('[query] should throw if table does not exist', async () => {
        await assert.rejects(async () => await db.query<User>('SELECT * FROM not_defined'), {
            message: `Query failed: Table 'test.not_defined' doesn't exist`,
        });
    });

    it('[query] should throw if column in where condition does not exist', async () => {
        await assert.rejects(async () => await db.query<User>('SELECT * FROM query_test WHERE not_defined = ?', ['test']), {
            message: `Query failed: Unknown column 'not_defined' in 'where clause'`,
        });
    });

    it('[getRows] should get all rows', async () => {
        const query_test = await db.getRows<User>('query_test');
        assert.equal(query_test.length, 8);
    });

    it('[getRows] should get all rows based on where condition', async () => {
        const query_test = await db.getRows<User>('query_test', { first_name: 'leon' });
        assert.equal(query_test.length, 2);
    });

    it('[getRows] should return empty array if no matches found', async () => {
        const query_test = await db.getRows<User>('query_test', { first_name: 'not', last_name: 'defined' });
        assert.equal(query_test.length, 0);
    });

    it('[getRow] should get row', async () => {
        const user = await db.getRow<User>('query_test');
        assert.equal(user.first_name, 'leon');
        assert.equal(user.last_name, 'michalak');
        assert.equal(user.email, 'leonmichalak@gmail.com');
    });

    it('[getRow] should get row based on where condition', async () => {
        const user = await db.getRow<User>('query_test', { first_name: 'mike', last_name: 'tyson' });
        assert.equal(user.first_name, 'mike');
        assert.equal(user.last_name, 'tyson');
        assert.equal(user.email, 'miketyson@gmail.com');
    });

    it('[getRow] should return default value if no row found', async () => {
        const user = await db.getRow<User, string>('query_test', { first_name: 'made', last_name: 'up' }, 'not_found');
        assert.equal(user, 'not_found');
    });

    it(`[insertOne] should insert an entry into the database and return every created rows' id`, async () => {
        await rollbackHook(async () => {
            const id = await db.insertOne('query_test', { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' });
            const newRow = await db.getRow<User>('query_test', { id });
            assert.equal(newRow.first_name, 'new');
            assert.equal(newRow.last_name, 'guy');
            assert.equal(newRow.email, 'newguy@gmail.com');
        });
    });

    it(`[insertMany] should throw when datasets fields don't all match`, async () => {
        await rollbackHook(async () => {
            const data = [
                { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' },
                { first_name: 'new2', last_name: 'guy', email: 'newguy2@gmail.com', unexpected_field: 'test' },
                { first_name: 'new3', last_name: 'guy', email: 'newguy3@gmail.com' },
            ];
            await assert.rejects(async () => await db.insertMany('query_test', data), {
                message: `Got field mismatch, 'unexpected_field' isn't part of the fields. Make sure every dataset has the same fields`,
            });
        });
    });

    it(`[insertMany] should insert many entries into the database and returns the id of the first inserted row`, async () => {
        await rollbackHook(async () => {
            const data = [
                { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' },
                { first_name: 'new2', last_name: 'guy', email: 'newguy2@gmail.com' },
                { first_name: 'new3', last_name: 'guy', email: 'newguy3@gmail.com' },
                { first_name: 'new4', last_name: 'guy', email: 'newguy4@gmail.com' },
                { first_name: 'new5', last_name: 'guy', email: 'newguy5@gmail.com' },
            ];
            await db.insertMany('query_test', data);
            assert.ok(await db.getRow<User>('query_test', { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' }));
            assert.ok(await db.getRow<User>('query_test', { first_name: 'new2', last_name: 'guy', email: 'newguy2@gmail.com' }));
            assert.ok(await db.getRow<User>('query_test', { first_name: 'new3', last_name: 'guy', email: 'newguy3@gmail.com' }));
            assert.ok(await db.getRow<User>('query_test', { first_name: 'new4', last_name: 'guy', email: 'newguy4@gmail.com' }));
            assert.ok(await db.getRow<User>('query_test', { first_name: 'new5', last_name: 'guy', email: 'newguy5@gmail.com' }));
        });
    });

    it(`[upsert] should throw when datasets fields don't all match`, async () => {
        await rollbackHook(async () => {
            const data = [
                { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' },
                { first_name: 'new2', last_name: 'guy', email: 'newguy2@gmail.com', unexpected_field: 'test' },
                { first_name: 'new3', last_name: 'guy', email: 'newguy3@gmail.com' },
            ];
            await assert.rejects(async () => await db.upsert('query_test', data), {
                message: `Got field mismatch, 'unexpected_field' isn't part of the fields. Make sure every dataset has the same fields`,
            });
        });
    });

    it(`[insertMany] should upsert entries into the database`, async () => {
        await rollbackHook(async () => {
            // Insert initial data
            const data = [
                { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' },
                { first_name: 'new2', last_name: 'guy', email: 'newguy2@gmail.com' },
            ];
            const firstCreatedId = await db.insertMany('query_test', data);
            const insertedRows = await db.getRow<User, null>('query_test', { id: firstCreatedId });
            if (!insertedRows) {
                throw new Error('Expected inserted row');
            }

            // upsert data
            await db.upsert('query_test', [
                { id: insertedRows.id, first_name: 'new-upserted', email: insertedRows.email },
                { id: null, first_name: 'new-inserted', email: 'newguyupserted@gmail.com' },
            ])

            // We updated this rows name
            assert.ok(await db.getRow<User>('query_test', { first_name: 'new-upserted', last_name: 'guy', email: 'newguy@gmail.com' }));

            // We left this row alone
            assert.ok(await db.getRow<User>('query_test', { first_name: 'new2', last_name: 'guy', email: 'newguy2@gmail.com' }));

            // We inserted this new row
            assert.ok(await db.getRow<User>('query_test', { first_name: 'new-inserted', email: 'newguyupserted@gmail.com' }));
        });
    });

    it(`[delete] should not delete any rows if conditions aren't matched`, async () => {
        await rollbackHook(async () => {
            const data = [
                { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' },
                { first_name: 'new2', last_name: 'guy', email: 'newguy2@gmail.com' },
            ];
            await db.insertMany('query_test', data);

            const rowsAmount = (await db.getRows('query_test')).length;

            // Delete with conditions that will never match
            await db.delete('query_test', { email: 'never-going-to-match' })

            // Assert no rows were deleted
            const rowsAmountAfterDelete = (await db.getRows('query_test')).length;
            assert.equal(rowsAmount, rowsAmountAfterDelete);
        })
    })

    it(`[delete] should only delete rows where conditions are matched`, async () => {
        await rollbackHook(async () => {
            const data = [
                { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' },
                { first_name: 'new2-for-delete', last_name: 'guy', email: 'newguy2@gmail.com' },
            ];
            await db.insertMany('query_test', data);

            const rowsAmount = (await db.getRows('query_test')).length;

            // Delete with conditions that will only match one of our rows
            await db.delete('query_test', { first_name: 'new2-for-delete' });

            // Assert only 1 row was deleted
            const rowsAmountAfterDelete = (await db.getRows('query_test')).length;
            assert.equal(rowsAmount - 1, rowsAmountAfterDelete);

            // Assert it was the correct row that was deleted
            const missingRow = await db.getRow('query_test', { first_name: 'new2-for-delete' });
            assert.deepEqual(missingRow, null);
        })
    })

    it(`[delete] should delete all rows if no conditions given`, async () => {
        await rollbackHook(async () => {
            const data = [
                { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' },
                { first_name: 'new2-for-delete', last_name: 'guy', email: 'newguy2@gmail.com' },
            ];
            await db.insertMany('query_test', data);

            // Delete with no conditions
            await db.delete('query_test');

            // Assert no rows remain
            const rowsAmountAfterDelete = (await db.getRows('query_test')).length;
            assert.equal(rowsAmountAfterDelete, 0);
        })
    })
});
