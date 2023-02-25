import project from '../index.js';
import path from 'node:path';
import fs from 'node:fs/promises';

const isEnclosedIn = (value: string, quoteType: 'single' | 'double') => {
    const _quoteType = quoteType === 'single' ? `'` : `"`;
    if (value[0] !== _quoteType && value[value.length - 1] !== _quoteType) {
        return false;
    }

    if (value[0] !== _quoteType) {
        throw new Error(`String is not fully enclosed in ${quoteType} quotes`);
    }
    if (value[value.length - 1] !== _quoteType) {
        throw new Error(`String is not fully enclosed in ${quoteType} quotes`);
    }

    return true;
};

export const loadEnv = async (filePath?: string, force = false): Promise<void> => {
    if (project.shared.isBrowser()) {
        throw new Error('Load env can only be used on the server');
    }

    // Read contents of .env file
    const pathToEnv = filePath ?? path.join(process.cwd(), '.env');
    let fileData;
    try {
        fileData = (await fs.readFile(pathToEnv, { encoding: 'utf-8' })).trim();
    } catch (err) {
        if (err?.message.startsWith('ENOENT: no such file or directory')) {
            throw new Error(`Error reading .env file, make sure it exists at: '${pathToEnv}'`);
        }
        throw new Error(`Error reading .env file: ${err.message}`);
    }

    // Get vars out of file data
    const variables: Record<string, any> = fileData.split('\n').reduce((prev, curr) => {
        let [name, value]: [string, string] = curr.split('=');

        const enclosedInSingle = isEnclosedIn(value, 'single');
        const enclosedInDouble = isEnclosedIn(value, 'double');
        if (enclosedInSingle || enclosedInDouble) {
            value = value.substring(1, value.length - 1);
        }

        prev[name] = value.trim();
        return prev;
    }, {});

    // Load each variable into `process.env`
    for (const [key, value] of Object.entries(variables)) {
        if (process.env[key] && !force) {
            throw new Error(`Env variable '${key}' already exists. Call with 'force' parameter true if you want to forcefully overwrite it`);
        }

        process.env[key] = value;
    }
};
