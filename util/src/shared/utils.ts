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
