import { describe, test } from 'node:test';
import assert from 'node:assert';
import project from '~/index';

async function sleepTick() {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 0);
    });
}

describe('EventEmitter', () => {
    test('should create an event emitter', () => {
        project.emitter();
    });

    test('should emit and receive events', (t, done) => {
        const emitter = project.emitter();
        emitter.on('test', () => {
            done();
        });
        emitter.emit('test');
    });

    test('should receive event only once using .once()', (t, done) => {
        const emitter = project.emitter();
        // test will fail if this is called more than once
        emitter.once('test', () => {
            done();
        });
        emitter.emit('test');
        emitter.emit('test');
    });

    test('should dispose the one-time on() disposer also when using .once()', async () => {
        const emitter = project.emitter();
        // test will fail if this is called more than once
        emitter.once('test', () => {});

        // 1st listener: internal listenerCount
        // 2nd listener: our once() handler
        // 3rd listener: the internal _on() added during once() creation
        assert.equal(emitter.totalCombinedListenersCount, 3);

        emitter.emit('test');
        await sleepTick();

        // only the 1st internal listenerCount should be left
        assert.equal(emitter.totalCombinedListenersCount, 1);
    });

    test('should get all event names', () => {
        const emitter = project.emitter();
        emitter.on('a', () => {});
        emitter.on('b', () => {});
        emitter.on('c', () => {});
        assert.deepEqual(emitter.eventNames, ['a', 'b', 'c']);
    });

    test('should have correct total listener count for specific event', () => {
        const emitter = project.emitter();
        emitter.on('a', () => {});
        emitter.on('a', () => {});
        emitter.on('a', () => {});
        assert.equal(emitter.listenerCount('a'), 3);
    });

    test('should remove all listeners for specific event', () => {
        const emitter = project.emitter();
        emitter.on('a', () => {});
        emitter.on('a', () => {});
        emitter.on('a', () => {});
        assert.equal(emitter.listenerCount('a'), 3);
        emitter.removeAllListeners('a');
        assert.equal(emitter.listenerCount('a'), 0);
    });

    test('should remove all listeners from all events', () => {
        const emitter = project.emitter();
        emitter.on('a', () => {});
        emitter.on('b', () => {});
        emitter.on('c', () => {});
        assert.equal(emitter.totalListenersCount, 3);
        emitter.removeAllListeners();
        assert.equal(emitter.totalListenersCount, 0);
    });

    test('should have correct total listener count', () => {
        const emitter = project.emitter();
        emitter.on('a', () => {});
        emitter.on('b', () => {});
        emitter.on('c', () => {});
        assert.equal(emitter.totalListenersCount, 3);
    });

    test('should have default max listeners count', () => {
        const emitter = project.emitter();
        assert.equal(emitter.maxListeners, 20);
    });

    test('should set max listeners', () => {
        const emitter = project.emitter();
        assert.equal(emitter.maxListeners, 20);
        emitter.maxListeners = 50;
        assert.equal(emitter.maxListeners, 50);
    });

    test('should dispose using off()', () => {
        const emitter = project.emitter();
        const fn = () => {};
        emitter.on('test', fn);
        assert.equal(emitter.listenerCount('test'), 1);
        emitter.off('test', fn);
        assert.equal(emitter.listenerCount('test'), 0);
    });

    test('should dispose using disposer returned from on', () => {
        const emitter = project.emitter();
        const fn = () => {};
        const disposer = emitter.on('test', fn);
        assert.equal(emitter.listenerCount('test'), 1);
        disposer();
        assert.equal(emitter.listenerCount('test'), 0);
    });

    test('should return correct listeners', () => {
        const emitter = project.emitter();
        const fn = () => {};
        const fn2 = () => {};
        emitter.on('test', fn);
        emitter.on('test', fn2);
        assert.deepEqual(emitter.listeners('test'), [fn, fn2]);
    });

    test('should remove only the single listener if multiple of the same reference are listening using disposer returned from on()', () => {
        const emitter = project.emitter();
        const fn = () => {};
        const dispose = emitter.on('test', fn);
        const dispose2 = emitter.on('test', fn);
        const dispose3 = emitter.on('test', fn);

        assert.equal(emitter.listenerCount('test'), 3);

        dispose();
        assert.equal(emitter.listenerCount('test'), 2);

        dispose2();
        assert.equal(emitter.listenerCount('test'), 1);

        dispose3();
        assert.equal(emitter.listenerCount('test'), 0);
    });

    test('should execute listeners in order of creation', async () => {
        const emitter = project.emitter();
        const order: number[] = [];
        emitter.on('a', () => {
            order.push(1);
        });
        emitter.on('a', () => {
            order.push(2);
        });
        emitter.on('a', () => {
            order.push(3);
        });
        emitter.emit('a');
        await sleepTick();
        assert.deepEqual(order, [1, 2, 3]);
    });

    test('should throw error if no error events being listened to and handler fails', () => {
        const emitter = project.emitter();
        emitter.on('test', () => {
            throw new Error('Fail!');
        });
        assert.throws(
            () => {
                emitter.emit('test');
            },
            { message: 'Fail!' }
        );
    });

    test('should handle error gracefully and have access to the error object if listening to error event', (t, done) => {
        const emitter = project.emitter();
        emitter.on('test', () => {
            const error = new Error('Fail!');
            error.code = 500;
            throw error;
        });
        emitter.on('error', (err: Error) => {
            assert.equal(err.message, 'Fail!');
            assert.equal(err.code, 500);
            done();
        });
        emitter.emit('test');
    });

    test('should not recursively error and crash if another error also happens in error event listener', () => {
        const emitter = project.emitter();
        emitter.on('test', () => {
            throw new Error('Fail!');
        });
        emitter.on('error', (err: Error) => {
            assert.equal(err.message, 'Fail!');
            throw new Error('Fail within!');
        });
        assert.throws(
            () => {
                emitter.emit('test');
            },
            { message: 'Fail within!' }
        );
    });

    test('should emit newListener event when new listener is added', async () => {
        const emitter = project.emitter();
        const newListeners: any[] = [];
        const newListenerFn = (eventName, listener) => {
            newListeners.push([eventName, listener]);
        };
        const testFn = () => {};

        emitter.on('newListener', newListenerFn);
        emitter.on('test', testFn);
        await sleepTick();

        assert.deepEqual(newListeners, [
            ['newListener', newListenerFn],
            ['test', testFn],
        ]);
    });

    test('should emit removeListener event when listener is deleted', async () => {
        const emitter = project.emitter();
        const removedListeners: any[] = [];
        const removeListenerFn = (eventName, listener) => {
            removedListeners.push([eventName, listener]);
        };
        const testFn = () => {};

        emitter.on('removeListener', removeListenerFn);
        const dispose = emitter.on('test', testFn);
        dispose();
        await sleepTick();

        assert.deepEqual(removedListeners, [['test', testFn]]);
    });
});
