# Changelog

All changes worth documenting will be listed in this file. The convention of versions used is semantic versioning.<br />
Refer to https://keepachangelog.com/en/1.0.0/ for how to maintain changelog<br />

## [Unreleased]

-

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
