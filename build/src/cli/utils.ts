import { colours } from '@ninjalib/util';

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
