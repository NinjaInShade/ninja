import { colours, logger, Logger, pathExists } from '@ninjalib/util';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { options } from './cli';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

/**
 * Utility log function to reset text color before/after string to prevent color bleeding
 */
export const logLine = (...messages: any[]) => {
    console.log(...messages, colours.reset);
};

/**
 * Utility info log function
 */
export const logInfo = (...messages: any[]) => {
    logLine(colours.bold + colours.blue + '[INFO]' + colours.reset, ...messages);
};

/**
 * Utility success log function
 */
export const logSuccess = (...messages: any[]) => {
    logLine(colours.bold + colours.green + '[GOOD]' + colours.reset, ...messages);
};

/**
 * Utility error log function
 */
export const logError = (...messages: any[]) => {
    logLine(colours.bold + colours.red + '[FAIL]' + colours.reset, ...messages);
};

/**
 * Utility warn log function
 */
export const logWarn = (...messages: any[]) => {
    logLine(colours.bold + colours.yellow + '[WARN]' + colours.reset, ...messages);
};

type SelectMenuSettings = {
    options: string[];
    defaultOption: string;
    title: string;
    question: string;
    log: Logger;
    subtitle?: string;
    optionFormatter?: (opt: string) => string;
};

export async function selectMenu(settings: SelectMenuSettings) {
    const { options, defaultOption, title, question, log, subtitle, optionFormatter } = settings;

    logLine('\n' + colours.bold + colours.blue + title);
    if (subtitle) {
        logLine(colours.grey + subtitle + '\n');
    }

    for (let i = 0; i < options.length; i++) {
        const option = optionFormatter ? optionFormatter(options[i]) : options[i];
        logLine(colours.blue + colours.bold + `${i + 1})` + colours.reset + colours.grey + ' ' + option + colours.reset);
    }

    const rl = readline.createInterface(stdin, stdout);

    let selected: string | number | undefined;
    while (selected === undefined) {
        const q = '\n' + question + ' ' + `(${defaultOption})` + ' >> ';
        const answer = await rl.question(q);

        if (!answer.length) {
            selected = defaultOption;
            break;
        }

        const answerCoerced = Number(answer);

        // if number, user selected by list index
        // if string, user typed target name directly
        selected = !Number.isNaN(answerCoerced) ? answerCoerced : answer;
    }

    rl.close();

    const found = options.find((opt) => opt === selected) ?? options[Number(selected) - 1];
    if (!found) {
        log.error(`Target ${selected} is not a valid option`);
        return null;
    }

    return found;
}

export async function readTmp(file: string) {
    const filePath = path.join(os.tmpdir(), file);

    const tmpExists = await pathExists(filePath);
    if (!tmpExists) {
        await fs.writeFile(filePath, '', 'utf-8');
    }

    return await fs.readFile(filePath, 'utf-8');
}

export async function writeTmp(file: string, data: string) {
    const filePath = path.join(os.tmpdir(), file);
    await fs.writeFile(filePath, data, 'utf-8');
}

/**
 * Shows help menu for a particular script
 */
export function scriptHelpMenu(optionName, options: Record<string, any>) {
    logLine('\n' + colours.blue + colours.bold + `Here all available options for the '${optionName}' script:` + '\n');
    for (const [option, description] of Object.entries(options)) {
        logLine(colours.blue + colours.bold + option + colours.reset + colours.grey + ' ' + description);
    }
    logLine('\n' + 'For more info about an option read the docs');
}

/**
 * Shows all scripts and lets user type an option
 */
export async function scriptSelectMenu() {
    const opts = Object.keys(options);
    const log = logger('build:cliHelp');

    const tmpFile = 'ninjalib-script-help';
    const tmpContents = await readTmp(tmpFile);

    const defaultOption = tmpContents.length ? tmpContents : opts[0];

    const selected = await selectMenu({
        title: 'Welcome to the ninja CLI. Here are all available scripts:',
        subtitle: `For more info about a script use 'script --help'`,
        options: opts,
        defaultOption,
        question: 'Script to run',
        log,
    });

    if (selected) {
        await writeTmp(tmpFile, selected);
    }

    return selected;
}
