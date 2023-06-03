import { logger } from '~/node';
import child_process from 'node:child_process';
import util from 'node:util';

const log = logger('util:shell');

type RunAsyncOptions = {
    /**
     * @default process.cwd()
     */
    cwd?: string;
};

/**
 *  Runs a shell command asynchronously
 *
 * @param cmd: the command to run on the shell
 * @param options: various options to pass to runAsync
 *
 * @returns { stderr, stdout }
 */
export async function runAsync(cmd: string, options: RunAsyncOptions = {}): Promise<{ stderr: string; stdout: string }> {
    const defaultOpts = {
        cwd: process.cwd(),
    };
    const opts = Object.assign(defaultOpts, options);

    const exec = util.promisify(child_process.exec);
    const { stdout, stderr } = await exec(cmd, opts);

    if (stderr) {
        log.error('Got stderr:', stderr);
    }

    return { stderr, stdout };
}

/**
 * Raw command-line arg parser
 *
 * @param rawArgs: the raw args you receive from process.argv (args at index 0-2 are ignored, as they are not relevant)
 */
export const parseArgs = (rawArgs: string[]): Record<string, string | boolean> => {
    rawArgs.splice(0, 3);

    const parsedArgs: Record<string, string | boolean> = {};

    for (const arg of rawArgs) {
        // Flag arg
        if (arg.startsWith('--') || arg.startsWith('-')) {
            parsedArgs[arg] = true;
            continue;
        }

        // Key:value arg
        const split = arg.split('=');
        const option = split[0];
        const value = split.length > 2 ? split.slice(1).join('=') : split[1];
        parsedArgs[option] = value?.trim();
    }

    return parsedArgs;
};
