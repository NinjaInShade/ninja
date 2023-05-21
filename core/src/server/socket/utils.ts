import wsServer from './WsServer';
import crypto from 'node:crypto';
import type net from 'node:net';
import type http from 'node:http';
import type { Socket } from './Socket';
import core, { decode, type AcceptableSocketData } from '~/node';

/**
 * Reads the data frame coming in from the wire
 *
 * @returns object containing the payload as a buffer, and if it is complete/finished
 */
export function readFrame(data: Buffer, socket: Socket): { payload: Buffer; isFinished: boolean } | null {
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

    const opcodeType = getOpCodeType(opcode);
    switch (opcodeType) {
        case 'invalid':
        case 'close':
            console.log(`[wss:read] got ${opcodeType} opcode, closing connection`);
            socket.dispose();
            return null;
        case 'text':
        case 'continuation':
        case 'controlFrames':
        case 'nonControlFrames':
            break;
        default:
            throw new Error(`got ${opcodeType} opcode type, this is not yet supported`);
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
        offset += wsServer.MASK_KEY_BYTES_LENGTH;
    }

    if (payloadLength <= wsServer.SEVEN_BIT_PAYLOAD_LENGTH) {
        messageLength = payloadLength;
    } else if (payloadLength === wsServer.SIXTEEN_BIT_PAYLOAD_LENGTH) {
        offset += 2;
        messageLength = readBytes(2, 2).readUInt16BE(0);
    } else if (payloadLength === wsServer.SIXTY_FOUR_BIT_PAYLOAD_LENGTH) {
        offset += 8;
        messageLength = readBytes(2, 8).readBigUInt64BE(0);
    } else {
        throw new Error('[socket:read] payload too big');
    }

    // --------------------------------------
    // read mask key & payload data
    // --------------------------------------

    if (isMasked) {
        const maskKey = readBytes(offset - wsServer.MASK_KEY_BYTES_LENGTH, wsServer.MASK_KEY_BYTES_LENGTH);
        const encodedPayload = readBytes(offset);
        const payload = unmask(encodedPayload, maskKey);
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
export function createFrame(payload: string): Buffer {
    const FIN_AND_RSV = 0x80;
    const OPCODE_TEXT = 0x01;

    const payloadBuffer = Buffer.from(payload);
    const payloadBytesLength = payloadBuffer.byteLength;
    const payloadLength = payloadBuffer.length;

    let payloadBytesOffset = 2;
    let contentLength;

    if (payloadLength <= wsServer.SEVEN_BIT_PAYLOAD_LENGTH) {
        payloadBytesOffset += 0;
        contentLength = payloadLength;
    } else if (payloadLength <= wsServer.MAXIMUM_SIXTEEN_BITS_INTEGER) {
        payloadBytesOffset += 2;
        contentLength = wsServer.SIXTEEN_BIT_PAYLOAD_LENGTH;
    } else if (payloadLength <= wsServer.MAXIMUM_SIXTY_FOUR_BITS_INTEGER) {
        payloadBytesOffset += 8;
        contentLength = wsServer.SIXTY_FOUR_BIT_PAYLOAD_LENGTH;
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

    if (contentLength === wsServer.SIXTEEN_BIT_PAYLOAD_LENGTH) {
        frameBuffer.writeUInt16BE(payloadBytesLength, 2);
    } else if (contentLength === wsServer.SIXTY_FOUR_BIT_PAYLOAD_LENGTH) {
        frameBuffer.writeBigUInt64BE(BigInt(payloadBytesLength), 2);
    }

    // ---------------------------------------
    // return concatenated buffer with payload
    // ----------------------------------------

    return Buffer.concat([frameBuffer, payloadBuffer]);
}

/**
 * Creates data queue to process incoming socket data
 * Internally clears itself once it has the complete message and onFinish has been called
 *
 * @param onFinish: called with the complete data once it's confirmed all data has been sent
 *
 * @returns object with add method to provide the queue with new data
 */
export function createDataQueue(socket: Socket, onFinish: (payload: string) => void) {
    let queuedData: Buffer[] = [];
    let processedData: Buffer[] = [];

    const addToQueue = (data: Buffer) => {
        queuedData.push(data);
        const frame = readFrame(data, socket);

        if (!frame) {
            queuedData = [];
            processedData = [];
            return;
        }

        const { payload, isFinished } = frame;
        processedData.push(payload);
        if (isFinished) {
            const payloadBuffer = Buffer.concat(processedData);
            onFinish(payloadBuffer.toString('utf8'));
            queuedData = [];
            processedData = [];
        }
    };

    return {
        add: addToQueue,
    };
}

/**
 * Checks http headers for the websocket upgrade
 *
 * @returns true if good, false if something is bad
 */
export function checkHeaders(req: http.IncomingMessage): boolean {
    const headers = req.headers;

    if (!checkHttpVersion(req.httpVersion, '1.1')) {
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
    if (!secWebsocketKey) {
        throw new Error('Expected sec-websocket-key header when upgrading from HTTP');
    }
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
 * Generates the Sec-WebSocket-Accept key required for the upgrade response
 *
 * @param key: key from the Sec-WebSocket-Key header (during upgrade)
 */
export function generateWebSocketKey(key: string) {
    const MAGIC_KEY_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    const concatenatedKey = key + MAGIC_KEY_STRING;
    const hash = crypto.createHash('sha1').update(concatenatedKey, 'utf8').digest();

    return hash.subarray(0, 20).toString('base64');
}

/**
 * Checks to see if the http version is what's required
 *
 * @returns true if good, false if not high enough
 */
function checkHttpVersion(version: string, requiredVersion: string): boolean {
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
 * Determines what type of opcode is given
 *
 * @param opcode: the hexadecimal opcode (e.g. 0x01)
 *
 * @returns internal opcode type as defined on the static OP_CODES or invalid
 */
function getOpCodeType(opcode: number): keyof typeof wsServer.OP_CODES | 'invalid' {
    const entry = Object.entries(wsServer.OP_CODES).find(([key, value]) => {
        if (Array.isArray(value)) {
            return value.includes(opcode);
        }
        return opcode === value;
    });
    return entry ? (entry[0] as keyof typeof wsServer.OP_CODES) : 'invalid';
}

/**
 * Decodes an encoded payload using the mask key in the data frame
 */
function unmask(encodedPayload: Buffer, maskKey: Buffer): Buffer {
    const decodedPayload = Buffer.from(encodedPayload);
    for (let index = 0; index < encodedPayload.length; index++) {
        decodedPayload[index] = encodedPayload[index] ^ maskKey[index % wsServer.MASK_KEY_BYTES_LENGTH];
    }
    return decodedPayload;
}
