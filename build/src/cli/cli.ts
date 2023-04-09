#!/usr/bin/env node

import { scriptSelectMenu, scriptHelpMenu } from './help.js';
import { parseArgs, logLine, logError, logWarn } from './helpers.js';
import { createProject, createProjectOptions } from './createProject/script.js';
import { copy, copyOptions } from './copy/script.js';
import { node, nodeOptions } from './node/script.js';
import { test, testOptions } from './test/script.js';
import { publish, publishOptions } from './publish/script.js';

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
