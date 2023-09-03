import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseArgv } from '~/index';

describe('[parseArgv] should parse opts/args', () => {
    it('should error if argv argument is parsed in but not string', function () {
        assert.throws(
            () => {
                parseArgv(true);
            },
            { message: 'Expected argv to be a string' }
        );
    });

    it('should parse anything without leading hyphen/s as an argument', function () {
        const argv = 'ninja-cli test -v --log ./src/test';
        const { args } = parseArgv(argv);
        assert.deepEqual(args, ['ninja-cli', 'test', './src/test']);
    });

    it('should parse single hyphen flag options', function () {
        const argv = 'ninja-cli test -v -kill -port';
        const { opts } = parseArgv(argv);
        assert.deepEqual(opts, {
            v: '-v',
            kill: '-kill',
            port: '-port',
        });
    });

    it('should parse double hyphen flag options', function () {
        const argv = 'ninja-cli test --verbose --kill-others --port';
        const { opts } = parseArgv(argv);
        assert.deepEqual(opts, {
            verbose: '--verbose',
            'kill-others': '--kill-others',
            port: '--port',
        });
    });

    it('should parse double hyphen value options', function () {
        const argv = 'ninja-cli test --log-level=DEBUG --port=3306';
        const { opts } = parseArgv(argv);
        assert.deepEqual(opts, {
            'log-level': 'DEBUG',
            port: '3306',
        });
    });

    it('should parse double hyphen value options with "=" character included in value', function () {
        const argv = 'ninja-cli test --prefix=TEST=TRUE';
        const { opts } = parseArgv(argv);
        assert.deepEqual(opts, {
            prefix: 'TEST=TRUE',
        });
    });

    it('should strip surrounding single quotes in double hyphen option value', function () {
        const argv = `ninja-cli test --log-level='DEBUG'`;
        const { opts } = parseArgv(argv);
        assert.deepEqual(opts, {
            'log-level': 'DEBUG',
        });
    });

    it('should strip surrounding double quotes in double hyphen option value', function () {
        const argv = `ninja-cli test --log-level="DEBUG"`;
        const { opts } = parseArgv(argv);
        assert.deepEqual(opts, {
            'log-level': 'DEBUG',
        });
    });
});
