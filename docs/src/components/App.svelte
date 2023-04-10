<script lang="ts">
    import NW from '@ninjalib/svelte';
    import Layout from './Layout.svelte';

    const routes = {
        '/': 'landing',
        '/docs': 'docs',
        '*': '404',
    };
</script>

<NW.AppRoot {routes} layout={Layout} projectType="app" />

<style>
    html {
        font-size: 16px;
    }
</style>
