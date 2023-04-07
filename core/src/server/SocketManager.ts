import type http from 'node:http';
import WebSocketServer from './WebSocketServer';

type Listener = (data: any) => void;
type MessageListeners = Record<string, Listener[]>;

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

    private messageListeners: MessageListeners = {};

    constructor(server: http.Server) {
        this.httpServer = server;
        this.webSocketServer = new WebSocketServer(this.httpServer);
        this.webSocketServer.onMessage((data) => {
            const _data = JSON.parse(data);

            // inform listeners
            const listeners = this.messageListeners[_data.__EVENT_NAME__];
            if (listeners) {
                for (const handler of listeners) {
                    delete _data.__EVENT_NAME__;
                    handler(_data);
                }
            }
        });
    }

    /**
     * Listens for socket event
     */
    public on(eventName: string, callback: (data) => void) {
        if (eventName in this.messageListeners) {
            this.messageListeners[eventName].push(callback);
        } else {
            this.messageListeners[eventName] = [callback];
        }
    }

    /**
     * Emits a socket event
     */
    public emit(eventName: string, data: any) {
        // if (this.readyState !== 'OPEN') {
        //     throw new Error('[socket] socket is not open, cannot emit data');
        // }
        const fullData = {
            __EVENT_NAME__: eventName,
            data,
        };
        this.webSocketServer.send(JSON.stringify(fullData));
    }

    public async dispose() {
        // this.close();
    }
}
