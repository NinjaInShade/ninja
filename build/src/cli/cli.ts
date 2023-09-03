#!/usr/bin/env node
import { scriptSelectMenu, scriptHelpMenu } from './utils';
import { parseArgv, type ArgV, logger } from '@ninjalib/util';
import { createProject, createProjectOptions } from './createProject/script';
import { copy, copyOptions } from './copy/script';
import { vite, viteOptions } from './vite/script';
import { node, nodeOptions } from './node/script';
import { test, testOptions } from './test/script';
import { publish, publishOptions } from './publish/script';
import { start, startOptions } from './start/script';

const log = logger('build:cli');

type ScriptFn = (argv: ArgV) => Promise<any> | any;
type ScriptOptions = {
    script: ScriptFn;
    help: Record<string, string>;
};

export const options: Record<string, ScriptOptions> = {
    publish: {
        script: publish,
        help: publishOptions,
    },
    copy: {
        script: copy,
        help: copyOptions,
    },
    vite: {
        script: vite,
        help: viteOptions,
    },
    start: {
        script: start,
        help: startOptions,
    },
    node: {
        script: node,
        help: nodeOptions,
    },
    test: {
        script: test,
        help: testOptions,
    },
    // 'create-project': {
    //     script: createProject,
    //     helpOptions: createProjectOptions,
    // },
};

const main = async () => {
    const argv = parseArgv();

    log.debug('Raw argv', process.argv, 'Processed argv', argv);

    const scriptArg = argv.args[0];
    const optionKeys = Object.keys(options);
    let option = optionKeys[Number(scriptArg) - 1] || scriptArg;

    const wantsHelp = argv.opts.h || argv.opts.help;

    // TODO: show some sort of general help/overview menu
    if (argv.args.length === 0 && wantsHelp) {
        log.warn('Help menu is not yet made');
        return;
    }

    // Show all scripts for selection
    if (!option) {
        const selection = await scriptSelectMenu();
        if (!selection) {
            return;
        }
        option = selection;
    }

    // Invalid script
    const validOption = options[option];
    if (!validOption) {
        log.error(`Invalid cli script '${option}'. Use --help to see all available scripts`);
        return;
    }

    // Script-specific help menu
    if (wantsHelp) {
        scriptHelpMenu(option, validOption.help);
        return;
    }

    // strip script argument as irrelevant at this point
    argv.args.splice(0, 1);

    // Run script
    await validOption.script(argv);
};

const startTime = Date.now();
await main();

process.on('beforeExit', () => {
    const timeDiff = Date.now() - startTime;
    log.debug(`Exited after ${timeDiff}ms`);
});
