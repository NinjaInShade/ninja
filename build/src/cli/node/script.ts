import path from 'node:path';
import { logInfo, logError, runAsync } from '../helpers.js';
import child_process from 'node:child_process';
import { replaceTscAliasPaths } from 'tsc-alias';
import fs from 'node:fs/promises';

async function runtime(args) {
    const entryPointFile = args.file;

    const cwd = process.cwd();
    const entryPoint = path.join(cwd, entryPointFile);

    let subprocess: child_process.ChildProcess;
    if (args['--dev']) {
        subprocess = child_process.spawn('npx tsx watch', ['--clear-screen=false', entryPoint], { stdio: 'inherit', shell: true });
    } else {
        subprocess = child_process.spawn('npx tsx', [entryPoint], { stdio: 'inherit', shell: true });
    }

    subprocess.on('error', (err) => {
        logError(`failed to start subprocess: ${err}`);
    });

    subprocess.stdout?.on('data', (data) => {
        logInfo(`stdout: ${data}`);
    });

    subprocess.stderr?.on('data', (data) => {
        logError(`stderr: ${data}`);
    });

    subprocess.on('close', (code) => {
        logInfo(`child process exited with code ${code}`);
    });
}

async function build(args) {
    const entryPointFile = args.file;
    const outDir = args.outDir;

    if (!outDir) {
        logError('outDir arg is required');
        return;
    }

    const cwd = process.cwd();
    const tempFilePath = path.join(cwd, 'node.tsconfig.json');
    const tempFile = {
        extends: './tsconfig.json',
        compilerOptions: {
            outDir: outDir,
        },
        include: [entryPointFile],
    };
    await fs.writeFile(tempFilePath, JSON.stringify(tempFile));

    try {
        try {
            await runAsync(`tsc --project ${tempFilePath} && tsc-alias --project ${tempFilePath}`);
        } catch (err) {
            // pass - most of the time this is just tsc complaining, the command doesn't actually "fail"
        }

        // TODO?: there is a case this doesn't work, and doesn't replace the alias, if it meets these conditions:
        // - the file you are aliasing is in the same folder
        // - you only compile that one folder
        // Would be nice to get fixed, but it's not so important right now however because:
        // - if you are importing from same directory, you should just always use relative import "./"
        // - not very often is the project only going to have one folder to build from
        await replaceTscAliasPaths({ configFile: tempFilePath, resolveFullPaths: true });
    } catch (err) {
        console.log(err);
        await fs.unlink(tempFilePath);
    }
    await fs.unlink(tempFilePath);
}

/**
 * Runtime/builder for node with typescript, compatible with ESM and ts paths
 */
export async function node(args: Record<string, string>) {
    const entryPointFile = args.file;
    if (!entryPointFile) {
        logError('file arg is required');
        return;
    }

    if (args['--build']) {
        await build(args);
    } else {
        await runtime(args);
    }
}

export const nodeOptions = {
    // required
    '(required) file': `The entry point for runtime/building (relative to cwd)`,
    // optional
    '(optional) --dev': 'Enables auto reloading when files are changed',
    '(optional) --build': 'Builds the project instead of running node (cwd must have base tsconfig at root)',
    '(optional) outDir': 'Where to build the project too (relative to cwd, required if --build passed)',
};
