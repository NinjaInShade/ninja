import { computedStack } from './storage';

type UpdateFn<T> = (value: T) => T;
type Subscription<T> = (value?: T) => void;
type UnsubscribeFn = () => void;
type ObservableOptions = {
    /**
     * @default true
     */
    writable?: boolean;
};

export interface Observable<T> {
    /**
     * Observable
     *
     * To read value, call with no args
     * To write a new value, call with a value arg
     */
    (): T;
    (newValue?: T): void;

    /**
     * Get value without registering dependency
     */
    peek: () => T;
    /**
     * Subscribe to changes of the observable
     */
    onChange: (cb: Subscription<T>) => UnsubscribeFn;
    /**
     * Subscribers of the observable
     */
    subscriptions: Subscription<T>[];
    /**
     * Identifies object as an observable
     */
    isObservable: true;
    /**
     * (svelte store compatibility) Subscribe to changes of the observable and calls cb straight away with value
     */
    subscribe: (cb: Subscription<T>) => UnsubscribeFn;
    /**
     * (svelte store compatibility) Sets the value of the observable and notifies subscribers
     */
    set: (value: T) => void;
    /**
     * (svelte store compatibility) Calls fn with current value of observable and expects a returned value which the observable will be updated too
     */
    update: (fn: UpdateFn<T>) => void;
}

function createObservable<T>(options: ObservableOptions): Observable<T> {
    // Options
    const defaultOptions = {
        writable: true,
    };
    const { writable } = Object.assign({}, defaultOptions, options);

    const subscriptions: Subscription<T>[] = [];
    let value: T;

    const observable = function (newValue: T) {
        // Read
        if (arguments.length === 0) {
            // Register dependency
            if (computedStack.length) {
                computedStack.at(-1)(observable);
            }
            return value;
        }

        // Write
        if (!writable) {
            throw new Error('You cannot write to a non-writable observable');
        }
        if (newValue !== value) {
            value = newValue;
            _notifySubscribers();
        }
    } as Observable<T>;

    function peek(): T {
        return value;
    }

    function onChange(cb: Subscription<T>): UnsubscribeFn {
        subscriptions.push(cb);
        const index = subscriptions.indexOf(cb);
        return () => {
            subscriptions.splice(index, 1);
        };
    }

    /**
     * @private
     * Notifies subscribers with new value
     */
    function _notifySubscribers() {
        for (const sub of subscriptions) {
            sub(value);
        }
    }

    // Svelte custom store compatibility

    function subscribe(cb: Subscription<T>): UnsubscribeFn {
        subscriptions.push(cb);
        const index = subscriptions.indexOf(cb);
        cb(value);
        return () => {
            subscriptions.splice(index, 1);
        };
    }

    function set(newValue: T) {
        if (newValue !== value) {
            value = newValue;
            _notifySubscribers();
        }
    }

    function update(fn: UpdateFn<T>) {
        set(fn(value));
    }

    Object.defineProperties(observable, {
        // Observable
        isObservable: { value: true },
        peek: { value: peek },
        onChange: { value: onChange },
        subscriptions: { value: subscriptions },
        // Svelte
        subscribe: { value: subscribe },
        set: { value: set },
        update: { value: update },
    });

    return observable;
}

/**
 * Observable
 *
 * ELIF: a variable that you can read, write to and subscribe and get notified of changes
 */
export function observable<T>(initialValue?: T, options: ObservableOptions = {}) {
    const obs = createObservable<T>(options);
    obs(initialValue);
    return obs;
}
