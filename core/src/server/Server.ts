import express from 'express';
import HttpManager from './HttpManager';
import SocketManager from './SocketManager';

type ServerOptions = {
    /**
     * Server port
     */
    port?: number;
};

export class Server {
    static _instance: Server;

    private options: ServerOptions;
    /**
     * private http manager which contains:
     * - disposer
     * - http server initialiser
     * - the actual physical http server
     */
    private _http: HttpManager;
    /**
     * manager for all things socket related
     */
    private _socket: SocketManager;

    /**
     * public API facing http manager which express provides
     */
    public http: ReturnType<typeof express>;

    constructor(options: ServerOptions = {}) {
        if (Server._instance) {
            console.warn('Client should only be initialised once in your project!');
        }
        Server._instance = this;

        const defaultOptions = {
            port: 1337,
        };

        this.options = Object.assign({}, defaultOptions, options);
        this._http = new HttpManager(this.options.port);
    }

    /**
     * Starts the http server
     */
    public async startServer() {
        if (this._http.server) {
            throw new Error('HTTP server cannot be started more than once');
        }

        await new Promise<void>((resolve) => {
            this._http.startServer(() => {
                resolve();
            });
        });

        this._socket = new SocketManager(this._http.server);
        this.http = this._http.app;
    }

    /**
     * Listens for socket event from the client
     */
    public on(event: string, handler: (data: any) => void) {
        // this._socket.on(event, handler);
    }

    /**
     * Emits a socket event to the client
     */
    public emit(event: string, data: any) {
        // this._socket.emit(event, data);
    }

    /**
     * Dispose server safely
     */
    public async dispose() {
        await this._http.dispose();
    }
}

export async function server(opts?: ServerOptions) {
    const server = new Server(opts);
    await server.startServer();
    return server;
}
