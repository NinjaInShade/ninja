import { computedStack } from './storage';

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
    subscribe: (cb: Subscription<T>) => UnsubscribeFn;
    /**
     * Subscribers of the observable
     */
    subscriptions: Subscription<T>[];
    /**
     * Identifies object as an observable
     */
    isObservable: true;
}

function createObservable<T>(options: ObservableOptions): Observable<T> {
    // Options
    const defaultOptions = {
        writable: true,
    };
    const { writable } = Object.assign({}, defaultOptions, options);

    const subscriptions: Subscription<T>[] = [];
    let value: T;

    const observable = function (newValue) {
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

    function peek() {
        return value;
    }

    function subscribe(cb) {
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
    function _notifySubscribers(): void {
        for (const sub of subscriptions) {
            sub(value);
        }
    }

    Object.defineProperties(observable, {
        isObservable: { value: true },
        peek: { value: peek },
        subscribe: { value: subscribe },
        subscriptions: { value: subscriptions },
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
