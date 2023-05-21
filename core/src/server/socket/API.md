# **Plan**

The plan for @ninjalib socket communication (both client & server). APIs are the public APIs, not private.

Their APIs should match where possible and be simple to use.

**Reference:**

-   [Shared](#client--server-shared)
-   [Client](#client)
-   [Server](#server)
    -   [SocketManager](#socketmanager)
    -   [Socket](#socket)
    -   [WebSocketServer](#websocketserver)

## **Client & Server (shared)**

All that is currently needed to be shared is the encoding/decoding of messages that will be sent/received through the socket.

The `encode()` function should take in an "toEncode" object that currently only consists of the "event" and the "data". It then transforms it into a string that can be sent over the wire.

The `decode()` function takes in a string (a string that was encoded previously) and parses it into the original object that consists of "event" and "data".

## **Client**

The server socket communication on the client should all be facilitated with:

-   the native javascript `WebSocket` object.
-   a single `SocketManager` class. This will handle connecting, handling socket events and emitting data

Perhaps one day instead of using the in-built `WebSocket` object, a custom implementation could be written for fun but this does the job right now.

### API

-   `new SocketManager()`: takes in `serverURL`, which is the domain + port. The prefix "ws://" is automatically prepended.
-   `connect()`: attempts to connect to the server to establish communication.
-   `on(ev, (data) => void)`: listens for socket messages with the "ev" event, calling back the handler function with the incoming data. Returns a disposer for manual disposing if you wish to do so yourself.
    -   there are special events that can be listened to that aren't incoming socket data, but instead internal events
    -   these are: 'connect', 'disconnect', 'error'. The names hopefully are self-explanatory
    -   their handle functions (2nd param to `on()`) most likely differ from what is above. Check the typings for what is accepted.
-   `once(ev, (data) => void)`: the same as on() but adds a one-time listener instead that is disposed itself after the first time being fired. Still returns a disposer incase of wanting to dispose manually before this happens.
-   `emit(ev, data)`: sends data to the server with the "ev" event.
    -   some special event names are forbidden to use (see above: `on()`). These are emitting internally automatically and can't be used.
-   `readyState`: a getter for the state of the socket. Can either be 'CLOSED', 'CONNECTING', 'OPEN' or 'UNKNOWN'.
-   `dispose()`: disposes the socket and all listeners.

## **Server**

Here is the plan of the API and the responsibilities for both the `WebSocketServer` (low-level) & `SocketManager` (high-level)

The server socket APIs are slightly different in places as we are responsible for dealing with multiple clients, whereas on the client we are just dealing with one client (the server essentially).

### **SocketManager**

The `SocketManager` is a high-level abstraction of the low level socket server. This is the API that should be as close as possible to the client socket API.

Note: there is no "connect" method. Once the socket manager class is constructed, any http upgrade requests sent are processed straight away.

Another note: When socket is mentioned, it is referring to the abstracted `Socket` class, not a raw `net.Socket` socket, unless explicitly said.

### API

-   `new SocketManager()`: takes in `httpServer`, which is just a standard `http.Server`
-   `on(ev, (data, socket) => void)`: listens for incoming socket messages (from any client) with the "ev" event, calling back the handler function with the incoming data and the clients socket. Returns a disposer for manual disposing if you wish to do so yourself.
    -   there are special events that can be listened to that aren't incoming socket data, but instead internal events
    -   The events are 'connection' and also all the events `Socket` provides.
    -   their handle functions (2nd param to `on()`) most likely differ from what is above. Check the typings for what is accepted.
-   `once(ev, (data, socket) => void)`: the same as on() but adds a one-time listener instead that is disposed itself after the first time being fired. Still returns a disposer incase of wanting to dispose manually before this happens.
-   `broadcast(ev, data)`: sends data to every client with the "ev" event. Note, this is not named `emit()` to avoid confusion, as this is going to every client.
    -   some special event names are forbidden to use (see above: `on()`). These are emitting internally automatically and can't be used.
-   `clients`: a getter of all currently connected clients/sockets. This is a map of `<ID, Socket>`
-   `dispose()`: calls dispose on the web socket server underneath.

### **Socket**

This represents a client and is what is used to communicate with an individual client. It can be obtained via the callback from `on('connection', (socket) => void)` on `SocketManager`. The getter `clients` also returns a Map of `<ID, Socket>` so can be used to loop over and use this way.

Note: sometimes a socket is referred to as a client, they are the same thing in this context.

It is constructed internally within the WebSocketServer.

### API

-   `new Socket()`: takes in `wsServer`, an instance of `WebSocketServer`, `rawSocket`, the raw `net.Socket` object and a `clientId` that can uniquely identify itself.
-   `on(ev, (data) => void)`: same as `SocketManager` `on()`, but only listens for incoming messages from this client.
    -   the special events available are 'disconnect', 'error', 'rawData'. Raw data is the data before it has been decoded, checked if event matches & if socket is still connected.
-   `once(ev, (data) => void)`: same as `on()` but is only a one-time listener (again, very similar to `SocketManager` `once()`).
-   `emit(ev, data)`: sends data to the server with the "ev" event.
    -   some special event names are forbidden to use (see above: `on()`). These are emitting internally automatically and can't be used.
-   `id`: the ID of the client.
-   `connected`: whether the socket is connected.
-   `dispose()`: closes socket cleanly and cleans up listeners

### **WebSocketServer**

The low-level web socket manager. It's responsible for listening for HTTP upgrades, performing a handshake, and creating the client.

Note: currently it can't be used as a client, only acting a server implementation which handles incoming requests and communications.

This should mainly consist of a lot of internal bits, and a minimal public API - offloading as much as possible to the Socket object so data receiving/sending only happens in one spot.

### API

-   `new WebSocketServer()`: takes in `server` which is a standard `http.Server`.
-   `dispose()`: closes all connected `Socket`s and cleans up listener

## High-level file structure overview

-   Shared
    -   parser.ts
    -   types.ts
-   Client
    -   SocketManager.ts
-   Server
-   Manager.ts
-   Socket.ts
-   WsServer.ts
