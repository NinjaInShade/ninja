import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '~/node';

const log = logger('util:fs');

/**
 * Checks if path exists
 *
 * @param path: path to a file or directory
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
 * @param source: (absolute) path to the source file
 * @param target: (absolute) path to the target location
 * @param force: doesn't hard error if source doesn't exist
 */
export async function copyFile(source: string, target: string, force = false) {
    const srcExists = await pathExists(source);
    const sourceFile = path.basename(source);

    if (!srcExists && !force) {
        throw new Error(`[copyFile] Source file '${sourceFile}' doesn't exist`);
    }
    if (!srcExists && force) {
        log.warn(`[copyFile] Failed to copy '${sourceFile}' as it doesn't exist`);
        return;
    }

    await fs.writeFile(target, await fs.readFile(source));
}

type CopyDirRecursiveOptions = {
    force?: boolean;
    skipSymlinks?: boolean;
};

/**
 *  Copies source directory and it's contents recursively to a target location
 *
 * @param source: (absolute) path to the source directory
 * @param target: (absolute) path to the target location
 * @param options: various option for copying
 */
export async function copyDirRecursive(source: string, target: string, options: CopyDirRecursiveOptions = {}) {
    const defaultOpts = {
        force: false,
        skipSymlinks: false,
    };
    const opts = Object.assign(defaultOpts, options);
    const { force, skipSymlinks } = opts;

    const srcExists = await pathExists(source);
    const sourceDir = path.basename(source);
    if (!srcExists && !force) {
        throw new Error(`[copyDirRecursive] Source dir '${sourceDir}' doesn't exist`);
    }
    if (!srcExists && force) {
        log.warn(`[copyDirRecursive] Failed to copy '${sourceDir}' as it doesn't exist`);
        return;
    }

    const targetExists = await pathExists(target);
    const targetDir = path.basename(source);
    if (!targetExists && !force) {
        throw new Error(`[copyDirRecursive] Target dir '${targetDir}' doesn't exist`);
    }
    if (!targetExists && force) {
        log.warn(`[copyDirRecursive] Target dir '${targetDir}' doesn't exist`);
        await fs.mkdir(target, { recursive: true });
    }

    const files = await fs.readdir(source, { withFileTypes: true });
    for (const file of files) {
        const stat = await fs.lstat(path.join(source, file.name));
        const srcPath = path.join(source, file.name);
        const targetPath = path.join(target, file.name);

        const srcFile = path.basename(srcPath);
        const targetFile = path.basename(targetPath);

        if (stat.isDirectory()) {
            log.debug(`[copyDirRecursive] Copying directory ${srcFile} to ${targetFile}`);
            await copyDirRecursive(srcPath, targetPath, opts);
        } else if (stat.isSymbolicLink()) {
            if (skipSymlinks) {
                log.debug(`[copyDirRecursive] Skipping copying symlink ${srcFile} to ${targetFile}`);
                continue;
            }
            log.debug(`[copyDirRecursive] Copying symbolic link ${srcFile} to ${targetFile}`);
            const link = await fs.readlink(srcPath);
            await fs.symlink(link, targetPath);
        } else {
            log.debug(`[copyDirRecursive] Copying file ${srcFile} to ${targetFile}`);
            await copyFile(srcPath, targetPath, opts.force);
        }
    }
}
