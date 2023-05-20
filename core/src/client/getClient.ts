import { Client } from './Client';

export const getClient = (): Client => {
    if (!Client._instance) {
        throw new Error('Client has not been initialised');
    }
    return Client._instance;
};
