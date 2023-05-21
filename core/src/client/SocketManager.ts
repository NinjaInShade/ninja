import { emitter, type EventEmitter, encode, decode, type AcceptableSocketData } from '~/browser';

type Disposer = () => void;
type DataHandler = (data?: AcceptableSocketData) => void;

type EventsMap = {
    connect: () => void;
    disconnect: (closeInfo: { code: number; reason: string; wasClean: boolean }) => void;
    error: (type: string) => void;
};

export type HandlerFn<Once = false> = {
    <T extends keyof EventsMap>(event: T, handler: EventsMap[T], once?: Once extends true ? true : never): Disposer;
    (event: string, handler: DataHandler, once?: Once extends true ? true : never): Disposer;
    <T extends keyof EventsMap>(event: T | string, handler: EventsMap[T] | DataHandler, once?: Once extends true ? true : never): Disposer;
};

const SPECIAL_EVENTS: (keyof EventsMap)[] = ['connect', 'disconnect', 'error'];

/**
 * Manages the WebSocket object
 */
export default class ClientSocketManager {
    private socket: WebSocket | null = null;
    private emitter: EventEmitter;

    private disposeSocketListeners: (() => void) | null = null;

    constructor(public serverURL: string | undefined) {
        this.emitter = emitter();
    }

    public async connect() {
        if (!this.serverURL) {
            throw new Error('Server URL not given to SocketManager, so client cannot connect to the server');
        }
        if (this.socket) {
            throw new Error('Cannot connect more than once');
        }

        try {
            await new Promise<void>((resolve) => {
                this.socket = new WebSocket('ws://' + this.serverURL);
                this.setupSocketListeners(this.socket);
                this.once('connect', () => {
                    resolve();
                });
            });
        } catch (err) {
            this.socket = null;
            throw err;
        }
    }

    private setupSocketListeners(socket: WebSocket) {
        const handleConnect = () => {
            console.log(`[SocketManager] socket was opened`);
            this.emitter.emit('socket:connect');
        };

        const handleMessage = (ev) => {
            const { event, data } = decode(ev.data);
            this.emitter.emit('socket:data', { event, data });
        };

        const handleDisconnect = (event) => {
            const { code, reason, wasClean } = event;

            if (!wasClean) {
                console.error(`[SocketManager] socket was not closed cleanly, with code ${code}`);
            }

            this.afterDisconnect();
            this.emitter.emit('socket:disconnect', { code, reason, wasClean });
        };

        const handleError = (event) => {
            this.afterDisconnect();
            this.emitter.emit('socket:error', event.type);
        };

        socket.addEventListener('open', handleConnect);
        socket.addEventListener('message', handleMessage);
        socket.addEventListener('close', handleDisconnect);
        socket.addEventListener('error', handleError);

        this.disposeSocketListeners = () => {
            socket.removeEventListener('open', handleConnect);
            socket.removeEventListener('message', handleMessage);
            socket.removeEventListener('close', handleDisconnect);
            socket.removeEventListener('error', handleError);
            this.disposeSocketListeners = null;
        };
    }

    /**
     * Listens for socket messages
     */
    public on: HandlerFn = (event, handler) => {
        return this.createOnHandler(event, handler);
    };

    /**
     * Adds a one-time Listener for socket messages
     */
    public once: HandlerFn<false> = (event, handler) => {
        return this.createOnHandler(event, handler, true);
    };

    /**
     * Emits data to the server socket
     */
    public emit(event: string, data: any = undefined) {
        if (!this.socket || this.readyState === 'CONNECTING') {
            return;
        }
        if (['connect', 'disconnect', 'error'].includes(event)) {
            throw new Error(`Event ${event} cannot be emitted as it is a reserved event name`);
        }
        const encodedPacket = encode({ event, data });
        this.socket.send(encodedPacket);
    }

    public get readyState() {
        if (!this.socket) {
            return 'CLOSED';
        }

        switch (this.socket.readyState) {
            case 0:
                return 'CONNECTING';
            case 1:
                return 'OPEN';
            case 2:
                return 'CLOSING';
            case 3:
                return 'CLOSED';
            default:
                return 'UNKNOWN';
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
            _handler = (data: { event: string; data?: AcceptableSocketData }) => {
                if (data.event === event) {
                    handler(data.data);
                }
            };
        }

        const disposer = this.emitter[method](_eventName, _handler);
        return disposer;
    };

    private close(code?: number, reason?: string) {
        if (!this.socket) {
            return;
        }
        if (code && !reason) {
            throw new Error('[SocketManager] you must specify a reason when closing if passing in custom code');
        }
        if (this.readyState === 'CLOSING') {
            console.warn('[SocketManager] close called more than once');
            return;
        }
        this.socket.close(code, reason);
        this.afterDisconnect();
    }

    private afterDisconnect() {
        this.socket = null;
        if (this.disposeSocketListeners) {
            this.disposeSocketListeners();
        }
    }

    public dispose() {
        // close socket
        if (this.socket) {
            this.close();
        }

        // remove local listeners
        this.emitter.removeAllListeners('socket:data');
        this.emitter.removeAllListeners('socket:open');
        this.emitter.removeAllListeners('socket:disconnect');
        this.emitter.removeAllListeners('socket:error');
    }
}
