export const colours = {
    // misc
    reset: '\x1b[0m',
    bold: '\x1b[1m', // Bright
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    strikethrough: '\x1b[9m',

    // colours
    black: '\x1b[30m',
    white: '\x1b[37m',
    grey: '\x1b[38;2;90;90;90m', // gray
    lightGrey: '\x1b[38;2;110;110;110m', // gray

    red: '\x1b[38;2;217;39;26m',
    orange: '\x1b[38;2;217;144;26m',
    yellow: '\x1b[38;2;209;212;34m',
    green: '\x1b[38;2;36;186;22m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    pink: '\x1b[38;2;189;25;167m',
    purple: '\x1b[38;2;118;25;189m',
    brown: '\x1b[38;2;96;68;12m',

    muted: {
        purple: '\x1b[38;2;88;16;143m',
    },
    bright: {},
};

/**
 * @returns true if executing current code in browser
 */
export const isBrowser = () => {
    return typeof globalThis.window !== 'undefined';
};

/**
 * @returns true if executing current code in node
 */
export const isNode = () => {
    return typeof globalThis.process === 'object';
};

/**
 * Cross-platform util for finding out if in a production environment
 */
export const isProd = (): boolean => {
    return isBrowser() ? import.meta?.env?.PROD ?? false : process.env.NODE_ENV === 'production';
};

/**
 * Cross-platform util for getting an environment variable
 */
export const getEnvVar = (variable: string): string | null => {
    return (isBrowser() ? import.meta?.env?.[variable] : process.env[variable]) ?? null;
};
