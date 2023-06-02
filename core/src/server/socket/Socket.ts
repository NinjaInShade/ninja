import core from '~/node';
import type net from 'node:net';
import type WebSocketServer from './WsServer';
import { createFrame, createDataQueue } from './utils';
import { encode, decode, type AcceptableSocketData } from '~/node';
import util from '@ninjalib/util';

const log = util.logger('nw:socket');

export type ID = string;

type Disposer = () => void;
type DataHandler = (data?: AcceptableSocketData) => void;

type EventsMap = {
    disconnect: () => void;
    rawData: (data?: string) => void;
    error: (err: Error) => void;
};

export type HandlerFn<Once = false> = {
    <T extends keyof EventsMap>(event: T, handler: EventsMap[T], once?: Once extends true ? true : never): Disposer;
    (event: string, handler: DataHandler, once?: Once extends true ? true : never): Disposer;
    <T extends keyof EventsMap>(event: T | string, handler: EventsMap[T] | DataHandler, once?: Once extends true ? true : never): Disposer;
};

const SPECIAL_EVENTS: (keyof EventsMap)[] = ['disconnect', 'error', 'rawData'];

/**
 * Manages a clients socket object
 */
export class Socket {
    private server: WebSocketServer;
    private emitter: core.EventEmitter = core.emitter();

    private disposeSocketListeners: (() => void) | null = null;

    public rawSocket: net.Socket;
    public connected = true;
    public id: ID;

    constructor(wsServer: WebSocketServer, rawSocket: net.Socket, clientId: ID) {
        this.server = wsServer;
        this.rawSocket = rawSocket;
        this.id = clientId;

        log.debug('Created client:', this.id);

        const queue = createDataQueue(this, (payload: string) => {
            this.emitter.emit('socket:data', payload);
            this.emitter.emit('socket:rawData', payload);
        });

        const queueData = (data: Buffer) => {
            if (!this.connected) {
                return;
            }

            // since data isn't necessarily the whole message,
            // and we don't know the FIN yet, we have to queue it,
            // and handle the complete data in a different place
            queue.add(data);
        };

        const handleDisconnect = () => {
            this.afterDisconnect();
            this.emitter.emit('socket:disconnect');
        };

        const handleError = (err: Error) => {
            // handleDisconnect is called after 'error' has been emitted
            // so we don't need to do it manually
            this.emitter.emit('socket:error', err);
        };

        this.rawSocket.on('data', queueData);
        this.rawSocket.on('close', handleDisconnect);
        this.rawSocket.on('error', handleError);

        this.disposeSocketListeners = () => {
            this.rawSocket.off('data', queueData);
            this.rawSocket.off('close', handleDisconnect);
            this.rawSocket.off('error', handleError);
            this.disposeSocketListeners = null;
        };
    }

    public on: HandlerFn = (event, handler) => {
        return this.createOnHandler(event, handler);
    };

    public once: HandlerFn = (event, handler) => {
        return this.createOnHandler(event, handler, true);
    };

    public emit(event: string, data?: AcceptableSocketData) {
        if (!this.connected) {
            return;
        }
        if (SPECIAL_EVENTS.includes(event)) {
            throw new Error(`Event ${event} cannot be emitted as it is a reserved event name`);
        }
        log.debug('Sending payload to client', this.id, ':', data);
        const encodedPacket = encode({ event, data });
        const frame = createFrame(encodedPacket);
        this.rawSocket.write(frame);
    }

    // TODO: should be extrapolated as a util eventually
    private createOnHandler: HandlerFn<true> = (event, handler, once) => {
        const method = once ? 'once' : 'on';

        let _eventName: string;
        let _handler: typeof handler;

        if (SPECIAL_EVENTS.includes(event)) {
            _eventName = `socket:${event}`;
            _handler = handler;
        } else {
            _eventName = 'socket:data';
            _handler = (payload: string) => {
                const { event: decodedEvent, data } = decode(payload);
                if (decodedEvent !== event || !this.connected) {
                    return;
                }
                handler(data);
            };
        }

        const disposer = this.emitter[method](_eventName, _handler);
        return disposer;
    };

    private close() {
        this.rawSocket.end();
        this.afterDisconnect();
    }

    private afterDisconnect() {
        this.connected = false;
        if (this.disposeSocketListeners) {
            this.disposeSocketListeners();
        }
    }

    public dispose() {
        // close socket
        if (this.connected) {
            this.close();
        }

        // dispose local listeners
        this.emitter.removeAllListeners('socket:data');
        this.emitter.removeAllListeners('socket:disconnect');
        this.emitter.removeAllListeners('socket:error');
    }
}
