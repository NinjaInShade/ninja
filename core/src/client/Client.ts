import SocketManager, { type HandlerFn } from './SocketManager';
import type { AcceptableSocketData } from '~/browser';
import { logger } from '@ninjalib/util';

const log = logger('nw:client');

type ClientOptions = {
    /**
     * server domain (e.g. localhost)
     *
     * @default localhost
     */
    domain?: string;
    /**
     * server port (e.g. 4405)
     *
     * @default 5656
     */
    port?: number;
};

export class Client {
    static _instance: Client;

    private options: ClientOptions;
    private socket: SocketManager;

    public variables: Record<string, any> = {};

    private reconnectInterval: ReturnType<typeof setInterval> | null = null;
    private reconnectAttempts = 0;

    constructor(options: ClientOptions = {}) {
        if (Client._instance) {
            log.warn('Client should only be initialised once in your project');
        }
        Client._instance = this;

        const defaultOptions = {
            domain: 'localhost',
            port: 5656,
        };
        this.options = Object.assign({}, defaultOptions, options);

        const serverURL = this.options.domain + ':' + this.options.port;
        this.socket = new SocketManager(serverURL);

        this.socket.on('disconnect', () => {
            if (this.reconnectInterval) {
                return;
            }

            this.reconnectAttempts += 1;

            const reconnect = () => {
                if (this.socket.readyState === 'CONNECTING' || this.socket.readyState === 'OPEN') {
                    return;
                }
                log.info('Socket disconnected, re-trying connection. Attempt number:', this.reconnectAttempts);
                void this.connect()
                    .then(() => {
                        if (this.reconnectInterval) {
                            clearInterval(this.reconnectInterval);
                            this.reconnectInterval = null;
                        }
                        this.reconnectAttempts = 0;
                    })
                    .catch((err) => {
                        log.warn('Got error whilst reconnecting:', err);
                    });
            };

            // we want to try to reconnect immediately
            reconnect();

            this.reconnectInterval = setInterval(() => {
                reconnect();
            }, 2500);
        });
    }

    /**
     * Connects to the server
     *
     * Enables websocket communication
     */
    public async connect() {
        try {
            await this.socket.connect();
        } catch (err) {
            log.warn('Could not connect to server', err?.message ?? err);
        }
    }

    /**
     * Listens for socket messages from the server
     */
    public on: HandlerFn = (event, handler) => {
        return this.socket.on(event, handler);
    };

    /**
     * Adds a one-time Listener for socket messages from the server
     */
    public once: HandlerFn<false> = (event, handler) => {
        return this.socket.once(event, handler);
    };

    /**
     * Emits a socket message to the server
     */
    public emit(event: string, data?: AcceptableSocketData) {
        this.socket.emit(event, data);
    }

    /**
     * Set a client variable
     */
    public set(key: string, value: any): void {
        if (value === undefined && !(key in this.variables)) {
            return;
        }
        if (value === undefined && key in this.variables) {
            delete this.variables[key];
            return;
        }
        this.variables[key] = value;
    }

    /**
     * Retrieve a client variable
     */
    public get(key: string): any {
        return this.variables[key];
    }

    /**
     * Dispose client safely
     */
    public dispose() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }
        this.socket.dispose();
    }
}

export function client(opts?: ClientOptions) {
    return new Client(opts);
}
