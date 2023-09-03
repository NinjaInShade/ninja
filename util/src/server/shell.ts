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

export type ArgV = { opts: Record<string, string>; args: string[] };

/**
 * Simple CLI argv parser
 *
 * Parses arguments/options from `process.argv`.
 *
 * Chaining options with one leading hyphen is not supported at the moment (e.g. `script -abcd` a, b, c, d being separate options)
 *
 * Option values defined after single hyphen option is not supported at the moment (e.g. `script -p some_port` some_port will be parsed as a standard argument).
 * Use double hyphen syntax to specify an option value: `script --port=some_port`
 *
 * @param argv?: alternative argv instead of using `process.argv`
 */
export function parseArgv(argv?: string): ArgV {
    const [execPath, filePath, ...other] = process.argv;

    if (argv !== undefined && typeof argv !== 'string') {
        throw new Error('Expected argv to be a string');
    }

    const _argv = argv ? argv.split(' ') : other;

    const opts: Record<string, string> = {};
    const args: string[] = [];

    for (const item of _argv) {
        // ['ninja-cli', 'test', '-d', '--verbose', '--prefix=[testing]', './src/test/test.js']
        if (item.startsWith('--')) {
            if (item.includes('=')) {
                const [opt, ...rest] = item.split('=');
                let value = rest.join('=');
                // strip surrounding single or double quotes
                if ((value.at(0) === `'` && value.at(-1) === `'`) || (value.at(0) === `"` && value.at(-1) === `"`)) {
                    value = value.substring(1, value.length - 1);
                }
                opts[opt.substring(2)] = value;
            } else {
                opts[item.substring(2)] = item;
            }
        } else if (item.startsWith('-')) {
            opts[item.substring(1)] = item;
        } else {
            args.push(item);
        }
    }

    return {
        opts,
        args,
    };
}
