import type http from 'node:http';
import WebSocketServer from './WebSocketServer';
import core from '~/node';

type Disposer = () => void;

// TODO: Add type for accepted Serializable value
// TODO: Error handling for JSON stringify/parse (create own encodeObject/decodeObject utils?)

/**
 * Manages the low-level WebSocket server
 *
 * This classes job is to communicate with the low-level
 * thing to give the server a high-level API to work with
 */
export default class SocketManager {
    private httpServer: http.Server;
    private webSocketServer: WebSocketServer;
    private emitter: core.EventEmitter;

    private messagesDispose: Disposer;

    constructor(server: http.Server) {
        this.httpServer = server;
        this.webSocketServer = new WebSocketServer(this.httpServer);
        this.emitter = core.emitter();

        this.messagesDispose = this.webSocketServer.onMessage((msg: { clientId: string; data: any }) => {
            const data = JSON.parse(msg.data);
            const clientId = msg.clientId;

            const event = data.event;
            delete data.event;

            this.emitter.emit('socket:data', { clientId, event, data });
        });
    }

    /**
     * Listens for connections, let's you talk with individual clients
     *
     * Must be called after HTTP manager has been initialised
     */
    public onConnection(callback: (socket?: any) => void): Disposer {
        const dispose = this.webSocketServer.onConnection(({ clientId, socket: rawSocket }) => {
            let clientDisconnected = false;

            // create Socket - TODO: create a socket class
            const socket = {
                clientId,
                emit: (event: string, data?: any) => {
                    if (clientDisconnected) {
                        return;
                    }
                    this.webSocketServer.send(JSON.stringify({ event, data }), clientId);
                },
                on: (event: string, callback: (data?: unknown) => void) => {
                    return this.emitter.on('socket:data', (data: { clientId: string; event: string; data?: unknown }) => {
                        if (data.event !== event || data.clientId !== clientId) return;
                        callback(data.data);
                    });
                },
            };

            rawSocket.on('close', () => {
                clientDisconnected = true;
            });

            // inform listener
            callback(socket);
        });

        return dispose;
    }

    /**
     * Listens for socket messages
     */
    public on(event: string, callback: (data?: unknown) => void): Disposer {
        return this.emitter.on('socket:data', (data: { clientId: string; event: string; data?: unknown }) => {
            if (data.event !== event) return;
            callback(data.data);
        });
    }

    /**
     * Emits a socket message to all clients
     */
    public broadcast(event: string, data?: any) {
        this.webSocketServer.send(JSON.stringify({ event, data }));
    }

    public async dispose() {
        this.messagesDispose();
        await this.webSocketServer.dispose();
    }
}
