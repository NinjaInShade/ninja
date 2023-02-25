# **Ninja util library**

A bunch of utilities for use on the browser, server or both

**Note:** Requires node v19.6.0

## Features

-   Minimal dependencies
-   Easy to use

## Usage

To import and use util you can do:

```ts
import util from '@ninjalib/util';
```

This will give you access to the following:

-   `util.shared`
-   `util.client`
-   `util.server`

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
if (util.shared.isBrowser()) {
    throw new Error('This code can only be run on the server');
}
```

### isNode

Returns true if in a server context

```ts
if (util.shared.isNode()) {
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
util.server.loadEnv();
```
