import express from 'express';
import http from 'node:http';
import { logger } from '@ninjalib/util';
import { type Socket } from 'node:net';

const log = logger('nw:http');

// TODO: Remove express eventually

export type Express = ReturnType<typeof express>;

export default class HttpManager {
    private _app: Express;
    private _server: http.Server | null = null;
    private port: number;

    private openConnections = new Set<Socket>();

    constructor(port) {
        this.port = port;
        this._app = express();

        this._app.use(express.json());

        this._app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });
    }

    /**
     * Initialises the http server
     */
    public async startServer() {
        await new Promise<void>((resolve) => {
            const httpServer = this._app.listen(this.port, () => {
                log.info('Server is listening on port', this.port);
                resolve();
            });
            this._server = httpServer;

            httpServer.on('connection', (socket) => {
                this.openConnections.add(socket);
                httpServer.once('close', () => {
                    this.openConnections.delete(socket);
                });
            });
        });
    }

    /**
     * The express app
     */
    public get app() {
        return this._app;
    }

    /**
     * The http server
     */
    public get server() {
        return this._server;
    }

    /**
     * Disposes safely of the http server
     */
    public async dispose() {
        return new Promise<void>((resolve, reject) => {
            const httpServer = this._server;

            if (!httpServer || !httpServer.listening) {
                resolve();
                return;
            }

            // handles Keep-Alive connections
            for (const socket of this.openConnections) {
                socket.destroy();
                this.openConnections.delete(socket);
            }

            httpServer.close((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
}
