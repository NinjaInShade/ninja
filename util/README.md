# **Ninja util library**

A bunch of utilities for use on the browser, server or both

**Note:** Requires node v19.6.0 for testing

## Features

-   Minimal dependencies
-   Easy to use

## Usage

Import util and start using straight away:

```ts
import util from '@ninjalib/util';

if (!util.isNode()) {
    throw new Error('This code must be run on the server');
}
```

## Docs

-   [Shared](#shared)
    -   [isBrowser](#isbrowser)
    -   [isNode](#isnode)
-   [Client](#client)
-   [Server](#server)
    -   [loadEnv](#loadenv)

## Shared

### isBrowser

Returns true if in a browser/client context

```ts
if (util.isBrowser()) {
    throw new Error('This code can only be run on the server');
}
```

### isNode

Returns true if in a server context

```ts
if (util.isNode()) {
    throw new Error('This code can only be run on the client');
}
```

## Client

## Server

### loadEnv

Loads environment files into `process.env`, similar to `dotenv` package

Parameters:

-   filePath?: path to the env file (defaults to current working directory)
-   force?: forcefully overwrites existing environment variables (defaults to false)

```ts
// call this as early in your application as possible
util.loadEnv();
```
