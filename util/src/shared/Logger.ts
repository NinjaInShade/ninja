import { isBrowser, colours } from './utils';

// useful for icons: https://emojipedia.org/search
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
};

const logTypes = {
    info: 'info',
    good: 'good',
    warn: 'warn',
    error: 'fail',
    debug: 'dbug',
} as const;

type LogType = keyof typeof logTypes;
type AbbrLogType = (typeof logTypes)[LogType];

type Meta = {
    showDate: LoggerOptions['showDate'];
    showTimestamp: LoggerOptions['showTimestamp'];
    showFilename: LoggerOptions['showFilename'];
    icon: string;
    colour: string;
    type: AbbrLogType;
};

/**
 * Browser & Server compatible logger with cool features:
 * - useful meta info
 * - different log types (INFO, GOOD, WARN, ERROR, DEBUG) w/ corresponding emojis
 * - namespacing/scoping
 * - terminal padding
 * - error formatting
 * - enabling only one or a subset of log types (LOG_TYPES env var)
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

    private disableLogging = false;
    private enabledTypes: AbbrLogType[] = [];

    constructor(namespace, options: LoggerOptions = {}) {
        const defaultOptions = {
            showFilename: Logger.showFilename,
            showTimestamp: Logger.showTimestamp,
            showDate: Logger.showDate,
        };

        if (!namespace) {
            throw new Error('You must provide a namespace to the logger');
        }

        this.namespace = namespace;
        this.options = Object.assign({}, defaultOptions, options);

        const logTypesVar = this.getEnvVar('LOG_TYPES');
        const logNamespacesVar = this.getEnvVar('LOG_NAMESPACES');

        if (logTypesVar) {
            const logTypesParsed = logTypesVar.toString().replaceAll(' ', '').replaceAll('"', '').replaceAll("'", '').split(',');
            for (const type of logTypesParsed) {
                if (Object.keys(logTypes).includes(type)) {
                    this.enabledTypes.push(logTypes[type]);
                } else if (Object.values(logTypes).includes(type)) {
                    this.enabledTypes.push(type);
                }
            }
        }

        if (logNamespacesVar) {
            const namespacesParsed = logNamespacesVar.toString().replaceAll(' ', '').replaceAll('"', '').replaceAll("'", '').split(',');
            if (!namespacesParsed.includes(namespace)) {
                this.disableLogging = true;
            }
        }
    }

    /**
     * Logs an INFO message
     */
    public info(...messages: any[]) {
        this._log('info', '⚓', 1, 'blue', ...messages);
    }

    /**
     * Logs a GOOD message
     */
    public good(...messages: any[]) {
        this._log('good', '✅', 1, 'green', ...messages);
    }

    /**
     * Logs a WARN message
     */
    public warn(...messages: any[]) {
        this._log('warn', '🔔', 2, 'yellow', ...messages);
    }

    /**
     * Logs a FAIL message
     */
    public error(...messages: any[]) {
        this._log('fail', '⛔', 1, 'red', ...messages);
    }

    /**
     * Logs a DEBUG message
     *
     * - Only shows with LOG_DEBUG=1 env var
     * - Won't show up if in production at all, regardless of LOG_DEBUG
     */
    public debug(...messages: any[]) {
        this._log('dbug', '⚡', 1, 'orange', ...messages);
    }

    /**
     * Logs a message to console
     *
     * Format - [date timestamp] [filename] [icon] [type]: msg
     */
    private _log(type: AbbrLogType, icon: string, iconWidth: number, colour: string, ...messages: any[]) {
        const { showDate, showTimestamp, showFilename } = this.options;

        if ((this.enabledTypes.length && !this.enabledTypes.includes(type)) || this.disableLogging) {
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

        const meta = this.generateMeta({ showDate, showTimestamp, showFilename, icon, colour, type });
        // required as some emojis aren't 1 char length
        const emojiOffset = iconWidth === 1 ? 0 : iconWidth - 1;
        // +1 because of extra space the console will add automatically
        const metaLength = this.getPureText(meta).length + 1 - emojiOffset;
        const msgs = this.generateMessages(messages, metaLength);

        const logFn = this.getLogFn(type);
        console[logFn](meta, ...msgs, colours.reset);
    }

    /**
     * Process and return what user wants to log
     *
     * If on server, will pad terminal so messages align nicely
     */
    private generateMessages(messages: any[], metaLength: number) {
        if (isBrowser()) {
            return messages;
        }

        // this is the available characters after the Loggers meta info
        const availableSpace = process.stdout.columns - metaLength;
        const leftPad = new Array(metaLength).fill(' ').join('');

        /**
         * A chunk is essentially one line in the terminal
         *
         * Need to split up the msg to add padding so things align nice
         */
        const splitIntoChunks = (msg: string, padStart?: boolean) => {
            // because of zero based indexing
            const _availableSpace = availableSpace - 1;
            const msgChunks: any[] = [];

            for (let i = 0; i < msg.length + _availableSpace; ) {
                const addLeftPad = padStart || i !== 0;
                let chunk = msg.substring(i, i + _availableSpace);

                if (!chunk) {
                    break;
                }

                const nlIndex = this.findFirstNlIndex(chunk);
                if (nlIndex) {
                    chunk = chunk.substring(0, nlIndex + 1);
                }

                chunk = `${addLeftPad ? leftPad : ''}${chunk}`;
                msgChunks.push(chunk);
                i += nlIndex ? nlIndex + 1 : _availableSpace;
            }

            return msgChunks;
        };

        const chunks: any[] = [];

        for (let i = 0; i < messages.length; i++) {
            let msg = messages[i];
            const prevMsg = messages[i - 1];

            // convert these to strings so they can be padded
            if (typeof msg === 'number' || typeof msg === 'bigint' || typeof msg === 'undefined' || typeof msg === 'boolean') {
                msg = `${msg}`;
            }

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
    private generateMeta(meta: Meta) {
        const { showDate, showTimestamp, showFilename, icon, colour, type } = meta;

        let msg = '';

        msg += colours.grey + '<';
        if (showDate) {
            const date = new Date().toLocaleDateString('en-GB');
            msg += colours.grey + date;
        }
        if (showTimestamp) {
            const time = new Date().toLocaleTimeString();
            msg += showDate ? ' ' : '';
            msg += colours.grey + time;
        }
        if (showFilename) {
            const file = isBrowser() ? `${document.currentScript}` : import.meta.url.split('/').at(-1) ?? './';
            msg += showTimestamp ? ' ' : '';
            msg += colours.grey + this.padMsg(file, 9);
        }
        msg += colours.grey + '>';

        // log type icon + text
        msg += ' ' + colours.grey + icon + ' ';
        msg += colours[colour] + colours.bold + type.toUpperCase();

        // namespace
        msg += ' ' + colours.muted.purple + this.padMsg(this.namespace, 15) + ' ';

        // separator
        msg += colours.grey + '>>' + colours.reset;

        return msg;
    }

    private getLogFn(type: AbbrLogType) {
        let logFn: string = type;
        if (type === 'fail') {
            logFn = 'error';
        } else if (type === 'dbug') {
            logFn = 'debug';
        } else {
            logFn = 'log';
        }
        return logFn;
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

    private getEnvVar(variable: string) {
        variable = variable.toUpperCase();
        let foundVar;
        if (isBrowser()) {
            foundVar = import.meta?.env[variable];
        } else {
            foundVar = process.env[variable];
        }
        return foundVar ?? null;
    }

    private getPureText(txt: string) {
        return txt.replaceAll(/(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]/gi, '');
    }

    private padMsg(msg: string, length: number) {
        let paddedMsg = msg.padEnd(length, ' ');
        if (msg.length > length) {
            paddedMsg = paddedMsg.substring(0, length - 3) + '...';
        }
        return paddedMsg;
    }

    private formatErrStack(stack: string) {
        const lines = stack.split('\n');

        for (let i = 1; i < lines.length; i++) {
            // stack indents by 4
            const line = lines[i].substring(4);

            let [at, fn, loc] = line.split(' ');

            const cwd = process.cwd().toLowerCase().replaceAll('\\', '/');
            const _loc = loc.toLowerCase().replaceAll('\\', '/');
            const split = _loc.split(cwd);

            if (split.length === 1) {
                loc = split[0];
            } else {
                if (split[1].startsWith('/')) {
                    split[1] = '.' + split[1];
                }
                loc = split.join('');
            }

            at = colours.grey + at;

            lines[i] = lines[i].substring(0, 4) + at + ' ' + fn + ' ' + loc + colours.reset;
        }
        lines[0] = colours.red + lines[0] + colours.reset;

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

Logger.showDate = true;
Logger.showFilename = true;

const log = logger('util:log');
const log2 = logger('core:views');
const log3 = logger('core:wss');
const log4 = logger('core:http');
const log5 = logger('vite:info');
const log6 = logger('sql:query');
const log7 = logger('util:averylongnamespace');

const user = {
    name: 'steve',
    username: 'soldier_steve',
    password: '4dm1m9adasd841mg',
    online: true,
    permissions: [1, 5, 7, 2, 4],
};
const err = new Error('User does not have permissions!');

log.debug('Debug msg.\n', 'We need to fix this thing!');
log3.error('One', 'Two', 'Three', 'Expect a space inbetween these');

log3.warn(new Error('Blah, something wnet wrong!'), '\n', new Error('Extra stack cuz why not...'), '\n', { a: 'test', b: 'foo', c: 'bar' });
log2.warn(new Error('Blah, something wnet wrong!'));

log3.warn(new Array(500).fill('x').join(''), process.stdout.columns);

log5.debug('X is 5, was 623!', { foo: '1', bar: 2, foobar: false });
log6.info('Is modal active: true!', [1, 'A', true]);
log4.debug('Debug log!', log);
log7.debug('Object construct:', Object);

log.error(err);
