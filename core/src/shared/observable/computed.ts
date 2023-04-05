import { observable, type Observable } from './observable';
import { computedStack } from './storage';

interface Computed<T> extends Observable<T> {
    /**
     * Dependencies of the computed
     */
    dependencies: Observable<any>[];
}

function createComputed<T>(fn: () => T): Computed<T> {
    let obs: Computed<T>;
    const dependencies: Observable<any>[] = [];

    function registerDependency(dep: Observable<any>) {
        if (obs === dep || dependencies.includes(dep)) {
            return;
        }

        dependencies.push(dep);
        dep.subscribe(() => {
            const newValue = evaluateFn();
            obs(newValue);
        });
    }

    function evaluateFn(): T {
        computedStack.push(registerDependency);
        const value = fn();
        computedStack.pop();
        return value;
    }

    // Evaluate once on creation
    const initialValue = evaluateFn();

    // TODO: needs to be non-writable apart from when used within createComputed()
    obs = observable<T>(initialValue) as Computed<T>;

    Object.defineProperties(obs, {
        dependencies: { value: dependencies },
    });

    return obs;
}

/**
 * Computed observable
 *
 * Read only observable
 * Executes function and any observables read are registered as dependencies
 * When any of those observables change, function is re-evaluated and subscribers to the computed are notified
 */
export function computed<T>(fn: () => T) {
    const obs = createComputed<T>(fn);
    return obs;
}
