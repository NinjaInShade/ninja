import App from '~/components/App.svelte';
import core from '@ninjalib/core';

const app = new App({ target: document.getElementById('app') });

const client = core.client({ serverUrl: 'localhost:4200' });
try {
    await client.connect();
} catch (err) {
    console.error('Client could not connect to socket:', err?.message);
}

client.on('ping', () => {
    console.log('[docs] got ping message! Ponging back...');
    client.emit('pong');
});

export async function checkHeartbeat() {
    const sent = new Date().getTime();
    client.emit('ping');

    return await new Promise<number>((resolve) => {
        const dispose = client.on('pong', () => {
            const received = new Date().getTime();
            const timeTaken = new Date(received - sent).getMilliseconds();
            dispose();
            return resolve(timeTaken);
        });
    });
}

export default app;
