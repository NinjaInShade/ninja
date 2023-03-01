import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';
import util from '../index.js';

const createEnv = async (_path, contents?: string) => {
    const variables = contents ?? `FOO=var1\nBAR=var2`;
    await fs.writeFile(_path, variables);
};

const deleteEnv = async (_path) => {
    try {
        await fs.unlink(_path);
    } catch (err) {
        // pass, file may not exist on every test
    }
};

const _path = path.join(path.resolve(), '.env');

const cleanupHook = async () => {
    process.env = {};
    await deleteEnv(_path);
};

describe('[loadEnv] file reading', () => {
    beforeEach(cleanupHook);
    after(cleanupHook);

    it('should throw if no .env file exists', async () => {
        const cwdPath = path.join(process.cwd(), '.env');
        await assert.rejects(async () => await util.loadEnv(), { message: `Error reading .env file, make sure it exists at: '${cwdPath}'` });
    });

    it('should throw if no .env file exists with custom path', async () => {
        await assert.rejects(async () => await util.loadEnv(_path), { message: `Error reading .env file, make sure it exists at: '${_path}'` });
    });
});

describe('[loadEnv] variable parsing', () => {
    beforeEach(cleanupHook);
    after(cleanupHook);

    it('should parse every variable', async () => {
        await createEnv(_path);
        await util.loadEnv(_path);
        assert.equal(process.env.FOO, 'var1');
        assert.equal(process.env.BAR, 'var2');
    });

    it('should overwrite env var if force param is true', async () => {
        process.env.FOO = 'existing';
        assert.equal(process.env.FOO, 'existing');
        await createEnv(_path);
        await util.loadEnv(_path, true);
        assert.equal(process.env.FOO, 'var1');
    });

    it('should throw if trying to forcefully overwrite existing env var', async () => {
        process.env.FOO = 'existing';
        assert.equal(process.env.FOO, 'existing');
        await createEnv(_path);
        await assert.rejects(async () => await util.loadEnv(_path), { message: `Env variable 'FOO' already exists. Call with 'force' parameter true if you want to forcefully overwrite it` });
        assert.equal(process.env.FOO, 'existing');
    });

    it('should strip leading and trailing whitespace', async () => {
        const variables = `     FOO=var1\nBAR=var2             `;
        await createEnv(_path, variables);
        await util.loadEnv(_path, true);
        assert.equal(process.env.FOO, 'var1');
        assert.equal(process.env.BAR, 'var2');
    });

    it('should strip leading and trailing quotes off values', async () => {
        const variables = `SINGLE_QUOTE='test'\nDOUBLE_QUOTE="test"\nSINGLE_QUOTE_INBETWEEN='te'st'\nDOUBLE_QUOTE_INBETWEEN="te'st"`;
        await createEnv(_path, variables);
        await util.loadEnv(_path);
        assert.equal(process.env.SINGLE_QUOTE, 'test');
        assert.equal(process.env.DOUBLE_QUOTE, 'test');
        assert.equal(process.env.SINGLE_QUOTE_INBETWEEN, `te'st`);
        assert.equal(process.env.DOUBLE_QUOTE_INBETWEEN, `te'st`);
    });

    it('should throw if value is using single quotes but leading quote missing', async () => {
        const variables = `MISSING_LEADING=test'`;
        await createEnv(_path, variables);
        await assert.rejects(async () => await util.loadEnv(_path), { message: `String is not fully enclosed in single quotes` });
        assert.equal(process.env.MISSING_LEADING, undefined);
    });

    it('should throw if value is using single quotes but trailing quote missing', async () => {
        const variables = `MISSING_LEADING='test`;
        await createEnv(_path, variables);
        await assert.rejects(async () => await util.loadEnv(_path), { message: `String is not fully enclosed in single quotes` });
        assert.equal(process.env.MISSING_LEADING, undefined);
    });

    it('should throw if value is using double quotes but leading quote missing', async () => {
        const variables = `MISSING_LEADING=test"`;
        await createEnv(_path, variables);
        await assert.rejects(async () => await util.loadEnv(_path), { message: `String is not fully enclosed in double quotes` });
        assert.equal(process.env.MISSING_LEADING, undefined);
    });

    it('should throw if value is using double quotes but trailing quote missing', async () => {
        const variables = `MISSING_LEADING="test`;
        await createEnv(_path, variables);
        await assert.rejects(async () => await util.loadEnv(_path), { message: `String is not fully enclosed in double quotes` });
        assert.equal(process.env.MISSING_LEADING, undefined);
    });
});
