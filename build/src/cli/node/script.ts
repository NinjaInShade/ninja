import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logError } from '../helpers.js';
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

    // typical run async util doesn't actually output logs to the console
    // const stdout = await runAsync(`node --experimental-specifier-resolution=node --loader file://${loader} ${entryPoint}`);

    child_process.spawn('node', ['--experimental-specifier-resolution=node', `--loader=file://${loader}`, entryPoint], { stdio: 'inherit' });
}

export const nodeOptions = {
    // required
    '(required) file': `The entry point (relative to cwd)`,
};
