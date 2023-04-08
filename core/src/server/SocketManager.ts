import type http from 'node:http';
import WebSocketServer from './WebSocketServer';

type Listener = (data: any) => void;
type MessageListeners = Record<string, Listener[]>;
type MessageListenerDisposer = () => void;

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
            const parsedData = JSON.parse(data);

            // inform listeners
            const listeners = this.messageListeners[parsedData.eventName];
            if (listeners) {
                for (const handler of listeners) {
                    delete parsedData.eventName;
                    handler(parsedData.data);
                }
            }
        });
    }

    /**
     * Listens for socket event
     */
    public on(eventName: string, callback: (data?) => void): MessageListenerDisposer {
        if (eventName in this.messageListeners) {
            this.messageListeners[eventName].push(callback);
        } else {
            this.messageListeners[eventName] = [callback];
        }

        return () => {
            const filteredListeners = this.messageListeners[eventName].filter((cb) => cb !== callback);
            this.messageListeners[eventName] = filteredListeners;
        };
    }

    /**
     * Emits a socket event to all clients
     */
    public emit(eventName: string, data?: any) {
        const fullData = {
            eventName,
            data,
        };
        this.webSocketServer.send(JSON.stringify(fullData));
    }

    public async dispose() {
        // this.close();
    }
}
