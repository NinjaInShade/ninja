import path from 'node:path';
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

    const configFile = args.configFile ? path.join(cwd, args.configFile) : path.join(cwd, 'node_modules', '@ninjalib', 'build', 'configs', 'vite.config.ts');
    viteArgs.push('--clearScreen=false');
    viteArgs.push(`--config="${configFile}"`);
    viteArgs.push(cwd);

    const vite = path.join(cwd, 'node_modules', '.bin', 'vite');
    log.debug('Running vite from', vite);

    // stdio needs to be inherit for Logger terminal padding
    const env = { ...process.env, LOG_PROCESS_NAME: 'vite' };
    process.stderr.isTTY = true;
    const subprocess = child_process.spawn(vite, viteArgs, { stdio: 'inherit', shell: true, env });

    subprocess.stdout?.pipe(process.stdout);

    process.on('exit', (code) => {
        log.debug('Vite script exited with code', code);
    });

    function sigHandler(signal: NodeJS.Signals) {
        log.debug('Got', signal, 'signal, passing down to the vite process');

        const successful = subprocess.kill(signal);
        if (!successful) {
            log.debug('Vite process did not die successfully');
        }
    }

    process.on('SIGINT', () => sigHandler('SIGINT'));
    process.on('SIGTERM', () => sigHandler('SIGTERM'));
}

export const viteOptions = {
    '(optional) --dev': 'Runs the dev server',
    '(optional) --build': 'Builds the project',
    '(optional) --preview': 'Previews the build',
    '(optional) configFile': 'Alternative config file (relative to CWD)',
    '(optional) viteArgs': 'Args to pass to vite, delimited by commas',
};
