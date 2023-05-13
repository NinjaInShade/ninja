import core from '~/browser';

type Disposer = () => void;

// TODO: Add type for accepted Serializable value
// TODO: Error handling for JSON stringify/parse (create own encodeObject/decodeObject utils?)

/**
 * Manages the WebSocket object
 */
export default class ClientSocketManager {
    private server: WebSocket;
    private emitter: core.EventEmitter;

    constructor(public serverURL: string | undefined) {
        this.emitter = core.emitter();
    }

    public connect() {
        if (!this.serverURL) {
            throw new Error('Server URL not given to SocketManager, so client cannot connect to the server');
        }
        this.server = new WebSocket('ws://' + this.serverURL);
        this.setupListeners();
    }

    private setupListeners() {
        this.server.addEventListener('open', () => {
            console.log(`[SocketManager] socket was opened`);

            // inform listeners
            this.emitter.emit('socket:open');
        });

        this.server.addEventListener('message', (ev) => {
            const rawData = ev.data;
            const data = JSON.parse(rawData);

            const event = data.event;
            delete data.event;

            // inform listeners
            this.emitter.emit('socket:data', { event, data });
        });

        this.server.addEventListener('close', (event) => {
            const { code, reason, wasClean } = event;

            if (!wasClean) {
                console.error(`[SocketManager] socket was not closed cleanly, with code ${code}`);
            }

            // inform listeners
            this.emitter.emit('socket:close', { code, reason, wasClean });
        });

        this.server.addEventListener('error', (event) => {
            // inform listeners
            this.emitter.emit('socket:error', event.type);
        });
    }

    /**
     * Listens for socket messages
     */
    public on(event: string, callback: (data?: unknown) => void): Disposer {
        return this.emitter.on('socket:data', (data: { event: string; data?: unknown }) => {
            if (data.event === event) {
                callback(data.data);
            }
        });
    }

    /**
     * Emits a socket event
     */
    public emit(event: string, data: any = undefined) {
        if (this.readyState !== 'OPEN') {
            throw new Error('[SocketManager] socket is not open, cannot emit data');
        }

        this.server.send(JSON.stringify({ event, data }));
    }

    /**
     * Adds a listener for the open event
     */
    public onConnect(callback: () => void) {
        this.emitter.on('socket:open', callback);
    }

    /**
     * Adds a listener for the close event
     */
    public onClose(callback: (closeInfo?: { code: number; reason: string; wasClean: boolean }) => void) {
        this.emitter.on('socket:close', callback);
    }

    /**
     * Adds a listener for the error event
     */
    public onError(callback: (errorType?: string) => void) {
        this.emitter.on('socket:error', callback);
    }

    public get readyState() {
        switch (this.server.readyState) {
            case 0:
                return 'CONNECTING';
            case 1:
                return 'OPEN';
            case 2:
                return 'CLOSING';
            case 3:
                return 'CLOSED';
            default:
                return 'UNKNOWN';
        }
    }

    private close(code?: number, reason?: string) {
        if (code && !reason) {
            throw new Error('[SocketManager] you must specify a reason when closing if passing in custom code');
        }
        if (this.readyState === 'CLOSING') {
            console.warn('[SocketManager] close called more than once');
            return;
        }
        this.server.close(code, reason);
    }

    public dispose() {
        this.close();
    }
}
