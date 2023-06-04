import path from 'node:path';
import fs from 'node:fs/promises';
import { selectMenu, readTmp, writeTmp } from '../utils';
import { logger, colours, runAsync, copyFile, copyDirRecursive } from '@ninjalib/util';

const log = logger('build:copy');

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
        if (err.code === 'ENOENT') {
            log.error('Cannot read', type, 'package JSON, does it exist?');
        } else {
            log.error('Cannot parse', type, 'package JSON, is it valid JSON?');
        }
        return null;
    }
}

/**
 * gets all available options to copy to
 *
 * an option is valid if:
 * 1) lives in ../ relative to (e.g. one level above) the src dir
 * 2) has a valid package.json at the root
 */
async function getTargetOptions(srcDir: string): Promise<string[]> {
    const options: string[] = [];

    const dirsPath = path.join(srcDir, '..');
    const dirs = (await fs.readdir(dirsPath, { withFileTypes: true })).filter((dir) => dir.isDirectory()).map((dir) => dir.name);

    for (const dir of dirs) {
        const dirPkgJsonPath = path.join(dirsPath, dir, 'package.json');
        try {
            const file = await fs.readFile(dirPkgJsonPath, { encoding: 'utf-8' });
            JSON.parse(file);

            options.push(dir);
        } catch (err: any) {
            // if reading/parsing failed, not valid, continue to next dir
        }
    }

    return options;
}

type CopyArgs = {
    sourceDir?: string;
    targetDir?: string;
    ['--force']?: boolean;
};

/**
 * copies source library to a target project/library
 *
 * useful for testing libs in real projects without publishing
 */
export async function copy(args: CopyArgs) {
    const cwd = process.cwd();
    const force = args['--force'];

    // get source package.json
    const srcDir = args.sourceDir ? path.join(cwd, args.sourceDir) : cwd;
    const srcPkgJsonPath = path.join(srcDir, 'package.json');
    const srcPkgJson = await readPackageJson(srcPkgJsonPath, 'source');
    if (!srcPkgJson) return;

    // check if source is a @ninjalib pkg
    if (!srcPkgJson.name.startsWith('@ninjalib')) {
        log.error('Source must be a @ninjalib package');
        return;
    }

    let selectedTarget!: string;

    if (!args.targetDir) {
        const targetOptions = await getTargetOptions(srcDir);
        const tmpContents = await readTmp('ninjalib-copy');
        if (tmpContents.length) {
            log.debug(`Remembered target ${tmpContents} from temp`);
        }
        const defaultOption = tmpContents.length ? tmpContents : targetOptions[0];

        if (!targetOptions.length) {
            log.error('Found 0 potential targets, make sure there are valid locations to copy to (../ relative to source)');
            return;
        }

        const selected = await selectMenu({
            title: '[COPY] Select which project/lib to copy to:',
            subtitle: 'Copies source package & dependencies to the target',
            options: targetOptions,
            question: 'Location to copy to',
            optionFormatter: (opt) => {
                if (`@ninjalib/${opt}` === srcPkgJson.name) {
                    return colours.strikethrough + opt;
                }

                return opt;
            },
            defaultOption,
            log,
        });
        if (!selected) {
            return;
        }
        selectedTarget = selected;
    }

    // get target package.json
    const targetDir = args.targetDir ? path.join(cwd, args.targetDir) : path.join(cwd, '..', selectedTarget);
    const targetPkgJsonPath = path.join(targetDir, 'package.json');
    const targetPkgJson = await readPackageJson(targetPkgJsonPath, 'target');
    if (!targetPkgJson) return;

    log.debug(`Saving target ${args.targetDir ?? selectedTarget} to temp so it can be remembered`);
    await writeTmp('ninjalib-copy', args.targetDir ?? selectedTarget);

    if (srcPkgJson.name === targetPkgJson.name) {
        log.error(`Cannot copy ${srcPkgJson.name} to itself`);
        return;
    }

    if (!Object.keys(targetPkgJson.dependencies ?? {}).includes(srcPkgJson.name)) {
        if (!force) {
            log.error(`Target ${targetPkgJson.name} doesn't require source ${srcPkgJson.name}`);
            return;
        }

        log.warn(`Target ${targetPkgJson.name} doesn't require source ${srcPkgJson.name}, but got --force, so continuing`);
    }

    {
        // run build command on source
        log.info(`Building ${srcPkgJson.name}...`);
        const start = Date.now();
        await runAsync('npm run build', { cwd: srcDir });
        const end = Date.now();
        log.good(`Finished building in ${end - start} ms`);
    }

    let copy_modules = force;
    const srcInTargetPkgJsonPath = path.join(targetDir, 'node_modules', srcPkgJson.name, 'package.json');
    const srcInTargetPkgJson = await readPackageJson(srcInTargetPkgJsonPath, 'targets source');

    if (!srcInTargetPkgJson) {
        if (!force) {
            log.error('Source pkg JSON not found in targets node modules');
            return;
        }
        log.warn('Source pkg JSON not found in targets node modules, but got --force, so copying pkg JSON & entire node modules');
        copy_modules = true;
    } else {
        const srcDeps = srcPkgJson.dependencies ?? {};
        for (const dep of Object.keys(srcDeps)) {
            const targetDeps = srcInTargetPkgJson.dependencies;
            const depsDiffer = !(dep in targetDeps) || srcDeps[dep] !== targetDeps[dep];
            if (depsDiffer) {
                log.warn(`Sources dependencies differ from the dependencies the targets source has, copying entire node modules`);
                copy_modules = true;
                break;
            }
        }
    }

    log.info(`Copying ${srcPkgJson.name} to ${targetPkgJson.name}...`);
    const start = Date.now();

    // copy source to targets node_modules/@ninjalib/pkgName:
    const toCopy = ['dist', 'src', 'tsconfig.json', 'configs', ...(copy_modules ? ['node_modules', 'package.json', 'package-lock.json'] : [])];
    for (const item of toCopy) {
        const itemSrcPath = path.join(srcDir, item);
        const itemTargetPath = path.join(targetDir, 'node_modules', srcPkgJson.name, item);
        const isFile = item.includes('.');
        if (isFile) {
            await copyFile(itemSrcPath, itemTargetPath, true);
        } else {
            await copyDirRecursive(itemSrcPath, itemTargetPath, { force: true });
        }
    }

    const end = Date.now();
    log.good(`Finished copying in ${end - start} ms`);
}

export const copyOptions = {
    '(optional) sourceDir': 'What directory to copy from (relative to cwd)',
    '(optional) targetDir': 'What directory to copy to (relative to cwd)',
    '(optional) --force': 'Copies source regardless of if target requires it',
};
