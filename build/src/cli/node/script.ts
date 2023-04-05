import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logLine, logInfo, logError } from '../helpers.js';
import child_process from 'node:child_process';

/**
 * Runtime for node with typescript, compatible with ESM and ts paths
 */
export async function node(args: Record<string, string>) {
    const entryPointFile = args.file;
    if (!entryPointFile) {
        logError('file arg is required');
        return;
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const cwd = process.cwd();
    const loader = path.join(__dirname, 'loader.js');
    const entryPoint = path.join(cwd, entryPointFile);

    // TODO: the idea was to use ts-node-dev however this doesn't work with custom esm loader?? https://github.com/wclr/ts-node-dev/issues/314
    const nodemon = path.join(__dirname, '../../../node_modules/.bin/nodemon');
    const subprocess = child_process.spawn(nodemon, ['--exec', 'node', '--experimental-specifier-resolution=node', `--loader=file://${loader}`, entryPoint], { stdio: 'inherit', shell: true });

    subprocess.on('error', (err) => {
        logError(`failed to start subprocess: ${err}`);
    });

    subprocess.stdout?.on('data', (data) => {
        logInfo(`stdout: ${data}`);
    });

    subprocess.stderr?.on('data', (data) => {
        logError(`stderr: ${data}`);
    });

    subprocess.on('close', (code) => {
        logInfo(`child process exited with code ${code}`);
    });
}

export const nodeOptions = {
    // required
    '(required) file': `The entry point (relative to cwd)`,
};
