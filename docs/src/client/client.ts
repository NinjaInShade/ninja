import App from '~/components/App.svelte';
import core from '@ninjalib/core';

const app = new App({ target: document.getElementById('app') });

const client = core.client({ serverUrl: 'ws://localhost:4200' });
// await client.connect();

export default app;
