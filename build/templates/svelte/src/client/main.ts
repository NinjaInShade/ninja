import '~/views/app.css';
import App from '~/views/App.svelte';
import core from '@ninjalib/core';

const client = new core.Client();

const app = new App({
    target: document.getElementById('app'),
});

export default app;
