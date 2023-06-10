import HttpManager, { type Express } from './HttpManager';
import SocketManager, { type HandlerFn } from './socket/Manager';
import { logger } from '@ninjalib/util';

const log = logger('nw:server');

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
    private socketManager: SocketManager | null = null;

    /**
     * public facing API for http things, which express provides
     */
    public http: Express;

    constructor(options: ServerOptions = {}) {
        if (Server._instance) {
            log.warn('Server should only be initialised once in your project');
        }
        Server._instance = this;

        const defaultOptions = {
            port: 5656,
        };
        this.options = Object.assign({}, defaultOptions, options);

        this.httpManager = new HttpManager(this.options.port);
        this.http = this.httpManager.app;

        const sigHandler = async (signal: NodeJS.Signals) => {
            log.info('Disposing because got', signal);
            await this.dispose().catch((err) => {
                throw err;
            });
        };

        process.once('SIGINT', async () => {
            await sigHandler('SIGINT');
        });
        process.once('SIGTERM', async () => {
            await sigHandler('SIGTERM');
        });
    }

    /**
     * Starts the http server & starts managing web sockets
     */
    public async start() {
        log.info('Starting server...');
        await this.httpManager.startServer();

        const httpServer = this.httpManager.server;
        if (!httpServer) {
            throw new Error('Expected HTTP server to be up and running');
        }

        this.socketManager = new SocketManager(httpServer);
    }

    /**
     * Listens for socket events
     */
    public on: HandlerFn = (event, handler) => {
        if (!this.socketManager) {
            throw new Error('Cannot call socket methods when server has not been started');
        }
        return this.socketManager.on(event, handler);
    };

    /**
     * Adds a one-time Listener for socket events
     */
    public once: HandlerFn<true> = (event, handler) => {
        if (!this.socketManager) {
            throw new Error('Cannot call socket methods when server has not been started');
        }
        return this.socketManager.once(event, handler);
    };

    /**
     * Emits a global socket event (to all clients)
     */
    public broadcast(event: string, data?: any) {
        if (!this.socketManager) {
            throw new Error('Cannot call socket methods when server has not been started');
        }
        this.socketManager.broadcast(event, data);
    }

    /**
     * Dispose server safely
     */
    public async dispose() {
        const start = Date.now();
        log.info('Disposing server...');

        await this.httpManager.dispose();
        if (this.socketManager) {
            this.socketManager.dispose();
        }

        const end = Date.now();
        const timeTaken = `${end - start}ms`;
        log.good('Disposed server safely in:', timeTaken);
    }
}

export function server(opts?: ServerOptions) {
    const server = new Server(opts);
    return server;
}
