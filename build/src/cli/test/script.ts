import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import child_process from 'node:child_process';
import { logLine, logInfo, logError, runAsync } from '../helpers.js';

/**
 * Test runner
 */
export async function test(args: Record<string, string>) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const loader = path.join(__dirname, '../', 'node', 'loader.js');

    // typical run async util doesn't actually output logs to the console
    // const stdout = await runAsync(`node --experimental-specifier-resolution=node --loader file://${loader} ${entryPoint}`);

    await runAsync('npm run build');
    const cmd = child_process.spawn('node', ['--experimental-specifier-resolution=node', `--loader=file://${loader}`, '--test-reporter=spec', '--test', './dist/test'], { stdio: 'inherit' });

    cmd.stdout?.on('data', (data) => {
        logLine('');
        logInfo(`stdout: ${data}`);
    });

    cmd.stderr?.on('data', (data) => {
        logLine('');
        logError(`stderr: ${data}`);
    });

    cmd.on('close', (code) => {
        logLine('');
        logInfo(`child process exited with code ${code}`);
    });
}

export const testOptions = {
    // required
    // optional
};
