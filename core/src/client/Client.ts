import SocketManager from './SocketManager';

type ClientOptions = {
    /**
     * server domain (e.g. localhost)
     *
     * @default localhost
     */
    domain?: string;
    /**
     * server port (e.g. 4405)
     *
     * @default 5656
     */
    port?: number;
};

export class Client {
    static _instance: Client;

    private options: ClientOptions;
    private socket: SocketManager;

    public variables: Record<string, any> = {};

    constructor(options: ClientOptions = {}) {
        if (Client._instance) {
            console.warn('Client should only be initialised once in your project');
        }
        Client._instance = this;

        const defaultOptions = {
            domain: 'localhost',
            port: 5656,
        };
        this.options = Object.assign({}, defaultOptions, options);

        const serverURL = this.options.domain + ':' + this.options.port;
        this.socket = new SocketManager(serverURL);
    }

    /**
     * Connects to the server
     */
    public async connect() {
        const connectPromise = new Promise<void>((resolve) => {
            this.socket.connect();

            this.socket.onConnect(() => {
                resolve();
            });
        });

        try {
            await connectPromise;
        } catch (err) {
            console.warn('[SocketManager] could not connect to server');
        }
    }

    /**
     * Listens for socket messages from the server
     */
    public on(event: string, handler: (data?: any) => void) {
        return this.socket.on(event, handler);
    }

    /**
     * Emits a socket message to the server
     */
    public emit(event: string, data?: any) {
        this.socket.emit(event, data);
    }

    /**
     * Set a client variable
     */
    public set(key: string, value: any): void {
        if (value === undefined && !(key in this.variables)) {
            return;
        }
        if (value === undefined && key in this.variables) {
            delete this.variables[key];
            return;
        }
        this.variables[key] = value;
    }

    /**
     * Retrieve a client variable
     */
    public get(key: string): any {
        return this.variables[key];
    }

    /**
     * Dispose client safely
     */
    public dispose() {
        this.socket.dispose();
    }
}

export function client(opts?: ClientOptions) {
    return new Client(opts);
}
