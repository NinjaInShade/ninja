import child_process from 'node:child_process';
import fs from 'node:fs/promises';
import util from 'node:util';
import path from 'node:path';

/**
 * TODO: move to util
 */
export const colours = {
    // misc
    reset: '\x1b[0m',
    bold: '\x1b[1m', // Bright
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    strikethrough: '\x1b[9m',

    // colours
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    grey: '\x1b[90m', // gray
    crimson: '\x1b[38m', // scarlet

    // background
    bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
        gray: '\x1b[100m',
        crimson: '\x1b[48m',
    },
};

/**
 * Utility log function to reset text color before/after string to prevent color bleeding
 *
 * // TODO: move log functions to util
 */
export const logLine = (...messages: any[]) => {
    console.log(...messages, colours.reset);
};

/**
 * Utility info log function
 */
export const logInfo = (...messages: any[]) => {
    logLine(colours.bold + colours.blue + '[INFO]' + colours.reset, ...messages);
};

/**
 * Utility success log function
 */
export const logSuccess = (...messages: any[]) => {
    logLine(colours.bold + colours.green + '[GOOD]' + colours.reset, ...messages);
};

/**
 * Utility error log function
 */
export const logError = (...messages: any[]) => {
    logLine(colours.bold + colours.red + '[FAIL]' + colours.reset, ...messages);
};

/**
 * Utility warn log function
 */
export const logWarn = (...messages: any[]) => {
    logLine(colours.bold + colours.yellow + '[WARN]' + colours.reset, ...messages);
};

/**
 * Raw command-line arg parser
 *
 * // TODO: move to util
 */
export const parseArgs = (rawArgs: string[]): Record<string, string | boolean> => {
    // don't include the initial script arg
    rawArgs.shift();

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

/**
 *  Runs a shell command asynchronously
 *
 * // TODO: move to util
 */
export async function runAsync(cmd: string, opts: { cwd?: string } = {}): Promise<any> {
    const defaultOpts = {
        cwd: process.cwd(),
    };
    const _opts = Object.assign(defaultOpts, opts);

    const exec = util.promisify(child_process.exec);
    const { stdout, stderr } = await exec(cmd, _opts);
    if (stderr) {
        logError(`got stderr: ${stderr}`);
        return;
    }

    return stdout;
}

/**
 * Checks if path exists
 *
 * @param path: path to a file or directory
 *
 * // TODO: move to util
 */
export async function pathExists(path: string): Promise<boolean> {
    try {
        await fs.access(path, fs.constants.R_OK);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Copies file from source to target
 *
 * @param source: (abs) path to the source file
 * @param target: (abs) path to the target location
 * @param force: doesn't hard error if source doesn't exist
 *
 * // TODO: move to util
 */
export async function copyFile(source: string, target: string, force = false) {
    const srcExists = await pathExists(source);
    if (!srcExists) {
        if (!force) {
            throw new Error(`source file '${source}' doesn't exist, bailing`);
        }
        logWarn(`Failed to copy '${path.basename(source)}' as it doesn't exist, but got force so quietly stopping`);
        return;
    }

    await fs.writeFile(target, await fs.readFile(source));
}

type CopyDirRecursiveOpts = {
    force?: boolean;
    showLogs?: boolean;
    skipSymlinks?: boolean;
};

/**
 *  Copies source directory and it's contents recursively to a target location
 *
 * // TODO: move to util
 */
export async function copyDirRecursive(source: string, target: string, opts: CopyDirRecursiveOpts = {}) {
    const defaultOpts = {
        force: false,
        showLogs: false,
        skipSymlinks: false,
    };
    const _opts = Object.assign(defaultOpts, opts);

    const srcExists = await pathExists(source);
    if (!srcExists) {
        if (!_opts.force) {
            throw new Error(`source directory '${source}' doesn't exist, bailing`);
        }
        logWarn(`Failed to copy '${path.basename(source)}' as it doesn't exist, but got force so quietly stopping`);
        return;
    }

    const targetExists = await pathExists(target);
    if (!targetExists) {
        if (!_opts.force) {
            throw new Error(`target directory '${target}' doesn't exist, bailing`);
        }
        await fs.mkdir(target, { recursive: true });
    }

    const files = await fs.readdir(source, { withFileTypes: true });
    for (const file of files) {
        const stat = await fs.lstat(path.join(source, file.name));
        const srcPath = path.join(source, file.name);
        const targetPath = path.join(target, file.name);

        if (stat.isDirectory()) {
            if (_opts.showLogs) {
                logInfo(`Copying directory ${srcPath} to ${targetPath}`);
            }
            await copyDirRecursive(srcPath, targetPath, _opts);
        } else if (stat.isSymbolicLink()) {
            if (_opts.skipSymlinks) {
                if (_opts.showLogs) {
                    logWarn(`Skipping copying symlink ${srcPath} to ${targetPath}`);
                }
                continue;
            }
            if (_opts.showLogs) {
                logInfo(`Copying symbolic link ${srcPath} to ${targetPath}`);
            }
            const link = await fs.readlink(srcPath);
            await fs.symlink(link, targetPath);
        } else {
            if (_opts.showLogs) {
                logInfo(`Copying file ${srcPath} to ${targetPath}`);
            }
            await copyFile(srcPath, targetPath, _opts.force);
        }
    }
}
