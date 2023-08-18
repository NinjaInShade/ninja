import express from 'express';
import http from 'node:http';
import { logger } from '@ninjalib/util';

const log = logger('nw:http');

// TODO: Remove express eventually

export type Express = ReturnType<typeof express>;

export default class HttpManager {
    private _app: Express;
    private _server: http.Server | null = null;
    private port: number;

    constructor(port) {
        this.port = port;
        this._app = express();

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
            this._server = this._app.listen(this.port, () => {
                log.info('Server is listening on port', this.port);
                resolve();
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
            if (!this._server || !this._server.listening) {
                return;
            }

            this._server.close((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
}
