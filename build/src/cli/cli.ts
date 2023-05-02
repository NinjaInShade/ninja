#!/usr/bin/env -S npx tsx
import { scriptSelectMenu, scriptHelpMenu } from './help.js';
import { parseArgs, logLine, logError, logWarn } from './helpers.js';
import { createProject, createProjectOptions } from './createProject/script.js';
import { copy, copyOptions } from './copy/script.js';
import { vite, viteOptions } from './vite/script.js';
import { node, nodeOptions } from './node/script.js';
import { test, testOptions } from './test/script.js';
import { publish, publishOptions } from './publish/script.js';

// TODO: add version-diff script
// since we're in one repo, and libraries/projects get published and tagged as {libName}-{version}
// we can see the commits between say build-0.1.5 & build-0.1.7 or now and build 0.2.0 right.
// however, this shows commits for all libraries/projects between then, not just build, which is what we'd want.
// so, make a script that shows the commits between two tags or a tag and now, but only for the project specified.
// can be done since commits are (should atleast) be prefixed with the lib/project e.g. '(build) updated changelog' so this can be parsed.

type ScriptFn = (args) => void;
type ScriptOptions = {
    script: ScriptFn;
    helpOptions: Record<string, any>;
};

export const options: Record<string, ScriptOptions> = {
    publish: {
        script: publish,
        helpOptions: publishOptions,
    },
    copy: {
        script: copy,
        helpOptions: copyOptions,
    },
    vite: {
        script: vite,
        helpOptions: viteOptions,
    },
    node: {
        script: node,
        helpOptions: nodeOptions,
    },
    test: {
        script: test,
        helpOptions: testOptions,
    },
    'create-project': {
        script: createProject,
        helpOptions: createProjectOptions,
    },
};

const main = async () => {
    const [execPath, jsFile, ...args] = process.argv;

    const firstArg = args[0];
    const optionKeys = Object.keys(options);
    let option = optionKeys[Number(firstArg) - 1] || firstArg;

    // Show help menu
    if (option === '--help' || option === '-h') {
        // TODO: show some sort of general help/overview menu
        logLine('');
        logWarn('Help menu is not yet made');
        return;
    }

    // Show all scripts for selection
    if (!option) {
        const selected = await scriptSelectMenu();
        option = optionKeys[selected - 1] || selected.toString();
    }

    // Invalid script
    const validOption = options[option];
    if (!validOption) {
        logLine('');
        logError(`invalid cli script '${option}'. Use --help to see all available scripts and what they do`);
        return;
    }

    const parsedArgs = parseArgs(args);

    // Script-specific help menu
    if (Object.keys(parsedArgs)?.[0] === '--help') {
        scriptHelpMenu(option, validOption.helpOptions);
        return;
    }

    // Run script
    await validOption.script(parsedArgs);
};

main();
