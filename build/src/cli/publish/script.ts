import path from 'node:path';
import readline from 'node:readline/promises';
import { colours, logLine, logInfo, logError, logSuccess, runAsync, logWarn } from '../helpers.js';
import type { PackageJson } from '../copy/script';
import fs from 'node:fs/promises';
import { stdin, stdout } from 'node:process';
import semver from 'semver';

// TODO: add dependency checks for internal @ninjalib packages
// this would be to detect a copied @ninjalib package

const VERSION_OPTIONS = ['major', 'minor', 'patch'];
const DEFAULT_VERSION_TYPE = 'minor';

async function showVersionUpgradeMenu(options: string[]) {
    logLine(`\n${colours.bold}${colours.blue}[PUBLISH] Select the type of version upgrade:`);
    logLine(`${colours.grey}More options may be available in the future\n`);
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        logLine(`${colours.blue}${colours.bold}${i + 1})${colours.reset} ${colours.grey}${option}${colours.reset}`);
    }
    const rl = readline.createInterface(stdin, stdout);
    let selectedTarget: string | number;
    while (selectedTarget === undefined) {
        const answer = await rl.question(`\nUpgrade type (${DEFAULT_VERSION_TYPE}) >> `);
        if (!answer.length) {
            selectedTarget = DEFAULT_VERSION_TYPE;
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
 * Publish script for publishing ninja packages
 *
 * - ensures git is clean
 * - checks changelog is in valid pre-publish format, & updates it correctly
 * - updates pkg.json version, adds a tag & commits version upgrade
 * - publishes to npm
 */
export async function publish(args: Record<string, string>) {
    const cwd = process.cwd();

    let pkgJson: PackageJson;
    try {
        const pkgJsonPath = path.join(cwd, 'package.json');
        const file = await fs.readFile(pkgJsonPath, { encoding: 'utf-8' });
        pkgJson = JSON.parse(file);
    } catch (err: any) {
        logLine('');
        if (err.code === 'ENOENT') {
            logError(`cannot read package.json, does it exist?`);
        } else {
            logError(`cannot parse package.json, make sure it's valid`);
        }
        return;
    }

    const pkgName = pkgJson.name;
    const pkgNamePrefix = '@ninjalib/';
    const pkgCurrVersion = pkgJson.version;
    const libName = pkgName.substring(pkgNamePrefix.length);
    const commitMessage = args.message || `(${libName}) version %s`;

    if (!pkgName.startsWith('@ninjalib')) {
        logLine('');
        logError('must be in a @ninjalib package to publish');
        return;
    }

    if (!commitMessage.includes('%s')) {
        logLine('');
        logError('commit message must contain %s');
        return;
    }

    let type = args.type;
    if (!type) {
        const options = VERSION_OPTIONS.map((type: semver.ReleaseType) => `${type} (${pkgCurrVersion} -> ${semver.inc(pkgCurrVersion, type)})`);

        // TODO: this is a fat mess, need to clean this option selection/parsing menu stuff into a shared util
        // (this is basically copied from copy script, and many scripts going forward will use this type of interface too...)

        // this means user can input one of the options literally as a string or it's index
        const selectedType = await showVersionUpgradeMenu(options);
        const selectedTypeStringIndex = VERSION_OPTIONS.findIndex((opt) => opt === selectedType);
        const selectedTypeNumberIndex = VERSION_OPTIONS[Number(selectedType) - 1];
        const index = (selectedTypeStringIndex + 1 || selectedType) as number;

        if (selectedTypeStringIndex === -1 && !selectedTypeNumberIndex) {
            logLine('');
            logError(`type ${selectedType} is not a valid option`);
            return;
        }

        type = VERSION_OPTIONS[index - 1];
    }
    if (!VERSION_OPTIONS.includes(type)) {
        logLine('');
        logError(`invalid version type, got '${type}'`);
        return;
    }

    const newVersion = semver.inc(pkgCurrVersion, type as semver.ReleaseType);

    logLine('');
    logInfo(`updating package to new ${type} version (${newVersion})`);

    logInfo('installing dependencies...');
    await runAsync('npm i');
    logSuccess('dependencies installed');

    logInfo('building library...');
    await runAsync('npm run build');
    logSuccess('built library');

    logInfo('checking git is clean...');
    const releaseBranch = (args['release-branch'] || 'master').trim();
    const currBranch = (await runAsync('git rev-parse --abbrev-ref HEAD')).trim(); // git branch --show-current is shorter & more intuitive but requires git 2.22 (maybe fine?)
    if (currBranch !== releaseBranch) {
        logError(`you must be on the release branch (${releaseBranch}) to publish`);
        return;
    }
    const gitStatus: Awaited<string> = await runAsync(`git status --porcelain`);

    let isClean = true;
    for (const line of (gitStatus || '').replaceAll('\r', '').split('\n')) {
        const parsedLine = line.trim().split(' ')[1];

        if (!parsedLine) {
            continue;
        }

        if (parsedLine.startsWith(libName)) {
            isClean = false;
            break;
        }
    }

    if (!isClean) {
        logError(`you have unstaged changes, make sure git is clean`);
        return;
    }
    logSuccess('git is clean');

    logInfo(`checking changelog format...`);
    let changelog: string;
    const changelogPath = path.join(cwd, 'CHANGELOG.md');
    try {
        changelog = await fs.readFile(changelogPath, { encoding: 'utf-8' });
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            logError(`cannot read CHANGELOG.md, does it exist?`);
        } else {
            logError(`got unexpected error whilst reading changelog`);
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
        const isUnreleasedHeading = changelog.substring(match.index, match.index + unreleasedStr.length) === unreleasedStr;
        if (isUnreleasedHeading) {
            if (foundUnreleasedHeading) {
                logError('found more than one ## [Unreleased] heading');
                return;
            }
            foundUnreleasedHeading = true;
            unreleasedHeadingIndex = match.index;
        }
    }
    if (matches === 0 || !foundUnreleasedHeading) {
        logError('cannot find ## [Unreleased] heading');
        return;
    }
    logSuccess('changelog is in correct format');
    logInfo('updating changelog...');

    const newUnreleased = '## [Unreleased]\n\n-';

    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.getMonth().toString().padStart(2, '0');
    const year = now.getFullYear();
    const newDate = day + '/' + month + '/' + year;

    let updatedChangelog = changelog.replace(/## \[Unreleased\]/gm, `## [${newVersion}] - ${newDate}`);
    const preceedingMatch = updatedChangelog.substring(0, unreleasedHeadingIndex - 1);
    const afterMatch = updatedChangelog.substring(unreleasedHeadingIndex);
    updatedChangelog = preceedingMatch + '\n' + newUnreleased.trim() + '\n\n' + afterMatch;

    try {
        await fs.writeFile(changelogPath, updatedChangelog);
    } catch (err) {
        logError('error whilst updating changelog on disk');
        return;
    }
    logSuccess('updated changelog');

    // https://github.com/npm/cli/issues/2010
    // --git-tag-version doesn't seem to work, possibly due to not being at the root dir,
    // but even with cwd set to root it doesn't actually commit, tag and push changes. Have to do this manually
    await runAsync(`npm version ${type}`);
    await runAsync('git add .');
    await runAsync(`git commit -m "${commitMessage.replaceAll('%s', newVersion)}"`);
    await runAsync(`git tag ${libName}-${newVersion}`);
    await runAsync('git push');
    logSuccess('updated version');

    await runAsync(`npm publish --access="public"`);
    logSuccess('published to npm');
}

export const publishOptions = {
    // required
    // optional
    '(optional) type': 'The type of version upgrade <major|minor|patch>',
    '(optional) release-branch': 'The branch were releases are tagged and published at',
    '(optional) message': 'The message used in the version commit (must use %%s somewhere - replaced with version number in runtime)',
};
