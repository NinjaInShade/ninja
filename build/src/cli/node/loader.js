// loader.js
// required for ts-node esm & tsconfig-paths
// issue ref https://github.com/TypeStrong/ts-node/discussions/1450
// stack overflow ref https://stackoverflow.com/questions/71571684/ts-node-with-tsconfig-paths-wont-work-when-using-esm
import { resolve as resolveTs } from 'ts-node/esm';
import * as tsConfigPaths from 'tsconfig-paths';
import { pathToFileURL } from 'url';

const { absoluteBaseUrl, paths } = tsConfigPaths.loadConfig();
const matchPath = tsConfigPaths.createMatchPath(absoluteBaseUrl, paths);

export function resolve(specifier, ctx, defaultResolve) {
    const match = matchPath(specifier);
    return match ? resolveTs(pathToFileURL(`${match}`).href, ctx, defaultResolve) : resolveTs(specifier, ctx, defaultResolve);
}

export { load, transformSource } from 'ts-node/esm';
