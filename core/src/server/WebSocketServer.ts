import crypto from 'node:crypto';
import http from 'node:http';
import type net from 'node:net';
import { EventEmitter } from '~/node';

type OnPayload = (msg: { clientId: string; data: any }) => void;
type OnConnection = (data: { clientId: string; socket: net.Socket }) => void;

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

    private server: http.Server;

    /** Essentially all clients */
    public clients: Map<string, net.Socket> = new Map();

    constructor(server: http.Server) {
        super();
        this.server = server;

        this.server.on('upgrade', (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
            this.handleUpgrade(req, socket, head);
        });
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

        if (!this.checkHeaders(req)) {
            upgradeError();
            return;
        }

        // upgrade request was successful, send back response to let client know
        const secWebsocketKey = headers['sec-websocket-key'];
        const generatedWebSocketKey = this.generateWebSocketKey(secWebsocketKey);

        socket.write('HTTP/1.1 101 Switching Protocols' + eol);
        socket.write('Upgrade: websocket' + eol);
        socket.write('Connection: Upgrade' + eol);
        socket.write('Sec-WebSocket-Accept: ' + generatedWebSocketKey + eol);
        socket.write(eol);

        console.log('[wss] server has upgraded to a websocket connection');

        // connection is open, can process events for this client
        this.setupClient(socket);
    }

    /**
     * Registers a callback, which when a new connection comes in, will be executed with the client's socket
     */
    public onConnection(callback: OnConnection) {
        return this.on('socket:connection', callback);
    }

    /**
     * Registers a callback, which when data comes in, will be executed with the incoming payload
     */
    public onMessage(callback: OnPayload) {
        return this.on('socket:msg', callback);
    }

    /**
     * Send message over the wire
     *
     * @param data: the data that you wish to send
     * @param clientId: the client to send the data too. If this isn't passed, the message is sent to all clients
     */
    public send(data?: any, clientId?: string) {
        const frame = this.createFrame(data);
        const clientIds: string[] = clientId ? [clientId] : [...this.clients.keys()];

        for (const clientId of clientIds) {
            const socket = this.clients.get(clientId);
            if (!socket) {
                console.log('[wss] tried to send a message to client that does not exist with ID:', clientId);
                continue;
            }
            console.log('[wss] sending payload to client', clientId, ':', frame.toString('utf-8'));
            socket.write(frame);
        }
    }

    private setupClient(socket: net.Socket) {
        // Create client ID & register it
        const clientId = this.generateClientId();
        this.clients.set(clientId, socket);
        console.log('[wss] Created client:', clientId);

        // could get closed before we send, make sure still connected
        if (this.clients.has(clientId)) {
            this.emit('socket:connection', { clientId, socket });
        }

        const queue = this.createDataQueue(socket, (payload) => {
            console.log('[wss] got payload:', payload);
            let clientId;
            this.clients.forEach((clientSocket, id) => {
                if (clientSocket === socket) {
                    clientId = id;
                    return;
                }
            });
            this.emit('socket:msg', { clientId, data: payload });
        });

        socket.on('data', (data) => {
            // since data isn't necessarily the whole message,
            // and we don't know the FIN yet, we have to queue it,
            // and handle the complete data in a different place
            queue.add(data);
        });

        socket.on('timeout', () => {
            socket.destroy();
        });

        socket.on('close', () => {
            this.clients.delete(clientId);
        });
    }

    /**
     * Creates data queue to process incoming socket data
     * Internally clears itself once it has the complete message and onFinish has been called
     *
     * @param onFinish: called with the complete data once it's confirmed all data has been sent
     *
     * @returns object with add method to provide the queue with new data
     */
    private createDataQueue(socket: net.Socket, onFinish: (payload: string) => void) {
        let queuedData: Buffer[] = [];
        let processedData: Buffer[] = [];

        const addToQueue = (data: Buffer) => {
            queuedData.push(data);
            const frame = this.readFrame(data, socket);
            if (frame) {
                const { payload, isFinished } = frame;
                processedData.push(payload);
                if (isFinished) {
                    const payloadBuffer = Buffer.concat(processedData);
                    onFinish(payloadBuffer.toString('utf8'));
                    queuedData = [];
                    processedData = [];
                }
            }
        };

        return {
            add: addToQueue,
        };
    }

    /**
     * Reads the data frame coming in from the wire
     *
     * @returns object containing the payload as a buffer, and if it is complete/finished
     */
    private readFrame(data: Buffer, socket: net.Socket): { payload: Buffer; isFinished: boolean } {
        function readBytes(start: number, amount?: number) {
            return data.subarray(start, amount ? start + amount : undefined);
        }

        // --------------------------------------
        // read FIN (bit 1), RSV (bit 2-4)
        // & opcode (bit 5-8) (byte 1)
        // --------------------------------------
        const byteOne = readBytes(0, 1)[0];
        const isFinished = (byteOne & 0b10000000) >> 7 === 1;
        const opcode = byteOne & 0b00001111;

        const opcodeType = this.getOpCodeType(opcode);
        switch (opcodeType) {
            case 'invalid':
                console.log(`[wss:read] got invalid opcode type, failing connection`);
                socket.destroy();
                return;
            case 'close':
                console.log(`[wss:read] got close opcode type, failing connection`);
                socket.destroy();
                return;
            case 'text':
            case 'continuation':
            case 'controlFrames':
            case 'nonControlFrames':
                break;
            default:
                console.log(`[wss:read] got ${opcodeType} opcode type, this is not yet supported`);
                return;
        }

        // --------------------------------------
        // read mask indicator & payload length
        // --------------------------------------
        const byteTwo = readBytes(1, 1)[0];

        const isMasked = (byteTwo & 0b10000000) << 0 === 128;
        const payloadLength = (byteTwo & 0b01111111) << 0;

        let offset = 2;
        // (in bits) something for the future?
        let messageLength: number | bigint;

        if (isMasked) {
            offset += WebSocketServer.MASK_KEY_BYTES_LENGTH;
        }

        if (payloadLength <= WebSocketServer.SEVEN_BIT_PAYLOAD_LENGTH) {
            messageLength = payloadLength;
        } else if (payloadLength === WebSocketServer.SIXTEEN_BIT_PAYLOAD_LENGTH) {
            offset += 2;
            messageLength = readBytes(2, 2).readUInt16BE(0);
        } else if (payloadLength === WebSocketServer.SIXTY_FOUR_BIT_PAYLOAD_LENGTH) {
            offset += 8;
            messageLength = readBytes(2, 8).readBigUInt64BE(0);
        } else {
            throw new Error('[socket:read] payload too big');
        }

        // --------------------------------------
        // read mask key & payload data
        // --------------------------------------

        if (isMasked) {
            const maskKey = readBytes(offset - WebSocketServer.MASK_KEY_BYTES_LENGTH, WebSocketServer.MASK_KEY_BYTES_LENGTH);
            const encodedPayload = readBytes(offset);
            const payload = this.unmask(encodedPayload, maskKey);
            return { payload, isFinished };
        } else {
            // if not masked, nothing is encoded with the mask key
            const payload = readBytes(offset);
            return { payload, isFinished };
        }
    }

    /**
     * Prepares a data frame to be sent over the wire for a given payload
     */
    private createFrame(payload: string): Buffer {
        const FIN_AND_RSV = 0x80;
        const OPCODE_TEXT = 0x01;

        const payloadBuffer = Buffer.from(payload);
        const payloadBytesLength = payloadBuffer.byteLength;
        const payloadLength = payloadBuffer.length;

        let payloadBytesOffset = 2;
        let contentLength;

        if (payloadLength <= WebSocketServer.SEVEN_BIT_PAYLOAD_LENGTH) {
            payloadBytesOffset += 0;
            contentLength = payloadLength;
        } else if (payloadLength <= WebSocketServer.MAXIMUM_SIXTEEN_BITS_INTEGER) {
            payloadBytesOffset += 2;
            contentLength = WebSocketServer.SIXTEEN_BIT_PAYLOAD_LENGTH;
        } else if (payloadLength <= WebSocketServer.MAXIMUM_SIXTY_FOUR_BITS_INTEGER) {
            payloadBytesOffset += 8;
            contentLength = WebSocketServer.SIXTY_FOUR_BIT_PAYLOAD_LENGTH;
        } else {
            throw new Error('[socket:write] payload too big');
        }

        // --------------------------------------
        // create FIN (bit 1), RSV (bit 2-4)
        // and opcode (bit 5-8) (byte 1)
        // --------------------------------------

        const firstByte = FIN_AND_RSV | OPCODE_TEXT;

        // ------------------------------------------------
        // create frame buffer (data frame without payload)
        // ------------------------------------------------

        const frameBuffer = Buffer.alloc(payloadBytesOffset);
        frameBuffer[0] = firstByte;
        frameBuffer[1] = contentLength;

        if (contentLength === WebSocketServer.SIXTEEN_BIT_PAYLOAD_LENGTH) {
            frameBuffer.writeUInt16BE(payloadBytesLength, 2);
        } else if (contentLength === WebSocketServer.SIXTY_FOUR_BIT_PAYLOAD_LENGTH) {
            frameBuffer.writeBigUInt64BE(BigInt(payloadBytesLength), 2);
        }

        // ---------------------------------------
        // return concatenated buffer with payload
        // ----------------------------------------

        return Buffer.concat([frameBuffer, payloadBuffer]);
    }

    /**
     * Determines what type of opcode is given
     *
     * @param opcode: the hexadecimal opcode (e.g. 0x01)
     *
     * @returns internal opcode type as defined on the static OP_CODES or invalid
     */
    private getOpCodeType(opcode: number): keyof typeof WebSocketServer.OP_CODES | 'invalid' {
        const entry = Object.entries(WebSocketServer.OP_CODES).find(([key, value]) => {
            if (Array.isArray(value)) {
                return value.includes(opcode);
            }
            return opcode === value;
        });
        return entry ? (entry[0] as keyof typeof WebSocketServer.OP_CODES) : 'invalid';
    }

    /**
     * Checks http headers for the websocket upgrade
     *
     * @returns true if good, false if something is bad
     */
    private checkHeaders(req: http.IncomingMessage): boolean {
        const headers = req.headers;

        if (!this.checkHttpVersion(req.httpVersion, '1.1')) {
            return false;
        }
        if (req.method !== 'GET') {
            return false;
        }
        if (!headers.host?.length) {
            return false;
        }
        if (!headers.upgrade || headers.upgrade.toLowerCase() !== 'websocket') {
            return false;
        }
        if (!headers.connection || headers.connection.toLowerCase() !== 'upgrade') {
            return false;
        }

        const secWebsocketKey = headers['sec-websocket-key'];
        const byteLength = Buffer.byteLength(secWebsocketKey, 'base64');
        if (!secWebsocketKey || byteLength !== 16) {
            return false;
        }

        if (!headers['sec-websocket-version'] || headers['sec-websocket-version'] !== '13') {
            return false;
        }

        return true;
    }

    /**
     * Generates a unique client id
     */
    private generateClientId() {
        function gen() {
            // arbitrary
            const length = 36;
            return crypto
                .randomBytes(Math.ceil(length / 2))
                .toString('hex')
                .slice(0, length);
        }
        let id = gen();
        while (this.clients.has(id)) {
            id = gen();
        }
        return id;
    }

    /**
     * Generates the Sec-WebSocket-Accept key required for the upgrade response
     *
     * @param key: key from the Sec-WebSocket-Key header (during upgrade)
     */
    private generateWebSocketKey(key: string) {
        const MAGIC_KEY_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

        const concatenatedKey = key + MAGIC_KEY_STRING;
        const hash = crypto.createHash('sha1').update(concatenatedKey, 'utf8').digest();

        return hash.subarray(0, 20).toString('base64');
    }

    /**
     * Decodes an encoded payload using the mask key in the data frame
     */
    private unmask(encodedPayload: Buffer, maskKey: Buffer): Buffer {
        const decodedPayload = Buffer.from(encodedPayload);
        for (let index = 0; index < encodedPayload.length; index++) {
            decodedPayload[index] = encodedPayload[index] ^ maskKey[index % WebSocketServer.MASK_KEY_BYTES_LENGTH];
        }
        return decodedPayload;
    }

    /**
     * Checks to see if the http version is what's required
     *
     * @returns true if good, false if not high enough
     */
    private checkHttpVersion(version: string, requiredVersion: string): boolean {
        const [major, minor] = version.split('.');
        const [requiredMajor, requiredMinor] = requiredVersion.split('.');

        if (major > requiredMajor) {
            return true;
        }
        if (major === requiredMajor && minor >= requiredMinor) {
            return true;
        }

        return false;
    }

    /**
     * Disposes safely
     */
    public async dispose() {
        this.removeAllListeners('socket:connection');
        this.removeAllListeners('socket:msg');
        //
    }
}
