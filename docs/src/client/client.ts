import App from '~/components/App.svelte';
import core from '@ninjalib/core';

const app = new App({ target: document.getElementById('app') });

// serverUrl should be just for the server, and have a separate upgradeServer function to actually upgrade it to websocket
const client = core.client({ serverUrl: 'ws://localhost:4200' });
// await client.connect();

export default app;
