import core from '~/index';

console.log('[docs] Starting server...');

const server = await core.server({ port: 4205 });

server.on('ping', (data) => {
    console.log('[docs] got ping message! Ponging back...');
    server.emit('pong', '');
});
