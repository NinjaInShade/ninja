import express from 'express';
import http from 'node:http';

// TODO: Remove express eventually

export default class HttpManager {
    private _app: ReturnType<typeof express>;
    private _server: http.Server;
    private port: number;

    constructor(port) {
        this.port = port;
    }

    /**
     * Initialises the http server
     */
    public startServer(listenCb?: () => void) {
        this._app = express();
        this._server = this._app.listen(this.port, () => {
            console.log('[http] server is listening on port', this.port);
            if (listenCb) {
                listenCb();
            }
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
            this._server.close((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
}
