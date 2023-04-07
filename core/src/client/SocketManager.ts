import project from '~/index';

type OnCloseData = { code: number; reason: string; wasClean: boolean };

type MessageListeners = Record<string, ((data: any) => void)[]>;
type OpenListeners = (() => void)[];
type CloseListeners = ((closeInfo?: OnCloseData) => void)[];
type ErrorListeners = ((errorType?: string) => void)[];

// TODO: Add type for accepted Serializable value
// TODO: Error handling for JSON stringify/parse (create own encodeObject/decodeObject utils?)

/**
 * Manages the WebSocket object
 */
export default class ClientSocketManager {
    private server: WebSocket;

    private messageListeners: MessageListeners = {};
    private openListeners: OpenListeners = [];
    private closeListeners: CloseListeners = [];
    private errorListeners: ErrorListeners = [];

    public serverUrl: string | undefined;

    constructor(serverUrl: string | undefined) {
        this.serverUrl = serverUrl;
    }

    public connect() {
        if (!this.serverUrl) {
            throw new Error('You must provide a serverUrl option to the client to connect to the server');
        }
        this.server = new WebSocket(this.serverUrl);
        this.setupListeners();
    }

    private setupListeners() {
        this.server.addEventListener('open', () => {
            console.log(`[socket] socket was opened`);

            // inform listeners
            for (const handler of this.openListeners) {
                handler();
            }
        });

        this.server.addEventListener('message', (event) => {
            const { data } = event;
            const _data = JSON.parse(data);

            // inform listeners
            const listeners = this.messageListeners[_data.__EVENT_NAME__];
            if (listeners) {
                for (const handler of listeners) {
                    delete _data.__EVENT_NAME__;
                    handler(_data);
                }
            }
        });

        this.server.addEventListener('close', (event) => {
            const { code, reason, wasClean } = event;

            console.error(`[socket] socket was closed with code ${code}${reason ? ` and reason '${reason}'` : ''}`);

            if (!wasClean) {
                console.warn('[socket] socket was not closed cleanly');
            }

            // inform listeners
            for (const handler of this.closeListeners) {
                handler({ code, reason, wasClean });
            }
        });

        this.server.addEventListener('error', (event) => {
            // inform listeners
            for (const handler of this.errorListeners) {
                handler(event.type);
            }
        });
    }

    /**
     * Listens for socket event
     */
    public on(eventName: string, callback: (data) => void) {
        if (eventName in this.messageListeners) {
            this.messageListeners[eventName].push(callback);
        } else {
            this.messageListeners[eventName] = [callback];
        }
    }

    /**
     * Emits a socket event
     */
    public emit(eventName: string, data: any) {
        if (this.readyState !== 'OPEN') {
            throw new Error('[socket] socket is not open, cannot emit data');
        }

        let dataToSend = {
            __EVENT_NAME__: eventName,
            data,
        };
        this.server.send(JSON.stringify(dataToSend));
    }

    /**
     * Adds a listener for the open event
     */
    public onConnect(callback: () => void) {
        this.openListeners.push(callback);
    }

    /**
     * Adds a listener for the close event
     */
    public onClose(callback: (closeInfo?: OnCloseData) => void) {
        this.closeListeners.push(callback);
    }

    /**
     * Adds a listener for the error event
     */
    public onError(callback: (errorType?: string) => void) {
        this.errorListeners.push(callback);
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
            throw new Error('[socket] you must specify a reason when closing if passing in custom code');
        }
        if (this.readyState === 'CLOSING') {
            console.warn('[socket] close called more than once, server is already closing');
        }
        this.server.close(code, reason);
    }

    public dispose() {
        this.close();
    }
}
