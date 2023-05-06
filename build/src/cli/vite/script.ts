import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logInfo, logError } from '../helpers.js';
import child_process from 'node:child_process';

/**
 * Runtime/builder for vite
 */
export async function vite(args: Record<string, string>) {
    const cwd = process.cwd();
    const devMode = args['--dev'];
    const buildMode = args['--build'];
    const previewMode = args['--preview'];
    const viteUserArgs = args['viteArgs'];

    const passedNoMode = !devMode && !buildMode && !previewMode;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const viteArgs = [];

    if (devMode || passedNoMode) {
        // what base options to pass to dev?
    } else if (buildMode) {
        // what base options to pass to build?
        viteArgs.push('build');
    } else if (previewMode) {
        // what base options to pass to preview?
        viteArgs.push('preview');
    }

    if (viteUserArgs) {
        viteArgs.push(...viteUserArgs.split(','));
    }

    const configFile = path.join(__dirname, '../../../configs/vite.config.ts');
    viteArgs.push('--clearScreen=false');
    viteArgs.push(`--config="${configFile}"`);
    viteArgs.push(cwd);

    const subprocess = child_process.spawn('npx vite', viteArgs, { stdio: 'inherit', shell: true });

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

export const viteOptions = {
    '(optional) --dev': 'Runs the dev server in cwd',
    '(optional) --build': 'Builds the project in cwd',
    '(optional) --preview': 'Previews the build in cwd',
    '(optional) --viteArgs': 'Args to pass to vite, delimited by commas',
};
