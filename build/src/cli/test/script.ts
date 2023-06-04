import child_process from 'node:child_process';
import { runAsync, logger } from '@ninjalib/util';

const log = logger('build:test');

/**
 * Test runner
 */
export async function test(args: Record<string, string>) {
    // typical run async util doesn't actually output logs to the console
    // const __filename = fileURLToPath(import.meta.url);
    // const __dirname = dirname(__filename);
    // const loader = path.join(__dirname, '../', 'node', 'loader.js');
    // const subprocess = child_process.spawn('node', ['--experimental-specifier-resolution=node', `--loader=file://${loader}`, '--test-reporter=spec', '--test', './dist/test'], { stdio: 'inherit' });

    await runAsync('npm run build');
    const subprocess = child_process.spawn('node', ['--experimental-specifier-resolution=node', `--loader=tsx`, '--test-reporter=spec', '--test', './dist/test'], { stdio: 'inherit' });

    subprocess.on('error', (err) => {
        log.error(`failed to start subprocess: ${err}`);
    });

    subprocess.stdout?.on('data', (data) => {
        log.info(`stdout: ${data}`);
    });

    subprocess.stderr?.on('data', (data) => {
        log.error(`stderr: ${data}`);
    });

    subprocess.on('close', (code) => {
        log.info(`child process exited with code ${code}`);
    });
}

export const testOptions = {};
