import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import project from '~/index';

const client = project.client();

const resetClientVars = () => {
    const varKeys = Object.keys(client.variables);
    for (const key of varKeys) {
        client.set(key, undefined);
    }
};

describe('[client] client variables', () => {
    beforeEach(() => resetClientVars());

    it(`should set and get client variable that's type 'string'`, async () => {
        client.set('foo', 'Foo!');
        assert.equal(client.get('foo'), 'Foo!');
    });

    it(`should set and get client variable that's type 'number'`, async () => {
        client.set('foo', 5);
        assert.equal(client.get('foo'), 5);
        client.set('foo', 8.52);
        assert.equal(client.get('foo'), 8.52);
    });

    it(`should set and get client variable that's type 'boolean'`, async () => {
        client.set('foo', true);
        assert.equal(client.get('foo'), true);
        client.set('foo', false);
        assert.equal(client.get('foo'), false);
    });

    it(`should set and get client variable that's type 'null'`, async () => {
        client.set('foo', null);
        assert.equal(client.get('foo'), null);
    });

    it(`should set and get client variable that's type 'Date'`, async () => {
        const now = new Date();
        client.set('foo', now);
        assert.equal(client.get('foo'), now);
    });

    it(`should set and get client variable that's an object`, async () => {
        client.set('foo', { a: 1, b: 2, c: 3 });
        assert.deepEqual(client.get('foo'), { a: 1, b: 2, c: 3 });
    });

    it(`should set and get client variable that's an array of strings and numbers`, async () => {
        client.set('foo', ['a', 1, 'b', 2, 'c', 3]);
        assert.deepEqual(client.get('foo'), ['a', 1, 'b', 2, 'c', 3]);
    });

    it(`should set and get client variable that's an array of objects`, async () => {
        client.set('foo', [{ a: 1 }, { b: 2 }, { c: 3 }]);
        assert.deepEqual(client.get('foo'), [{ a: 1 }, { b: 2 }, { c: 3 }]);
    });

    it('should not add to variable object if value is undefined and does not exist already', async () => {
        assert.equal(Object.keys(client.variables).length, 0);
        client.set('foo', undefined);
        assert.equal(Object.keys(client.variables).length, 0);
        assert.equal(client.get('foo'), undefined);
    });

    it('should delete variable if value is undefined and exists already', async () => {
        assert.equal(Object.keys(client.variables).length, 0);
        client.set('foo', 'Foo!');
        assert.equal(Object.keys(client.variables).length, 1);
        assert.equal(client.get('foo'), 'Foo!');
        client.set('foo', undefined);
        assert.equal(Object.keys(client.variables).length, 0);
        assert.equal(client.get('foo'), undefined);
    });
});

describe('[client] instance', () => {
    beforeEach(() => resetClientVars());

    it(`should return the only instance of Client`, async () => {
        client.set('a', 1);
        client.set('b', 2);
        const _client = project.getClient();
        assert.deepEqual(_client, client);
        assert.equal(_client.get('a'), 1);
        assert.equal(_client.get('b'), 2);
    });
});
