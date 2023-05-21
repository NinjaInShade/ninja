# Changelog

All changes worth documenting will be listed in this file. The convention of versions used is semantic versioning.<br />
Refer to https://keepachangelog.com/en/1.0.0/ for how to maintain changelog<br />

## [Unreleased]

-   server must be started with `await server.start()`: core doesn't automatically do this anymore when calling `core.server()`
-   added `on()`, `once()`, `emit()` on socket obtained from `server.on('connection')`
-   added `server.on('connection' (socket) => {})`
-   added `server.once()`
-   added `client.once()`
-   `server.emit()` renamed to `server.broadcast()`
-   improved client/server socket event typings
-   improved client/server socket disposing. All `on()`, `once()` handlers have disposers returned for manual disposing too.
-   node export file renamed from server.ts to node.ts
-   added custom implementation of NodeJS `EventEmitter`
-   added `EventEmitter` tests
-   split `Client` `serverUrl` option into `domain` and `port` options
-   updated `port` option for `Client` & `Server` default value

## [0.1.0] - 30/03/2023

-   added observable
    -   has svelte store compatibility
    -   includes computed observable
-   added Client class
    -   created with `core.client()`
    -   can connect to websocket server
    -   can receive/emit socket messages
    -   can set/get client variables (non-observable right now)
-   added Server class
    -   created with `core.server()`
    -   can handle HTTP requests
    -   can upgrade to socket
    -   can receive/emit socket messages (only from any client/to all clients)
-   added native WebSocket server implementation
