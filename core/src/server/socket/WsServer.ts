import crypto from 'node:crypto';
import http from 'node:http';
import type net from 'node:net';
import { EventEmitter, decode } from '~/node';
import { Socket, type ID } from './Socket';
import { checkHeaders, generateWebSocketKey } from './utils';
import { logger } from '@ninjalib/util';

const log = logger('nw:wsServer');

/**
 * WebSocket server implementation
 *
 * Following official spec (https://datatracker.ietf.org/doc/html/rfc6455#section-4.2.1)
 *
 * With help from:
 * - (youtube) https://www.youtube.com/watch?v=qFoFKLI3O8w&list=PLSNlgS59kTgjfO8YLnS2K2sW0W6gG0oMo&index=39&t=1971s
 * - (gist) https://gist.github.com/yakovenkodenis/083c3a9443e09b7e0f08c92222373799#file-ws-js
 * - (spreadsheet) https://docs.google.com/spreadsheets/d/1KcTFjBRlosK0eV7BM4W8MLBZZNSkue1JzqIe2f31Fuo/edit#gid=0
 * - (spreadsheet) local copy also in my Google Drive available in case of deletion
 *
 * @author Leon Michalak <leonmichalak6@gmail.com>
 */
export default class WebSocketServer extends EventEmitter {
    private disposeHttpUpgrade: () => void;

    /** All connected clients */
    public clients: Map<ID, Socket> = new Map();

    constructor(private server: http.Server) {
        super();

        const onUpgrade = (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
            this.handleUpgrade(req, socket, head);
        };
        this.server.on('upgrade', onUpgrade);
        this.disposeHttpUpgrade = () => {
            this.server.off('upgrade', onUpgrade);
        };
    }

    private handleUpgrade(req: http.IncomingMessage, socket: net.Socket, head: Buffer) {
        const eol = '\r\n';

        function upgradeError() {
            // shouldn't send reason during upgrade if failed for security reasons
            socket.write('HTTP/1.1 400 Bad Request' + eol);
            socket.write(eol);
            socket.destroy();
            return;
        }

        const headers = req.headers;
        const reqSentByBrowser = Boolean(headers.origin);
        if (!reqSentByBrowser) {
            log.warn('HTTP upgrade was not sent by a browser client');
        }

        if (!checkHeaders(req)) {
            upgradeError();
            return;
        }

        // upgrade request was successful, send back response to let client know
        const secWebsocketKey = headers['sec-websocket-key'];
        // @ts-expect-error headers already checked in checkHeaders()
        const generatedWebSocketKey = generateWebSocketKey(secWebsocketKey);

        socket.write('HTTP/1.1 101 Switching Protocols' + eol);
        socket.write('Upgrade: websocket' + eol);
        socket.write('Connection: Upgrade' + eol);
        socket.write('Sec-WebSocket-Accept: ' + generatedWebSocketKey + eol);
        socket.write(eol);

        log.info('Successfully upgraded to a websocket connection');

        // setup client
        this.setupClient(socket);
    }

    private setupClient(sock: net.Socket) {
        const id = this.generateID();
        const socket = new Socket(this, sock, id);

        this.clients.set(socket.id, socket);

        // Make sure we're still connected
        if (this.clients.has(socket.id)) {
            this.emit('socket:connection', socket);
        }

        sock.on('close', () => {
            this.clients.delete(socket.id);
            this.emit('socket:disconnect', socket);
        });

        sock.on('error', (err) => {
            this.emit('socket:error', socket, err);
        });

        socket.on('rawData', (payload: string) => {
            const { event, data } = decode(payload);
            this.emit('socket:data', socket, event, data);
        });
    }

    /**
     * Generates a unique client ID
     */
    private generateID() {
        const registeredClients = this.clients;

        function gen() {
            // arbitrary
            const length = 20;
            return crypto
                .randomBytes(Math.ceil(length / 2))
                .toString('hex')
                .slice(0, length);
        }
        let id = gen();
        while (registeredClients.has(id)) {
            id = gen();
        }
        return id;
    }

    /**
     * Disposes safely
     */
    public dispose() {
        // Dispose sockets
        for (const socket of this.clients.values()) {
            socket.dispose();
        }

        // Remove HTTP upgrade listener
        this.disposeHttpUpgrade();
    }

    public static SEVEN_BIT_PAYLOAD_LENGTH = 125;
    public static SIXTEEN_BIT_PAYLOAD_LENGTH = 126;
    public static SIXTY_FOUR_BIT_PAYLOAD_LENGTH = 127;
    public static MASK_KEY_BYTES_LENGTH = 4;

    public static MAXIMUM_SIXTEEN_BITS_INTEGER = 2 ** 16; // 0 to 65536
    public static MAXIMUM_SIXTY_FOUR_BITS_INTEGER = 2 ** 64; // 0 to 1.8446744e+19

    public static OP_CODES = {
        continuation: 0x00,
        text: 0x01,
        binary: 0x02,
        nonControlFrames: [0x03, 0x04, 0x05, 0x06, 0x07],
        close: 0x08,
        ping: 0x09,
        pong: 0x0a,
        controlFrames: [0x0b, 0x0c, 0x0d, 0x0e, 0x0f],
    };
}
