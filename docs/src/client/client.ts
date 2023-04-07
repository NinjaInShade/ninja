import App from '~/components/App.svelte';
import core from '@ninjalib/core';

const app = new App({ target: document.getElementById('app') });

const client = core.client({ serverUrl: 'ws://localhost:4200' });
await client.connect();

client.on('ping', (data) => {
    console.log('[docs] got ping message! Ponging back...');
    client.emit('pong', '');
});

// TODO: emit second arg should be optional
export async function checkHeartbeat() {
    const sent = new Date().getTime();
    client.emit('ping', '');

    return await new Promise<number>((resolve) => {
        const dispose = client.on('pong', (data) => {
            const received = new Date().getTime();
            const timeTaken = new Date(received - sent).getMilliseconds();
            dispose();
            return resolve(timeTaken);
        });
    });
}

export default app;
