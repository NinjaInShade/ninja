import express from 'express';
import http from 'node:http';

export default class SocketManager {
    private server: http.Server;

    constructor(server: http.Server) {
        this.server = server;

        this.server.on('upgrade', (req, socket, head) => {
            console.log('Upgrading!');
        });
    }

    /**
     * Disposes safely
     */
    public async dispose() {
        //
    }
}
