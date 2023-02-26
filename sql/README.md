# **Ninja SQL library**

A lightweight MySQL ORM

**Note:** Requires node v19.6.0 for testing

## Features

-   Easy way to connect
-   Prepared statement support
-   Transaction support
-   Plenty of helper functions
-   Easily type return values with generics

## Usage

First, create a new instance and connect

```ts
import sql from '@ninjalib/sql';
const db = new sql.MySQL({ user: 'root', host: 'localhost', database: 'application', password: 'the_password', port: 3306 });
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

## Docs

-   [Helpers](#helpers)
    -   [getRows](#getrows)
    -   [getRow](#getrow)
    -   [insertOne](#insertone)
    -   [insertMany](#insertmany)

## Helpers

### getRows

Returns rows found from the given table and conditions

Parameters:

-   table: name of the table to query from
-   where?: object of conditions for the select (defaults to no conditions)

```ts
const users = await db.getRows<User>('auth.users', { archived: null });
```

### getRow

Returns first row found from the given table and conditions

Parameters:

-   table: name of the table to query from
-   where?: object of conditions for the select (defaults to no conditions)
-   defaultValue?: the fallback value to use if no row was found (defaults to null)

```ts
const user = await db.getRow<User>('auth.users', { first_name: 'mike', last_name: 'tyson', archived: null });

// Can easily type fallback value
const notFoundUser = await db.getRow<User, 'not_found'>('auth.users', { first_name: 'not', last_name: 'defined' }, 'not_found');
```

### insertOne

Inserts one row into the given table and returns the created rows' id

Parameters:

-   table: name of the table to insert into
-   data: object of data that maps to the field and value that will be inserted

```ts
const id = await db.insertOne<number>('auth.users', { first_name: 'mike', last_name: 'tyson' });
```

### insertMany

Inserts multiple rows into the given table and returns the first created rows' id

Parameters:

-   table: name of the table to insert into
-   data: array of data that maps to the field and value that will be inserted per object

```ts
const data = [
    { first_name: 'new', last_name: 'guy', email: 'newguy@gmail.com' },
    { first_name: 'new2', last_name: 'guy', email: 'newguy2@gmail.com' },
    { first_name: 'new3', last_name: 'guy', email: 'newguy3@gmail.com' },
    { first_name: 'new4', last_name: 'guy', email: 'newguy4@gmail.com' },
    { first_name: 'new5', last_name: 'guy', email: 'newguy5@gmail.com' },
];

const firstId = await db.insertMany<number>('auth.users', data);
```
