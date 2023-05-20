import { Server } from './Server';

export const getServer = (): Server => {
    if (!Server._instance) {
        throw new Error('Server has not been initialised');
    }
    return Server._instance;
};
