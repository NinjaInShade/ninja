import App from '../components/App.svelte';

// Have to import straight from browser as vite only reacts to the
// browser field of package.json if imported as a package, not locally

// Why is type wrong?
import core from '~/browser';

const app = new App({ target: document.getElementById('app') });

const client = core.client({ serverUrl: 'localhost:4205' });
await client.connect();

export default app;
