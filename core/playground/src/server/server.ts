import core from '~/node';

console.log('[docs] Starting server...');

const server = core.server();
await server.start();

server.on('connection', (socket) => {
    socket.on('ping', () => {
        console.log('[docs] got ping message! Ponging back...');
        server.broadcast('pong');
    });
});
