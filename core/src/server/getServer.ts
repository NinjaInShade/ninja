import { Server } from './Server';

export const getServer = (): Server | null => {
    return Server._instance;
};
