import child_process, { type ChildProcess } from 'node:child_process';
import { logger } from '@ninjalib/util';

const log = logger('build:start');

type StartOptions = {
    viteArgs?: string;
    viteVars?: string;

    nodeArgs?: string;
    nodeVars?: string;
};

/**
 * Process manager for vite/node
 */
export async function start(options: StartOptions) {
    // TODO: move to util
    async function sleep(ms: number) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    function createArgs(defaults: string[], userArgs: string | undefined) {
        const extraArgs = userArgs ? userArgs.split(',').filter((arg) => arg.length) : [];
        return [...defaults, ...extraArgs];
    }

    function createVars(defaults: Record<string, string>, userVars: string | undefined) {
        const extraArgs = userVars
            ? userVars.split(',').reduce((prev, curr) => {
                  if (curr.length) {
                      const [key, value] = curr.split('=');
                      prev[key] = value;
                  }
                  return prev;
              }, {})
            : {};
        return {
            ...defaults,
            ...extraArgs,
        };
    }

    type SubProcessMeta = {
        name: string;
        cmd: string;
        args: string[];
        vars: {};
    };

    async function createVite() {
        const name = 'vite';
        const args = createArgs(['vite'], options.viteArgs);
        const vars = createVars({}, options.viteVars);
        return { name, cmd: 'ninja-cli', args, vars };
    }

    async function createNode() {
        const name = 'node';
        const args = createArgs(['node', '--watch'], options.nodeArgs);
        const vars = createVars({}, options.nodeVars);
        return { name, cmd: 'ninja-cli', args, vars };
    }

    const viteProc = await createVite();
    const nodeProc = await createNode();

    const processes: SubProcessMeta[] = [];
    const runningProcesses: [SubProcessMeta['name'], ChildProcess][] = [];

    if (nodeProc) {
        processes.push(nodeProc);
    }
    if (viteProc) {
        processes.push(viteProc);
    }

    for (const proc of processes) {
        log.info('Starting', proc.name, 'process');

        // stdio needs to be inherit for Logger terminal padding
        const env = { ...process.env, ...proc.vars };
        const subProc = child_process.spawn(proc.cmd, proc.args, { shell: true, stdio: 'inherit', env });

        runningProcesses.push([proc.name, subProc]);

        // gives node process a small time to boot up
        await sleep(100);
    }

    process.on('exit', (code) => {
        log.debug('Start script exited with code', code);
    });

    async function sigHandler(signal: NodeJS.Signals) {
        for (const [name, subProc] of runningProcesses) {
            log.debug('Got', signal, 'signal, passing down to the', name, 'process');

            const successful = subProc.kill(signal);
            if (!successful) {
                log.debug(name, 'subprocess did not die successfully');
            }
        }
    }

    process.on('SIGINT', async () => await sigHandler('SIGINT'));
    process.on('SIGTERM', async () => await sigHandler('SIGTERM'));
}

export const startOptions = {};
