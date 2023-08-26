import wtf from 'wtfnode';
import { logger, parseArgs } from '@ninjalib/util';
import { vite as startVite } from '../vite/script';
import { runtime as startNode } from '../node/script';

const log = logger('build:start');

type StartOptions = {
    viteArgs?: string;
    nodeArgs?: string;
};

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
export async function start(options: StartOptions) {
    function createArgs(userArgs: string | undefined) {
        // TODO: fix this hack with first elements being empty
        // Essentially this is done because parseArgs() expects raw argsV where the first 3 elements aren't really relevant
        return userArgs ? ['', '', '', ...userArgs.split(',').filter((arg) => arg.length)] : [];
    }

    const defaultNodeArgs = { '--watch': true };
    const nodeArgs = Object.assign({}, defaultNodeArgs, parseArgs(createArgs(options.nodeArgs)));
    const nodeProc = await startNode(nodeArgs);
    await sleep(250);

    const viteArgs = parseArgs(createArgs(options.viteArgs));
    const viteProc = await startVite(viteArgs);

    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const sig of signals) {
        process.on(sig, async () => {
            log.debug(`Caught '${sig}', passing down to processes`);
            nodeProc.kill(sig);
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
        new Promise<void>((resolve) => nodeProc.on('exit', () => resolve())),
        // vite
        new Promise<void>((resolve) => viteProc.on('exit', () => resolve())),
    ]);

    log.debug('All processes exited');
}

export const startOptions = {};
