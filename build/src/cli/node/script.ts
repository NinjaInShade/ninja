import path from 'node:path';
import { logger, runAsync, pathExists } from '@ninjalib/util';
import child_process from 'node:child_process';
import { replaceTscAliasPaths } from 'tsc-alias';
import fs from 'node:fs/promises';

const log = logger('build:node');

async function runtime(args) {
    const cwd = process.cwd();

    const entryPoint = args.entry ? path.join(cwd, args.entry) : path.join(cwd, 'src/server/server.ts');

    let subprocess: child_process.ChildProcess;
    if (args['--watch']) {
        subprocess = child_process.spawn('npx tsx watch', ['--clear-screen=false', entryPoint], { stdio: 'inherit', shell: true });
    } else {
        subprocess = child_process.spawn('npx tsx', [entryPoint], { stdio: 'inherit', shell: true });
    }

    subprocess.on('error', (err) => {
        log.error(`Failed to start subprocess: ${err}`);
    });

    subprocess.stdout?.on('data', (data) => {
        log.info(`Stdout: ${data}`);
    });

    subprocess.stderr?.on('data', (data) => {
        log.error(`Stderr: ${data}`);
    });

    subprocess.on('close', (code) => {
        log.info(`Child process exited with code ${code}`);
    });
}

async function build(args) {
    const cwd = process.cwd();
    const entryPoint = args.entry ? path.join(cwd, args.entry) : path.join(cwd, 'src/server/server.ts');
    const outDir = args.outDir ? path.join(cwd, args.outDir) : path.join(cwd, 'dist/node');

    // if outDir exists, remove old build
    if (await pathExists(outDir)) {
        await fs.rm(outDir, { recursive: true, force: true });
    }

    const tempFilePath = path.join(cwd, 'node.tsconfig.json');
    const tempFile = {
        extends: './tsconfig.json',
        compilerOptions: {
            outDir: outDir,
        },
        include: [entryPoint],
    };
    await fs.writeFile(tempFilePath, JSON.stringify(tempFile));

    try {
        try {
            await runAsync(`tsc --project ${tempFilePath}`);
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
export async function node(args: Record<string, string>) {
    if (args['--build']) {
        await build(args);
    } else {
        await runtime(args);
    }
}

export const nodeOptions = {
    '(optional) entry': `The entry point for runtime/building (relative to cwd, defaults to CWD/src/server/server.ts)`,
    '(optional) outDir': 'Where to build the project too (relative to cwd, defaults to CWD/dist/node)',
    '(optional) --watch': 'Enables auto reloading when files are changed',
    '(optional) --build': 'Builds the project instead of running node (cwd must have base tsconfig at root)',
};
