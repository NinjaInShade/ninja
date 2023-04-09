import path from 'node:path';
import fs from 'node:fs/promises';
import { colours, logLine, logInfo, logError, logWarn, logSuccess, runAsync, copyFile, copyDirRecursive } from '../helpers.js';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

export type PackageJson = {
    name: string;
    version: string;
    devDependencies: Record<string, string>;
    dependencies: Record<string, string>;
};

async function readPackageJson(path: string, type: 'source' | 'target' | 'targets source'): Promise<PackageJson | null> {
    try {
        const file = await fs.readFile(path, { encoding: 'utf-8' });
        return JSON.parse(file);
    } catch (err: any) {
        logLine('');
        if (err.code === 'ENOENT') {
            logError(`cannot read ${type} package.json, does it exist?`);
        } else {
            logError(`cannot parse ${type} package.json, make sure it's valid`);
        }
        return null;
    }
}

/**
 * gets all available options to copy to
 *
 * an option is valid if:
 * 1) lives in ../ relative to the src dir
 * 2) has a valid package.json at the root
 */
async function getTargetOptions(srcDir: string): Promise<string[]> {
    const options = [];

    const dirsPath = path.join(srcDir, '..');
    const dirs = (await fs.readdir(dirsPath, { withFileTypes: true })).filter((dir) => dir.isDirectory()).map((dir) => dir.name);
    for (const dir of dirs) {
        const dirPkgJsonPath = path.join(dirsPath, dir, 'package.json');
        let isValid = true;
        try {
            const file = await fs.readFile(dirPkgJsonPath, { encoding: 'utf-8' });
            JSON.parse(file);
        } catch (err: any) {
            isValid = false;
        }

        if (isValid) {
            options.push(dir);
        }
    }

    return options;
}

async function showTargetSelectMenu(targetOptions: string[], DEFAULT_TARGET: string | number, srcName: string) {
    logLine(`\n${colours.bold}${colours.blue}[COPY] Select which project/library to copy to:`);
    logLine(`${colours.grey}Copies source package and dependencies if required to the target\n`);
    for (let i = 0; i < targetOptions.length; i++) {
        const option = targetOptions[i];
        logLine(`${colours.blue}${colours.bold}${i + 1})${colours.reset} ${colours.grey}${`@ninjalib/${option}` === srcName ? colours.strikethrough : ''}${option}${colours.reset}`);
    }
    const rl = readline.createInterface(stdin, stdout);
    let selectedTarget: string | number;
    while (selectedTarget === undefined) {
        const answer = await rl.question(`\nLocation to copy to (${DEFAULT_TARGET}) >> `);
        if (!answer.length) {
            selectedTarget = DEFAULT_TARGET;
            break;
        }
        const answerParsed = Number(answer);
        // if number, user selected by list index
        // if string, user typed target name directly
        if (!Number.isNaN(answerParsed)) {
            selectedTarget = answerParsed;
        } else {
            selectedTarget = answer;
        }
    }
    rl.close();
    return selectedTarget;
}

/**
 * copies source library to a target project/library
 *
 * useful for testing libs in real projects without publishing
 */
export async function copy(args: Record<string, string>) {
    const cwd = process.cwd();

    // get source package.json
    const srcDir = args.sourceDir ? path.join(cwd, args.sourceDir) : cwd;
    const srcPkgJsonPath = path.join(srcDir, 'package.json');
    const srcPkgJson = await readPackageJson(srcPkgJsonPath, 'source');
    if (!srcPkgJson) return;

    // check if source is a @ninjalib pkg
    if (!srcPkgJson.name.startsWith('@ninjalib')) {
        logError('source must be a @ninjalib package');
        return;
    }

    let selectedTarget: string | number;
    if (!args.targetDir) {
        const targetOptions = await getTargetOptions(srcDir);
        if (!targetOptions.length) {
            logLine('');
            logError('found 0 potential targets, make sure there are valid locations to copy to one level above from cwd/sourceDir');
            return;
        }
        // this means user can input one of the options literally as a string or it's index
        selectedTarget = await showTargetSelectMenu(targetOptions, targetOptions[0], srcPkgJson.name);
        const targetOptionStringIndex = targetOptions.findIndex((opt) => opt === selectedTarget);
        const targetOptionNumberIndex = targetOptions[Number(selectedTarget) - 1];
        const index = (targetOptionStringIndex + 1 || selectedTarget) as number;

        if (targetOptionStringIndex === -1 && !targetOptionNumberIndex) {
            logLine('');
            logError(`target ${selectedTarget} is not a valid option`);
            return;
        }

        selectedTarget = targetOptions[index - 1];
    }

    // get target package.json
    const targetDir = args.targetDir ? path.join(cwd, args.targetDir) : path.join(process.cwd(), '..', selectedTarget as string);
    const targetPkgJsonPath = path.join(targetDir, 'package.json');
    const targetPkgJson = await readPackageJson(targetPkgJsonPath, 'target');
    if (!targetPkgJson) return;

    if (srcPkgJson.name === targetPkgJson.name) {
        logLine(' ');
        logError(`cannot copy ${srcPkgJson.name} to itself`);
        return;
    }

    if (!Object.keys(targetPkgJson.dependencies || {}).includes(srcPkgJson.name)) {
        logLine('');
        logError(`${targetPkgJson.name} doesn't require ${srcPkgJson.name}`);
        if (!args['--force']) {
            return;
        }
        logWarn('got --force, continuing anyway');
    }

    logLine('');
    if (args['--no-install']) {
        logWarn(`Got --no-install, not installing ${targetPkgJson.name}'s dependencies...`);
    } else {
        logInfo(`Installing ${targetPkgJson.name}'s dependencies...`);
        await runAsync('npm i', { cwd: targetDir });
        logSuccess(`Finished installing`);
    }

    // run build command on source
    logLine('');
    logInfo(`Building ${srcPkgJson.name}...`);
    await runAsync('npm run build', { cwd: srcDir });
    logSuccess(`Finished building`);

    let copy_modules = Boolean(args['--force']);
    const srcInTargetPkgJsonPath = path.join(targetDir, 'node_modules', srcPkgJson.name, 'package.json');
    const srcInTargetPkgJson = await readPackageJson(srcInTargetPkgJsonPath, 'targets source');
    if (!srcInTargetPkgJson) {
        if (!args['--force']) {
            return;
        }
        logWarn('got --force, continuing anyway, entire node_modules will need to be copied');
        copy_modules = true;
    } else {
        const srcDeps = srcPkgJson.dependencies || {};
        for (const dep of Object.keys(srcDeps)) {
            const targetDeps = srcInTargetPkgJson.dependencies;
            if (!(dep in targetDeps)) {
                logLine('');
                logInfo(`Sources dependencies differ from the targets source, copying entire node_modules`);
                copy_modules = true;
                break;
            }
            if (targetDeps[dep] !== srcDeps[dep]) {
                logLine('');
                logInfo(`Sources dependencies differ from the targets source, copying entire node_modules`);
                copy_modules = true;
                break;
            }
        }
    }

    logLine('');
    logInfo(`Copying from ${srcPkgJson.name} to ${targetPkgJson.name}...`);

    // copy source to targets node_modules/@ninjalib/pkgName:
    // TODO: figure out what to copy more smarter, for example only build needs configs/* to be copied with it etc...
    // TODO: giving an item to copy like configs/tsconfig.json is bugged and fails, as it is a "file" in the eyes of this script but it's actually within a directory which needs to be also copied
    const itemsToCopy = ['dist', 'src', 'tsconfig.json', 'tsconfig.node.json', 'configs', ...(copy_modules ? ['node_modules', 'package.json', 'package-lock.json'] : [])];
    for (const item of itemsToCopy) {
        const itemSrcPath = path.join(srcDir, item);
        const itemTargetPath = path.join(targetDir, 'node_modules', srcPkgJson.name, item);
        const isFile = item.includes('.');
        if (isFile) {
            await copyFile(itemSrcPath, itemTargetPath, true);
        } else {
            await copyDirRecursive(itemSrcPath, itemTargetPath, { force: true, skipSymlinks: true });
        }
    }

    logSuccess(`Finished copying!`);
}

export const copyOptions = {
    // required
    // optional
    '(optional) sourceDir': 'What directory to copy from (relative to cwd)',
    '(optional) targetDir': 'What directory to copy to (relative to cwd)',
    '(optional) --force': 'Copies source regardless of if target requires it',
    '(optional) --no-install': `Doesn't preemptively install targets' modules`,
};
