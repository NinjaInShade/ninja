import path from 'node:path';
import { logger, type ArgV } from '@ninjalib/util';
import child_process from 'node:child_process';

const log = logger('build:vite');

/**
 * Runtime/builder for vite
 */
export async function vite({ opts, args }: ArgV) {
    const cwd = process.cwd();
    const devMode = opts.d ?? opts.dev;
    const buildMode = opts.b ?? opts.build;
    const previewMode = opts.p ?? opts.preview;
    const extraViteArgs = opts['vite-args'];

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

    const configFile = opts['config-file']
        ? path.join(cwd, opts['config-file'])
        : path.join(cwd, 'node_modules', '@ninjalib', 'build', 'configs', 'vite.config.ts');
    viteArgs.push('--clearScreen=false');
    viteArgs.push(`--config="${configFile}"`);
    viteArgs.push(cwd);

    log.debug('Running vite with args', viteArgs);

    // FUTURE: stdio needs to be inherit for Logger terminal padding
    // const subProc = child_process.spawn(vite, viteArgs, { stdio: 'inherit', shell: true, env: { ...process.env, LOG_PROCESS_NAME: 'vite' } });

    // FIXME: https://github.com/vitejs/vite/issues/11434
    // If we run in stdio: 'inherit' because of the above issue (or something similar) Ctrl-C won't kill all processes (in the case of the start script, where it also runs the node process)
    // However this piping breaks terminal logger padding if ever we pipe vite logs so they get outputted using our own logger
    const subProc = child_process.spawn('npx vite', viteArgs, { shell: true, env: { ...process.env, LOG_PROCESS_NAME: 'vite' } });
    subProc.stdin.pipe(process.stdin);
    subProc.stdout.pipe(process.stdout);

    subProc.on('exit', (code, signal) => {
        log.debug(`Vite process exited with code '${code}' and signal '${signal}'`);
    });

    return subProc;
}

export const viteOptions = {
    '<opt> -d --dev': 'Runs the dev server',
    '<opt> -p --preview': 'Previews the build',
    '<opt> -b --build': 'Builds the project',
    '<opt> --config-file': 'Alternative config file - relative to CWD',
    '<opt> --vite-args': 'Args to pass to vite, delimited by commas',
};
