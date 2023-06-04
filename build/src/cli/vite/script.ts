import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@ninjalib/util';
import child_process from 'node:child_process';

const log = logger('build:vite');

/**
 * Runtime/builder for vite
 */
export async function vite(args: Record<string, string>) {
    const cwd = process.cwd();
    const devMode = args['--dev'];
    const buildMode = args['--build'];
    const previewMode = args['--preview'];
    const extraViteArgs = args['viteArgs'];

    const passedNoMode = !devMode && !buildMode && !previewMode;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const viteArgs: string[] = [];

    if (devMode || passedNoMode) {
        // what base options to pass to dev?
    } else if (buildMode) {
        // what base options to pass to build?
        viteArgs.push('build');
    } else if (previewMode) {
        // what base options to pass to preview?
        viteArgs.push('preview');
    }

    if (extraViteArgs) {
        viteArgs.push(...extraViteArgs.split(','));
    }

    const configFile = args.configFile ? path.join(cwd, args.configFile) : path.join(__dirname, '../../../configs/vite.config.ts');
    viteArgs.push('--clearScreen=false');
    viteArgs.push(`--config="${configFile}"`);
    viteArgs.push(cwd);

    const subprocess = child_process.spawn('npx vite', viteArgs, { stdio: 'inherit', shell: true });

    subprocess.on('error', (err) => {
        log.error(`Failed to start subprocess: ${err}`);
    });

    subprocess.stdout?.on('data', (data) => {
        log.info(`Stdout: ${data}`);
    });

    subprocess.stderr?.on('data', (data) => {
        log.error(`Stderr: ${data}`);
    });

    subprocess.on('close', (code) => {
        log.info(`Child process exited with code ${code}`);
    });
}

export const viteOptions = {
    '(optional) --dev': 'Runs the dev server',
    '(optional) --build': 'Builds the project',
    '(optional) --preview': 'Previews the build',
    '(optional) configFile': 'Alternative config file (relative to CWD)',
    '(optional) viteArgs': 'Args to pass to vite, delimited by commas',
};
