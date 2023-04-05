import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { colours, logLine } from './helpers.js';
import { options } from './cli.js';

const DEFAULT_SCRIPT = 1;

/**
 * Shows all scripts and lets user type an option
 *
 * Only responsible for making sure the input is a number
 */
export async function scriptSelectMenu() {
    logLine(`\n${colours.blue}${colours.bold}Welcome to the ninja CLI. Here are all available scripts:`);
    logLine(`${colours.grey}For more info about a script use 'script --help'\n`);
    const _options = Object.keys(options);
    for (let i = 0; i < _options.length; i++) {
        const option = _options[i];
        logLine(`${colours.blue}${colours.bold}${i + 1})${colours.reset} ${colours.grey}${option}`);
    }
    const rl = readline.createInterface(stdin, stdout);
    let selectedOption: number;
    while (selectedOption === undefined) {
        const answer = await rl.question(`\nScript to run (${DEFAULT_SCRIPT}) >> `);
        if (!answer.length) {
            selectedOption = DEFAULT_SCRIPT;
            break;
        }
        const answerParsed = Number(answer);
        if (!Number.isNaN(answerParsed)) {
            selectedOption = answerParsed;
        }
    }
    rl.close();
    return selectedOption;
}

/**
 * Shows help menu for a particular script
 */
export function scriptHelpMenu(optionName, options: Record<string, any>) {
    logLine(`\n${colours.blue}${colours.bold}Here are all available options for the '${optionName}' script:\n`);
    for (const [option, description] of Object.entries(options)) {
        logLine(`${colours.blue}${colours.bold}[${option}]${colours.reset} ${colours.grey}${description}`);
    }
    logLine(`\nFor more info about an option read the docs`);
}
