import core from '@ninjalib/core';

console.log('[docs] Starting server...');

const server = await core.server({ port: 4200 });

server.on('ping', (data) => {
    console.log('[docs] got ping message! Ponging back...');
    server.emit('pong', '');
});
