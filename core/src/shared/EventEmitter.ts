import { logger } from '@ninjalib/util';

const log = logger('nw:eventemitter');

export type EmitData = any;
export type Listener = (...args: EmitData[]) => void;

type EventListeners = Map<string, Listener[]>;
type Disposer = () => void;

/**
 * Custom implementation of NodeJS EventEmitter
 *
 * Compatible on the browser & server
 */
export class EventEmitter {
    // Map is more performant in adding/removing key/value pairs
    private _listeners: EventListeners = new Map();
    private _internalListeners: EventListeners = new Map();
    private _maxListeners = 20;

    constructor() {
        const exceedListenerCount = () => {
            const max = this._maxListeners;
            const count = this.totalListenersCount;
            if (max !== 0 && max !== Infinity && count > max) {
                log.warn(`EventEmitter exceeded max listeners of ${max}, currently at ${count} listeners`);
            }
        };

        this._on('newListener', exceedListenerCount, { internal: true });
    }

    /**
     * Adds the `listener` function to the end of the listeners array for the event `eventName`
     *
     * There is no duplicate check, so adding multiple of the same `eventName` & `listener` will
     * result in listener being added and called multiple times on emit
     *
     * Listeners are called in the same order that they were added
     *
     * @returns a disposer for the listener added you can call instead of manually calling `off()`
     */
    public on(eventName: string, listener: Listener): Disposer {
        return this._on(eventName, listener);
    }

    /**
     * The same as `on()` however the listener is removed
     * after the first time `eventName` is emitted
     */
    public once(eventName: string, listener: Listener): Disposer {
        return this._on(eventName, listener, { once: true });
    }

    /**
     * Removes the `listener` for the `eventName` from the listeners array
     *
     * Will only delete one instance at a time, so if you have 3 listeners that
     * share the same reference, you would have to call `off()` 3 times
     */
    public off(eventName: string, listener: Listener) {
        const listeners = this.listeners(eventName);
        if (!listeners.length) {
            return;
        }
        const index = listeners.findIndex((l) => l === listener);
        listeners.splice(index, 1);
        this.emit('removeListener', eventName, listener);
    }

    /**
     * Removes all listeners from `eventName`
     *
     * If `eventName` is not passed, it removes
     * all listeners from all events. Be wary with this
     */
    public removeAllListeners(eventName?: string) {
        const remove = (eventName: string) => {
            const listeners = this.listeners(eventName);
            if (!listeners.length) {
                return;
            }
            for (let i = listeners.length - 1; i > -1; i--) {
                listeners.splice(i, 1);
                this.emit('removeListener', eventName, listeners[i]);
            }
        };

        // from every event
        if (!eventName) {
            for (const eventName of this._listeners.keys()) {
                remove(eventName);
            }
            return;
        }

        // from a specific event
        remove(eventName);
    }

    /**
     * Synchronously calls every listener for `eventName` with the supplied data
     *
     * Listeners are called in the order they were added using `on()` or `once()`
     */
    public emit(eventName: string, ...data: EmitData[]) {
        const listeners = [...this.internalListeners(eventName), ...this.listeners(eventName)];

        for (const listener of listeners) {
            try {
                listener(...data);
            } catch (err) {
                if (this.listenerCount('error') === 0 || eventName === 'error') {
                    throw err;
                }

                this.emit('error', err);
            }
        }
    }

    /**
     * Max listeners allowed before EventEmitter starts
     * warning you in the console when more listeners are added
     *
     * Useful for identifying memory leaks
     *
     * @default 20
     */
    public get maxListeners() {
        return this._maxListeners;
    }

    /**
     * Sets the max listeners allowed before warning
     *
     * Value can be set to `Infinity` or `0` to enable unlimited listeners
     *
     * @default 20
     */
    public set maxListeners(number: number) {
        this._maxListeners = number;
    }

    /**
     * Array of all events that have 1 or more listeners registered to them
     */
    public get eventNames() {
        return [...this._listeners.keys()];
    }

    /**
     * The count of listeners for all public events
     */
    public get totalListenersCount() {
        return (
            [...this._listeners.values()].reduce((prev, curr) => {
                return prev + curr.length;
            }, 0) ?? 0
        );
    }

    /**
     * The count of listeners for all internal events tracked by EventEmitter
     */
    public get totalInternalListenersCount() {
        return (
            [...this._internalListeners.values()].reduce((prev, curr) => {
                return prev + curr.length;
            }, 0) ?? 0
        );
    }

    /**
     * The combined count of public/internal events
     */
    public get totalCombinedListenersCount() {
        return (
            [...this._internalListeners.values(), ...this._listeners.values()].reduce((prev, curr) => {
                return prev + curr.length;
            }, 0) ?? 0
        );
    }

    /**
     * The count of listeners for `eventName`
     */
    public listenerCount(eventName: string) {
        return this.listeners(eventName)?.length ?? 0;
    }

    /**
     * Returns the listeners array for `eventName`
     */
    public listeners(eventName: string) {
        return this._listeners.get(eventName) ?? [];
    }

    private internalListeners(eventName: string) {
        return this._internalListeners.get(eventName) ?? [];
    }

    private _on(eventName: string, listener: Listener, opts?: { once?: true; internal?: true }): Disposer {
        const internal = opts?.internal ?? false;
        const once = opts?.once ?? false;

        this.addListener(eventName, listener, internal);
        const listeners = internal ? this.internalListeners(eventName) : this.listeners(eventName);

        const disposer = () => {
            const indexOf = listeners.findIndex((l) => l === listener);
            if (indexOf > -1) {
                listeners.splice(indexOf, 1);
                this.emit('removeListener', eventName, listener);
            }
        };

        if (once) {
            let selfDisposer: () => void;
            const onceHandler = () => {
                disposer();
                selfDisposer();
            };
            selfDisposer = this._on(eventName, onceHandler, { internal: true });
        }

        return disposer;
    }

    private addListener(eventName: string, listener: Listener, internal?: boolean) {
        const listeners = internal ? this.internalListeners(eventName) : this.listeners(eventName);
        if (!listeners.length) {
            if (internal) {
                this._internalListeners.set(eventName, [listener]);
            } else {
                this._listeners.set(eventName, [listener]);
            }
        } else {
            listeners.push(listener);
        }

        this.emit('newListener', eventName, listener);
    }
}

export function emitter() {
    return new EventEmitter();
}
