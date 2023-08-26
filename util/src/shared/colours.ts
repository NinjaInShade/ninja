/**
 * ANSI escape codes for misc things (reset, bold, hidden etc...)
 */
export const terminal = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    strikethrough: '\x1b[9m',
};

/**
 * Standard ANSI colours
 */
export const colours = {
    ...terminal,
    black: '\x1b[30m',
    white: '\x1b[37m',
    grey: '\x1b[0;90m',
    lightGrey: '\x1b[38;2;110;110;110m',
    red: '\x1b[31m',
    orange: '\x1b[38;2;217;144;26m',
    yellow: '\x1b[38;2;209;212;34m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    pink: '\x1b[35m',
    purple: '\x1b[38;5;135m',
};

/**
 * Some hard-coded colour code themes I like
 *
 * A colour theme must conform to the ColourTheme type:
 * - misc: <reset, bold, dim, underscore, blink, reverse, hidden, strikethrough>
 * - colours: <black, white, grey, lightGrey, red, orange, yellow, green, cyan, blue, pink, purple>
 */
export const colourThemes = {
    /*
     * A theme that I like for use in windows terminal
     * Works pretty nice in VSCode too
     */
    windowsTerminal: {
        ...terminal,
        black: '\x1b[30m',
        white: '\x1b[37m',
        grey: '\x1b[38;2;90;90;90m',
        lightGrey: '\x1b[38;2;110;110;110m',
        red: '\x1b[38;2;217;39;26m',
        orange: '\x1b[38;2;217;144;26m',
        yellow: '\x1b[38;2;209;212;34m',
        green: '\x1b[38;2;36;186;22m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m',
        pink: '\x1b[38;2;189;25;167m',
        purple: '\x1b[38;2;118;25;189m',
    },
    /**
     * A theme that looks nice with the dehydration theme in Konsole terminal (linux)
     */
    linuxKonsoleDehydration: {
        ...terminal,
        black: '\x1b[30m',
        white: '\x1b[37m',
        grey: '\x1b[0;90m',
        lightGrey: '\x1b[38;2;110;110;110m',
        red: '\x1b[31m',
        orange: '\x1b[38;2;217;144;26m',
        yellow: '\x1b[38;2;209;212;34m',
        green: '\x1b[32m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m',
        pink: '\x1b[35m',
        purple: '\x1b[38;5;134m',
    },
};

export type ColourTheme = {
    // misc
    reset: string;
    bold: string;
    dim: string;
    underscore: string;
    blink: string;
    reverse: string;
    hidden: string;
    strikethrough: string;
    // colours
    black: string;
    white: string;
    grey: string;
    lightGrey: string;
    red: string;
    orange: string;
    yellow: string;
    green: string;
    blue: string;
    cyan: string;
    pink: string;
    purple: string;
};
