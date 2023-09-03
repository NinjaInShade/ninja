import wtf from 'wtfnode';
import { logger, parseArgv, ArgV } from '@ninjalib/util';
import { vite as startVite } from '../vite/script';
import { runtime as startNode } from '../node/script';

const log = logger('build:start');

// TODO: move to util
async function sleep(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

/**
 * Process manager for vite/node
 */
export async function start({ opts, args }: ArgV) {
    const createArgs = (userArgs: string) =>
        userArgs
            .split(',')
            .filter((arg) => arg.length)
            .join(' ');

    const nodeArgv = opts['node-args'] ? parseArgv(createArgs(opts['node-args'])) : { opts: {}, args: [] };
    nodeArgv.opts.watch = '--watch';
    const nodeProc = await startNode(nodeArgv);

    await sleep(250);

    const viteArgv = opts['vite-args'] ? parseArgv(createArgs(opts['vite-args'])) : { opts: {}, args: [] };
    const viteProc = await startVite(viteArgv);

    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const sig of signals) {
        process.on(sig, async () => {
            log.debug(`Caught '${sig}', passing down to processes`);
            if (nodeProc) {
                nodeProc.kill(sig);
            }
            viteProc.kill(sig);

            // TODO: Document properly
            const ENABLE_WTF = process.env.WTF;
            if (ENABLE_WTF) {
                await sleep(+ENABLE_WTF);
                wtf.dump();
            }
        });
    }

    await Promise.all([
        // node
        ...(nodeProc ? [new Promise<void>((resolve) => nodeProc.on('exit', () => resolve()))] : []),
        // vite
        new Promise<void>((resolve) => viteProc.on('exit', () => resolve())),
    ]);

    log.debug('All processes exited');
}

export const startOptions = {
    '<opt> --vite-args': 'Options/Arguments to pass down to the vite script',
    '<opt> --node-args': 'Options/Arguments to pass down to the node script',
};
