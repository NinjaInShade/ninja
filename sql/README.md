# Ninja SQL ORM

This is a lightweight MySQL ORM

## Features

-   Easy way to connect
-   Prepared statement support
-   Transaction support
-   Plenty of helper functions

## Usage

First, create a new instance and connect

```ts
import ns from '@ninjalib/sql';
const db = new ns.MySQL({ user: 'root', host: 'localhost', database: 'application', password: 'the_password', port: 3306 });
await db.connect();
```

Then, you can get straight into it and use the methods given by the library:

```ts
const user = await db.query('SELECT * FROM users WHERE id = ?', [5]);
```

There is also transaction support:

```ts
await db.transaction(async () => {
    await db.query(`
        INSERT INTO users (name, email)
        VALUES ('Bob', 'bob@gmail.com')
    `);
});
```
