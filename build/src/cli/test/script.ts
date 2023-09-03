import child_process from 'node:child_process';
import path from 'node:path';
import { logger } from '@ninjalib/util';
import fsp from 'node:fs/promises';

const log = logger('build:test');

/**
 * Test runner
 */
export async function test({ opts, args }) {
    // TODO: until https://github.com/nodejs/node/pull/47653 is in node and have updated, test running is restricted to running from test directory directly.
    // This is due to not being able to give the test runner a directory or glob pattern *when* using a loader - it just finds 0 tests and does nothing.

    const base = path.basename(process.cwd());
    if (base !== 'test') {
        log.error('Run tests from the `test` directory');
        return;
    }

    const files = (await fsp.readdir('./', { recursive: true })).filter((file) => ['.js', '.ts', '.cjs', '.mjs'].some((ext) => file.endsWith(ext)));
    const testArgs = ['--experimental-specifier-resolution=node', `--loader=tsx`, '--test-reporter=spec', '--test', ...files];

    log.debug('Running test runner with:', testArgs);

    const subprocess = child_process.spawn('node', testArgs, { stdio: 'inherit' });

    subprocess.on('close', (code, signal) => {
        log.debug(`Node test runner process exited with code '${code}' and signal '${signal}'`);
    });
}

export const testOptions = {};
