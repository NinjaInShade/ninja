export * from '~/shared/index';
export * from '~/server/index';
export * from '~/client/index';

export * from './index';
export * as default from './index';

// TODO: fix types for different environments:
// see package.json exports, it exports different things for different environments
// vite picks the browser field up fine for example, but the types it doesn't... you have to
//have a root "types": ... field in package.json but this is ofc wrong as this is the declaration that is exporting all types regardless of environment
