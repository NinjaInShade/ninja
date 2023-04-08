<script lang="ts">
    import NW from '@ninjalib/svelte';

    const routes = {
        '/': 'playground',
        // '*': '404',
    };
</script>

<NW.AppRoot {routes} projectType="lib" />
