import { describe, it } from 'node:test';
import assert from 'node:assert';
import project from '~/index';

describe('[observable] observable', () => {
    it('should create observable and set default value as undefined', () => {
        const obs = project.observable();
        assert.equal(obs(), undefined);
    });

    it('should read initial value', () => {
        const obs = project.observable(5);
        assert.equal(obs(), 5);
    });

    it('should write new value', () => {
        const obs = project.observable();
        assert.equal(obs(), undefined);
        obs(10);
        assert.equal(obs(), 10);
    });

    // @ts-expect-error the typing is wrong in node:test, thinks done is first param but is actually second
    it('should be notified of changes when subscribed', (t, done) => {
        const obs = project.observable();

        // subscribe
        obs.subscribe((value) => {
            assert.equal(value, 10);
            done();
        });

        // write, trigger subscription
        obs(10);
    });

    it('should not be notified of changes if value has not changed', () => {
        const obs = project.observable();

        let timesNotified = 0;
        obs.subscribe(() => {
            timesNotified += 1;
        });

        obs(10);
        obs(10);
        obs(10);
        setTimeout(() => {
            assert.equal(timesNotified, 1);
        }, 0);
    });

    it('should successfully unsubscribe', () => {
        const obs = project.observable();

        const unsub = obs.subscribe(() => {});
        assert.equal(obs.subscriptions.length, 1);
        unsub();
        assert.equal(obs.subscriptions.length, 0);
    });
});

describe('[observable] computed', () => {
    it('should read correct evaluated value with no observables read', () => {
        const computedObs = project.computed(() => {
            return 25 + 75;
        });
        assert.equal(computedObs(), 100);
    });

    it('should read correct evaluated value with observables read', () => {
        const obs = project.observable<number>(75);
        const computedObs = project.computed(() => {
            return 25 + obs();
        });
        assert.equal(computedObs(), 100);
    });

    // @ts-expect-error
    it('should update when a single dependency changes', (t, done) => {
        const obs = project.observable<number>(75);
        const computedObs = project.computed(() => {
            return 25 + obs();
        });
        computedObs.subscribe(() => {
            assert.equal(computedObs(), 200);
            assert.equal(computedObs.dependencies.length, 1);
            done();
        });

        assert.equal(computedObs(), 100);
        obs(175);
    });

    // @ts-expect-error
    it('should update when multiple dependencies change', (t, done) => {
        const obs = project.observable<number>(50);
        const obs2 = project.observable<number>(100);

        const computedObs = project.computed(() => {
            return obs() + obs2();
        });

        let timesRead = 0;
        computedObs.subscribe(() => {
            if (timesRead === 0) {
                assert.equal(computedObs(), 200);
            } else {
                assert.equal(computedObs(), 300);
                done();
            }
            timesRead += 1;
        });

        assert.equal(computedObs(), 150);
        assert.equal(computedObs.dependencies.length, 2);
        obs(100);
        obs2(200);
    });

    // @ts-expect-error
    it('should update when computed dependency changes', (t, done) => {
        const obs = project.observable<number>(50);
        const obs2 = project.observable<number>(100);

        const computedObs = project.computed(() => {
            return obs() + obs2();
        });
        const computedObs2 = project.computed(() => {
            return computedObs() + 5;
        });

        computedObs2.subscribe(() => {
            assert.equal(computedObs2(), 205);
            done();
        });

        assert.equal(computedObs2(), 155);
        assert.equal(computedObs.dependencies.length, 2);
        assert.equal(computedObs2.dependencies.length, 1);
        obs(100);
    });

    it('should not be notified of changes if value has not changed', () => {
        const obs = project.observable<number>(50);

        const computedObs = project.computed(() => {
            return obs();
        });

        let timesNotified = 0;
        computedObs.subscribe(() => {
            timesNotified += 1;
        });

        obs(100);
        obs(100);
        obs(100);
        setTimeout(() => {
            assert.equal(timesNotified, 1);
        }, 0);
    });
});
