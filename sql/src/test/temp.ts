import ns from '../index.js';

const db = new ns.MySQL({ database: 'tracker', password: 'test' });
await db.connect();

const query = `
    INSERT INTO ?? (name)
    VALUES
      ('Widgets'),
      ('Core'),
      ('Util')
`;
await db.transaction(async () => {
    const results = await db.query(query, ['global.projects']);
    console.log('RESULTS', results);
});
