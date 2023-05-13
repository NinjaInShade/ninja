import express from 'express';
import HttpManager from './HttpManager';
import SocketManager from './SocketManager';

type ServerOptions = {
    /**
     * Server port
     *
     * @default 5656
     */
    port?: number;
};

export class Server {
    static _instance: Server;

    private options: ServerOptions;
    /**
     * Core foundations of the server:
     * - HTTP manager (express manager right now essentially - ditch at some point)
     * - WebSocket manager
     */
    private httpManager: HttpManager;
    private socketManager: SocketManager;

    /**
     * public facing API for http things, which express provides
     */
    public http: ReturnType<typeof express>;

    constructor(options: ServerOptions = {}) {
        if (Server._instance) {
            console.warn('Server should only be initialised once in your project');
        }
        Server._instance = this;

        const defaultOptions = {
            port: 5656,
        };
        this.options = Object.assign({}, defaultOptions, options);

        this.httpManager = new HttpManager(this.options.port);
    }

    /**
     * Starts the http server & starts managing web sockets
     */
    public async startServer() {
        if (this.httpManager.server) {
            throw new Error('HTTP server cannot be started more than once');
        }

        await new Promise<void>((resolve) => {
            this.httpManager.startServer(() => {
                resolve();
            });
        });

        this.socketManager = new SocketManager(this.httpManager.server);
        this.http = this.httpManager.app;
    }

    /**
     * Listens for socket connections &
     * gives back a socket to work with an individual client
     */
    public onConnection(handler: (socket?: any) => void) {
        return this.socketManager.onConnection(handler);
    }

    /**
     * Listens for global socket event (from any client)
     */
    public on(event: string, handler: (data?: any) => void) {
        return this.socketManager.on(event, handler);
    }

    /**
     * Emits a global socket event (to all clients)
     */
    public broadcast(event: string, data?: any) {
        this.socketManager.broadcast(event, data);
    }

    /**
     * Dispose server safely
     */
    public async dispose() {
        await this.httpManager.dispose();
        await this.socketManager.dispose();
    }
}

export async function server(opts?: ServerOptions) {
    const server = new Server(opts);
    await server.startServer();
    return server;
}
