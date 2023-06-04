import path from 'node:path';
import { selectMenu } from '../utils';
import { logger, runAsync } from '@ninjalib/util';
import type { PackageJson } from '../copy/script';
import fs from 'node:fs/promises';
import semver from 'semver';

// TODO: add dependency checks for internal @ninjalib packages
// this would be to detect a copied @ninjalib package

const VERSION_OPTIONS: semver.ReleaseType[] = ['major', 'minor', 'patch'];
const DEFAULT_VERSION_TYPE = 'minor';

const log = logger('build:publish');

type PublishOptions = {
    type: semver.ReleaseType;
    ['release-branch']: string;
    message: string;
};

/**
 * Publish script for publishing ninja packages
 *
 * - ensures git is clean
 * - checks changelog is in valid pre-publish format, & updates it correctly
 * - updates pkg.json version, adds a tag & commits version upgrade
 * - publishes to npm
 */
export async function publish(args: PublishOptions) {
    const cwd = process.cwd();

    let pkgJson: PackageJson;
    try {
        const pkgJsonPath = path.join(cwd, 'package.json');
        const file = await fs.readFile(pkgJsonPath, { encoding: 'utf-8' });
        pkgJson = JSON.parse(file);
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            log.error('Cannot read package JSON, does it exist?');
        } else {
            log.error('Cannot parse package JSON, is it valid JSON?');
        }
        return;
    }

    const pkgName = pkgJson.name;
    const pkgNamePrefix = '@ninjalib/';
    const pkgCurrVersion = pkgJson.version;
    const libName = pkgName.substring(pkgNamePrefix.length);
    const commitMessage = args.message ?? `(${libName}) version %s`;

    if (!pkgName.startsWith('@ninjalib')) {
        log.error('Must be in a @ninjalib package to publish');
        return;
    }

    if (!commitMessage.includes('%v')) {
        log.error('Commit message must contain at least one %v');
        return;
    }

    let type = args.type;
    if (!type) {
        const selected = await selectMenu({
            title: '[PUBLISH] Select the type of version upgrade:',
            subtitle: 'More options may be available in the future',
            options: VERSION_OPTIONS,
            question: 'Upgrade type',
            optionFormatter: (opt: semver.ReleaseType) => {
                return `${opt} (${pkgCurrVersion} -> ${semver.inc(pkgCurrVersion, opt)})`;
            },
            defaultOption: DEFAULT_VERSION_TYPE,
            log,
        });
        if (!selected) {
            return;
        }
        type = selected as semver.ReleaseType;
    }

    if (!VERSION_OPTIONS.includes(type)) {
        log.error(`Invalid version type, got '${type}'`);
        return;
    }

    const newVersion = semver.inc(pkgCurrVersion, type);

    if (!newVersion) {
        log.error(`Version couldn't be incremented for some reason, bailing`);
        return;
    }

    {
        log.info('Installing dependencies...');
        const start = Date.now();
        await runAsync('npm i');
        const end = Date.now();
        log.good(`Finished installing dependencies in ${end - start} ms`);
    }

    {
        log.info(`Building library...`);
        const start = Date.now();
        await runAsync('npm run build');
        const end = Date.now();
        log.good(`Finished building in ${end - start} ms`);
    }

    log.info('checking git is clean...');

    const releaseBranch = (args['release-branch'] ?? 'master').trim();
    const currBranch = (await runAsync('git rev-parse --abbrev-ref HEAD')).stdout.trim(); // git branch --show-current is shorter & more intuitive but requires git 2.22 (maybe fine?)
    if (currBranch !== releaseBranch) {
        log.error(`you must be on the release branch (${releaseBranch}) to publish`);
        return;
    }

    const gitStatus = ((await runAsync(`git status --porcelain`)).stdout ?? '').replaceAll('\r', '').split('\n');

    for (const line of gitStatus) {
        const parsedLine = line.trim().split(' ')[1];

        if (!parsedLine) {
            continue;
        }

        if (parsedLine.startsWith(libName)) {
            log.error(`You have unstaged changes, make sure git is clean`);
            return;
        }
    }

    log.good('Git is clean');

    log.info(`Checking changelog format...`);

    const changelogPath = path.join(cwd, 'CHANGELOG.md');
    let changelog: string;
    try {
        changelog = await fs.readFile(changelogPath, { encoding: 'utf-8' });
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            log.error(`Cannot read CHANGELOG.md, does it exist?`);
        } else {
            log.error(`Got unexpected error whilst reading changelog`, err);
        }
        return;
    }

    const unreleasedStr = '## [Unreleased]';
    const subheadings = changelog.matchAll(/##/gm);

    let matches = 0;
    let foundUnreleasedHeading = false;
    let unreleasedHeadingIndex;

    for (const match of subheadings) {
        matches += 1;

        if (!match.index) {
            log.error('No match index, what went wrong here?');
            return;
        }

        const isUnreleasedHeading = changelog.substring(match.index, match.index + unreleasedStr.length) === unreleasedStr;
        if (isUnreleasedHeading && foundUnreleasedHeading) {
            log.error('Found more than one ## [Unreleased] heading');
            return;
        }
        if (isUnreleasedHeading) {
            foundUnreleasedHeading = true;
            unreleasedHeadingIndex = match.index;
        }
    }

    if (matches === 0 || !foundUnreleasedHeading) {
        log.error('Cannot find ## [Unreleased] heading');
        return;
    }

    log.good('Changelog is in correct format');

    log.info('Updating changelog...');

    const newUnreleased = '## [Unreleased]\n\n-';
    const date = new Date().toLocaleDateString();

    let updatedChangelog = changelog.replace(/## \[Unreleased\]/gm, `## [${newVersion}] - ${date}`);
    const preceedingMatch = updatedChangelog.substring(0, unreleasedHeadingIndex - 1);
    const afterMatch = updatedChangelog.substring(unreleasedHeadingIndex);
    updatedChangelog = preceedingMatch + '\n' + newUnreleased.trim() + '\n\n' + afterMatch;

    try {
        await fs.writeFile(changelogPath, updatedChangelog);
    } catch (err) {
        log.error('Error whilst updating changelog on disk', err);
        return;
    }

    log.good('Updated changelog');

    {
        log.info(`Updating package to new ${type} version (${newVersion})`);
        const start = Date.now();

        // https://github.com/npm/cli/issues/2010
        // --git-tag-version doesn't seem to work, possibly due to not being at the root dir,
        // but even with cwd set to root it doesn't actually commit, tag and push changes. Have to do this manually
        await runAsync(`npm version ${type}`);
        await runAsync('git add .');
        await runAsync(`git commit -m "${commitMessage.replaceAll('%v', newVersion)}"`);
        await runAsync(`git tag ${libName}-${newVersion}`);
        await runAsync('git push --tags');
        const end = Date.now();

        log.good(`Finished updating version in ${end - start} ms`);
    }

    {
        log.info(`Publishing library to npm...`);
        const start = Date.now();
        await runAsync(`npm publish --access="public"`);
        const end = Date.now();
        log.good(`Finished publishing in ${end - start} ms`);
    }
}

export const publishOptions = {
    '(optional) type': 'The type of version upgrade <major|minor|patch>',
    '(optional) release-branch': 'The branch were releases are tagged and published at',
    '(optional) message': 'The message used in the version commit (must use %s somewhere - replaced with version number in runtime)',
};
