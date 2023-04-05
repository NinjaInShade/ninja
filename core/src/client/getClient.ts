import { Client } from './Client';

export const getClient = (): Client | null => {
    return Client._instance;
};
