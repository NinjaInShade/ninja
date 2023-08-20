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

    // FUTURE: stdio needs to be inherit for Logger terminal padding
    // const subProc = child_process.spawn(vite, viteArgs, { stdio: 'inherit', shell: true, env: { ...process.env, LOG_PROCESS_NAME: 'vite' } });

    // FIXME: https://github.com/vitejs/vite/issues/11434
    // If we run in stdio: 'inherit' because of the above issue (or something similar) Ctrl-C won't kill all processes (in the case of the start script, where it also runs the node process)
    // However this piping breaks terminal logger padding if ever we pipe vite logs so they get outputted using our own logger
    const subProc = child_process.spawn(vite, viteArgs, { shell: true, env: { ...process.env, LOG_PROCESS_NAME: 'vite' } });
    subProc.stdin.pipe(process.stdin);
    subProc.stdout.pipe(process.stdout);

    subProc.on('exit', (code, signal) => {
        log.debug(`Vite process exited with code '${code}' and signal '${signal}'`);
    });

    return subProc;
}

export const viteOptions = {
    '(optional) --dev': 'Runs the dev server',
    '(optional) --build': 'Builds the project',
    '(optional) --preview': 'Previews the build',
    '(optional) configFile': 'Alternative config file (relative to CWD)',
    '(optional) viteArgs': 'Args to pass to vite, delimited by commas',
};
