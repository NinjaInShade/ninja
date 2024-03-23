import child_process from 'node:child_process';
import { logger } from '@ninjalib/util';

const log = logger('build:test');

/**
 * Test runner
 */
export async function test({ opts, args }) {
    const testArgs = ['--experimental-specifier-resolution=node', `--import=tsx`, '--test-reporter=spec', '--test', '**/test/**/*.{ts,js,mjs}'];

    log.debug('Running test runner with:', testArgs);

    const subprocess = child_process.spawn('node', testArgs, { stdio: 'inherit' });

    subprocess.on('close', (code, signal) => {
        log.debug(`Node test runner process exited with code '${code}' and signal '${signal}'`);
    });
}

export const testOptions = {};
