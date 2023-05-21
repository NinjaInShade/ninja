import WebSocketServer from './WsServer';
import type http from 'node:http';
import type { Socket } from './Socket';
import { type AcceptableSocketData } from '~/node';

// TODO: Add type for accepted Serializable value

type Disposer = () => void;
type DataHandler = (socket: Socket, data?: AcceptableSocketData) => void;

type EventsMap = {
    connection: (socket: Socket) => void;
    disconnect: (socket: Socket) => void;
    error: (socket: Socket, err: Error) => void;
};

export type HandlerFn<Once = false> = {
    <T extends keyof EventsMap>(event: T, handler: EventsMap[T], once?: Once extends true ? true : never): Disposer;
    (event: string, handler: DataHandler, once?: Once extends true ? true : never): Disposer;
    <T extends keyof EventsMap>(event: T | string, handler: EventsMap[T] | DataHandler, once?: Once extends true ? true : never): Disposer;
};

const SPECIAL_EVENTS: (keyof EventsMap)[] = ['connection', 'disconnect', 'error'];

/**
 * Manages the low-level WebSocket server
 *
 * This classes job is to communicate with the low-level
 * thing to give the server a high-level API to work with
 */
export default class SocketManager {
    private httpServer: http.Server;
    private wsServer: WebSocketServer;

    constructor(httpServer: http.Server) {
        this.httpServer = httpServer;
        this.wsServer = new WebSocketServer(this.httpServer);
    }

    public get clients() {
        return this.wsServer.clients;
    }

    /**
     * Listens for socket messages from any client
     */
    public on: HandlerFn = (event, handler) => {
        return this.createOnHandler(event, handler);
    };

    /**
     * Listens for socket messages from any client
     */
    public once: HandlerFn<true> = (event, handler) => {
        return this.createOnHandler(event, handler, true);
    };

    /**
     * Emits a socket message to all clients
     */
    public broadcast(event: string, data?: AcceptableSocketData) {
        for (const socket of this.wsServer.clients.values()) {
            socket.emit(event, data);
        }
    }

    private createOnHandler: HandlerFn<true> = (event, handler, once) => {
        const method = once ? 'once' : 'on';

        let _eventName: string;
        let _handler: typeof handler;

        if (SPECIAL_EVENTS.includes(event)) {
            _eventName = `socket:${event}`;
            _handler = handler;
        } else {
            _eventName = 'socket:data';
            _handler = (socket: Socket, decodedEvent: string, data?: AcceptableSocketData) => {
                if (decodedEvent !== event || !socket.connected) {
                    return;
                }
                handler(socket, data);
            };
        }

        const disposer = this.wsServer[method](_eventName, _handler);
        return disposer;
    };

    public dispose() {
        this.wsServer.dispose();
    }
}
