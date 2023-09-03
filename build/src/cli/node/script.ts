import path from 'node:path';
import { logger, runAsync, pathExists, type ArgV } from '@ninjalib/util';
import child_process from 'node:child_process';
import { replaceTscAliasPaths } from 'tsc-alias';
import fs from 'node:fs/promises';

const log = logger('build:node');

export async function runtime({ opts, args }: ArgV) {
    const cwd = process.cwd();
    const entrypoint = args.length ? path.join(cwd, args[args.length - 1]) : path.join(cwd, 'src/server/server.ts');
    const shouldWatch = (opts.w || opts.watch) && !opts.nw && !opts['no-watch'];

    const entrypointExists = await pathExists(entrypoint);
    if (!entrypointExists) {
        log.error(`Entrypoint '${entrypoint}' does not exist`);
        return;
    }

    const tsxArgs: string[] = [];
    if (shouldWatch) {
        tsxArgs.push('watch', '--clear-screen=false');
    }
    tsxArgs.push(entrypoint);
    log.debug('Running tsx with args', tsxArgs);

    // stdio needs to be inherit for Logger terminal padding
    const subProc = child_process.spawn('npx tsx', tsxArgs, { stdio: 'inherit', shell: true, env: { ...process.env, LOG_PROCESS_NAME: 'node' } });

    subProc.on('exit', (code, signal) => {
        log.debug(`Node process exited with code '${code}' and signal '${signal}'`);
    });

    return subProc;
}

async function build({ opts, args }: ArgV) {
    const cwd = process.cwd();
    const entrypoint = args.length ? path.join(cwd, args[args.length - 1]) : path.join(cwd, 'src/server/server.ts');
    const out = opts.o || opts.out ? path.join(cwd, opts.out) : path.join(cwd, 'dist/node');

    const entrypointExists = await pathExists(entrypoint);
    if (!entrypointExists) {
        log.error(`Entrypoint '${entrypoint}' does not exist`);
        return;
    }

    // if output directory already exists, remove old build
    if (await pathExists(out)) {
        await fs.rm(out, { recursive: true, force: true });
    }

    const tempFilePath = path.join(cwd, 'node.tsconfig.json');
    const tempFile = {
        extends: './tsconfig.json',
        compilerOptions: {
            outDir: out,
        },
        include: [entrypoint],
    };
    await fs.writeFile(tempFilePath, JSON.stringify(tempFile));

    try {
        try {
            await runAsync(`npx tsc --project ${tempFilePath}`);
        } catch (err) {
            // pass - most of the time this is just tsc complaining,
            // the command doesn't actually "fail"
        }

        // TODO?: there is a case this doesn't work, and doesn't replace the alias, if it meets these conditions:
        // - the file you are aliasing is in the same folder
        // - you only compile that one folder
        // Would be nice to get fixed, but it's not so important right now however because:
        // - if you are importing from same directory, you should just always use relative import "./"
        // - not very often is the project only going to have one folder to build from
        await replaceTscAliasPaths({ configFile: tempFilePath, resolveFullPaths: true });
    } catch (err) {
        throw err;
    } finally {
        await fs.unlink(tempFilePath);
    }
}

/**
 * Runtime/builder for node with typescript, compatible with ESM and ts paths
 */
export async function node(argv: ArgV) {
    const shouldBuild = argv.opts['b'] || argv.opts['build'];

    if (shouldBuild) {
        await build(argv);
    } else {
        await runtime(argv);
    }
}

export const nodeOptions = {
    '<arg> entrypoint': 'Entrypoint to use for building/runtime - defaults to CWD/src/server/server.ts',
    '<opt> -b --build': 'Builds the project instead of running node - CWD must have base tsconfig at root',
    '<opt> -w --watch': 'Enables auto reloading when files are changed',
    '<opt> -nw --no-watch': 'Overrides -w --watch flags',
    '<opt> --out': 'Where the output of the build goes to - relative to CWD, defaults to CWD/dist/node',
};
