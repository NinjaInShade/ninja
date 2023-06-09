import { isBrowser, colours as _colours, isProd, getEnvVar } from './utils';

const colours = _colours;
if (isBrowser()) {
    for (const key of Object.keys(colours)) {
        if (typeof colours[key] === 'object') {
            for (const _key of Object.keys(colours[key])) {
                colours[key][_key] = '';
            }
        } else {
            colours[key] = '';
        }
    }
}

function parseEnvVarList(txt: string) {
    return txt.replaceAll(' ', '').replaceAll('"', '').replaceAll("'", '').split(',');
}

// useful for icons: https://emojipedia.org/search / https://gist.github.com/nicolasdao/8f0220d050f585be1b56cc615ef6c12e
// TODO: make the chunk generator handle ASCI colour codes (as if you have a lot the lines can get chunked incorrectly currently)

type LoggerOptions = {
    /**
     * Whether to display the filename
     * from which the log came from
     *
     * @default Logger.showFilename - which defaults to false
     */
    showFilename?: boolean;
    /**
     * Whether to display the timestamp
     *
     * @default Logger.showTimestamp - which defaults to true, unless in a browser environment when then it is true
     */
    showTimestamp?: boolean;
    /**
     * Whether to display the date
     *
     * @default Logger.showDate - which defaults to false
     */
    showDate?: boolean;
    /**
     * Colour to display the namespace of the logger (ANSII colour code)
     *
     * @default Logger.namespaceColour - which defaults to utils.colours.muted.purple
     */
    namespaceColour?: string;
};

const LOG_LEVELS = {
    info: 'info',
    good: 'good',
    warn: 'warn',
    error: 'fail',
    debug: 'dbug',
} as const;

const LOG_LEVELS_META: LogLevelMeta = {
    info: {
        emoji: '⚓',
        colour: 'blue',
    },
    good: {
        emoji: '✅',
        colour: 'green',
    },
    warn: {
        emoji: '🔔',
        emojiWidth: 2,
        colour: 'yellow',
    },
    error: {
        emoji: '⛔',
        colour: 'red',
    },
    debug: {
        emoji: '⚡',
        colour: 'orange',
    },
};

type LogLevel = keyof typeof LOG_LEVELS;
type AbbrLogLevel = (typeof LOG_LEVELS)[LogLevel];
type LogLevelMeta = Record<
    LogLevel,
    {
        emojiWidth?: number;
        emoji: string;
        colour: string;
    }
>;

/**
 * Browser & Server compatible logger with cool features:
 * - useful meta info
 * - different log levels (INFO, GOOD, WARN, ERROR, DEBUG) w/ corresponding emojis
 * - namespacing/scoping
 * - terminal padding
 * - error formatting
 * - enabling only one or a subset of log levels (LOG_LEVELS env var)
 * - enabling only one or a subset of namespaces (LOG_NAMESPACES env var)
 */
export class Logger {
    /**
     * The namespace/prefix of the logger
     */
    public namespace: string;

    public options: LoggerOptions;

    public static showFilename = false;
    public static showTimestamp = !isBrowser();
    public static showDate = false;
    public static namespaceColour = colours.muted.purple;

    private disableLogging = false;
    private enabledLogLevels: Set<AbbrLogLevel> = new Set();

    /**
     * The name of the current process e.g. vite.
     * Will prefix the start of the log with this.
     * Set through the `LOG_PROCESS_NAME` env var, and should be 4 or less characters long
     * @default null
     */
    public processName: string | null;

    constructor(namespace, options: LoggerOptions = {}) {
        const defaultOptions = {
            showFilename: Logger.showFilename,
            showTimestamp: Logger.showTimestamp,
            showDate: Logger.showDate,
            namespaceColour: Logger.namespaceColour,
        };

        const processName = getEnvVar('LOG_PROCESS_NAME')?.trim() ?? null;
        this.processName = processName ? processName : null;

        if (!namespace) {
            throw new Error('You must provide a namespace to the logger');
        }

        this.namespace = namespace;

        this.options = Object.assign({}, defaultOptions, options);

        const logLevelsVar = getEnvVar('LOG_LEVELS');
        const logNamespacesVar = getEnvVar('LOG_NAMESPACES');

        if (logLevelsVar) {
            const logLevelsParsed = parseEnvVarList(logLevelsVar) as AbbrLogLevel[];
            for (const type of logLevelsParsed) {
                const keys = Object.keys(LOG_LEVELS);
                const values = Object.values(LOG_LEVELS);

                if (keys.includes(type)) {
                    this.enabledLogLevels.add(LOG_LEVELS[type]);
                } else if (values.includes(type)) {
                    this.enabledLogLevels.add(type);
                }
            }
        }

        if (logNamespacesVar) {
            const namespacesParsed = parseEnvVarList(logNamespacesVar) as AbbrLogLevel[];
            this.disableLogging = !namespacesParsed.includes(namespace);
        }
    }

    /**
     * Logs an INFO message
     */
    public info(...messages: any[]) {
        this._log('info', ...messages);
    }

    /**
     * Logs a GOOD message
     */
    public good(...messages: any[]) {
        this._log('good', ...messages);
    }

    /**
     * Logs a WARN message
     */
    public warn(...messages: any[]) {
        this._log('warn', ...messages);
    }

    /**
     * Logs a FAIL message
     */
    public error(...messages: any[]) {
        this._log('error', ...messages);
    }

    /**
     * Logs a DEBUG message
     *
     * - Only shows with LOG_DEBUG=1 env var
     * - Won't show up if in production at all, regardless of LOG_DEBUG
     */
    public debug(...messages: any[]) {
        const logDebug = getEnvVar('LOG_DEBUG') !== null && !isProd();
        if (logDebug) {
            this._log('debug', ...messages);
        }
    }

    /**
     * Logs a message to console
     *
     * @param logLevel: the log level
     * @param messages: the messages to log
     *
     * @format - [date timestamp] [filename] [icon] [level]: msg
     */
    private _log(logLevel: LogLevel, ...messages: any[]) {
        const { emoji, colour, emojiWidth } = LOG_LEVELS_META[logLevel];
        const type = LOG_LEVELS[logLevel];

        const dontLog = (this.enabledLogLevels.size && !this.enabledLogLevels.has(type)) || this.disableLogging;
        if (dontLog) {
            return;
        }

        messages = messages.map((msg) => {
            if (msg instanceof Error) {
                const stack = msg.stack;
                if (stack) {
                    return this.formatErrStack(stack);
                }

                return msg.message;
            } else {
                return msg;
            }
        });

        const meta = this.generateMeta({ emoji, colour, type });
        const emojiOffset = (emojiWidth ?? 1) - 1;
        // +1 because of extra space the console will add automatically
        const metaLength = this.getRawString(meta).length + 1 - emojiOffset;
        const msgs = this.generateMessages(messages, metaLength);

        const logFn = this.getLogFn(type);
        console[logFn](meta, ...msgs, colours.reset);
    }

    /**
     * Process and return what user wants to log
     *
     * If on server, will pad terminal so messages align nicely (but not in prod)
     */
    private generateMessages(messages: any[], metaLength: number) {
        if (isBrowser() || process.stdout.columns === undefined || isProd()) {
            return messages;
        }

        // this is the available characters after the Loggers meta info
        const availableSpace = process.stdout.columns - metaLength;
        const leftPad = ' '.repeat(metaLength);

        /**
         * A chunk is essentially one line in the terminal
         *
         * Need to split up the msg to add padding so things align nice
         */
        const splitIntoChunks = (msg: string, padStart?: boolean) => {
            // because of zero based indexing
            const _availableSpace = availableSpace - 1;
            const msgChunks: any[] = [];

            let i = 0;
            for (i; i < msg.length + _availableSpace; ) {
                const addLeftPad = padStart || i !== 0;
                let chunk = msg.substring(i, i + _availableSpace);

                if (!chunk) {
                    break;
                }

                const nlIndex = this.findFirstNlIndex(chunk);
                if (nlIndex !== null) {
                    chunk = chunk.substring(0, nlIndex + 1);
                }

                chunk = `${addLeftPad ? leftPad : ''}${chunk}`;
                msgChunks.push(chunk);
                i += nlIndex !== null ? nlIndex + 1 : _availableSpace - 1;
            }

            return msgChunks;
        };

        const chunks: any[] = [];

        for (let i = 0; i < messages.length; i++) {
            let msg = messages[i];
            const prevMsg = messages[i - 1];

            if (typeof msg === 'string') {
                const padStart = typeof prevMsg === 'string' && prevMsg.at(-1) === '\n';
                const msgChunks = splitIntoChunks(msg, padStart);
                chunks.push(...msgChunks);
            } else {
                chunks.push(msg);
            }
        }

        return chunks;
    }

    /**
     * Generates meta info msg (time, namespace etc...)
     */
    private generateMeta(meta: { emoji: string; colour: string; type: AbbrLogLevel }) {
        const { showDate, showTimestamp, showFilename, namespaceColour } = this.options;
        const { emoji, colour, type } = meta;

        const showBeginningMeta = showDate || showTimestamp || showFilename;
        let msg = '';

        // Process name
        msg += colours.cyan + '[' + this.padString(this.processName ?? '????', 4) + ']' + ' ';

        if (showBeginningMeta) {
            msg += colours.grey + '<';
        }
        if (showDate) {
            const date = new Date().toLocaleDateString('en-GB');
            msg += date;
        }
        if (showTimestamp) {
            const time = new Date().toLocaleTimeString();
            msg += showDate ? ' ' : '';
            msg += time;
        }
        if (showFilename) {
            const file = isBrowser() ? `${document.currentScript}` : import.meta.url.split('/').at(-1) ?? './';
            msg += showTimestamp ? ' ' : '';
            msg += this.padString(file, 9);
        }
        if (showBeginningMeta) {
            msg += colours.grey + '>' + ' ';
        }

        // log type icon + text
        msg += emoji + ' ';
        msg += colours[colour] + colours.bold + type.toUpperCase();

        // namespace
        msg += ' ' + (namespaceColour ?? colours.muted.purple) + this.padString(this.namespace, 20) + ' ';

        // separator
        msg += colours.grey + '>>' + colours.reset;

        return msg;
    }

    private getLogFn(type: AbbrLogLevel) {
        return {
            info: 'info',
            good: 'log',
            warn: 'warn',
            fail: 'error',
            dbug: 'debug',
        }[type];
    }

    private findFirstNlIndex(msg: string) {
        for (let i = 0; i < msg.length; i++) {
            const char = msg[i];
            if (char === '\n') {
                return i;
            }
        }
        return null;
    }

    private getRawString(txt: string) {
        return txt.replaceAll(/(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]/gi, '');
    }

    private padString(msg: string, length: number) {
        msg = msg.trim();
        let paddedMsg = msg.padEnd(length, ' ');
        if (msg.length > length) {
            paddedMsg = paddedMsg.substring(0, length - 3) + '...';
        }
        return paddedMsg;
    }

    private formatErrStack(stack: string) {
        const lines = stack.split('\n');

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.startsWith('    at')) {
                // stack indents by 4
                line = line.substring(4);

                const split = line.split(' ');
                let at = split.at(0);
                let fn = split.slice(1, -1).join(' ');
                let loc = split.at(-1);

                if (!isBrowser()) {
                    const cwd = process.cwd().toLowerCase().replaceAll('\\', '/');
                    const _loc = loc?.toLowerCase().replaceAll('\\', '/') as string;
                    const split = _loc.split(cwd);

                    if (split.length === 1) {
                        loc = split[0];
                    } else {
                        if (split[1].startsWith('/')) {
                            split[1] = '.' + split[1];
                        }
                        loc = split.join('');
                    }
                }

                at = colours.lightGrey + at;

                lines[i] = lines[i].substring(0, 4) + at + ' ' + fn + ' ' + loc;
            } else {
                lines[i] = colours.red + lines[i];
            }
        }

        lines[lines.length - 1] = lines[lines.length - 1] + colours.reset;
        return lines.join('\n');
    }
}

/**
 * Creates a logger
 *
 * @param namespace: recommended format is projectNameAbbreviated:descriptor (e.g. nw:logger, nw:http, nw:socket)
 */
export function logger(namespace: string, opts?: LoggerOptions) {
    return new Logger(namespace, opts);
}

// const log = logger('util:log');
// const log2 = logger('core:views');
// const log3 = logger('core:wss');
// const log4 = logger('core:http');
// const log5 = logger('vite:info');
// const log6 = logger('sql:query');
// const log7 = logger('util:averylongnamespace');

// const user = {
//     name: 'steve',
//     username: 'soldier_steve',
//     password: '4dm1m9adasd841mg',
//     online: true,
//     permissions: [1, 5, 7, 2, 4],
// };
// const err = new Error('User does not have permissions!');

// log.debug('Debug msg.\n', 'We need to fix this thing!');
// log3.error('One', 'Two', 'Three', 'Expect a space inbetween these');

// log3.warn(new Error('Blah, something wnet wrong!'), '\n\n', new Error('Extra stack cuz why not...'), '\n', { a: 'test', b: 'foo', c: 'bar' });
// log2.warn(new Error('Blah, something wnet wrong!'));

// log3.warn(new Array(500).fill('x').join(''), process.stdout.columns);

// log5.debug('X is 5, was 623!', { foo: '1', bar: 2, foobar: false });
// log6.info('Is modal active: true!', [1, 'A', true]);
// log4.debug('Debug log!', log);
// log7.debug('Object construct:', Object);
// log5.debug('Logging some types ' + 52, `and lets see... how about this ${undefined} and ${false} and ${BigInt(252)}`);
// log2.info('Lets log some info', 252, '\nand some more', BigInt(25), 'and some more...', undefined, 'and we have a boolean', true);
// log.debug('Just testing something\n', 'hello there, I should be on a newline?');

// log.error(err, user);
