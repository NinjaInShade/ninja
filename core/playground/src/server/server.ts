import core from '~/node';
import util from '@ninjalib/util';

const log = util.logger('core:playground');

const server = core.server();
await server.start();

server.on('connection', (socket) => {
    socket.on('ping', () => {
        log.info('got ping message! Ponging back...');
        server.broadcast('pong');
    });
});
