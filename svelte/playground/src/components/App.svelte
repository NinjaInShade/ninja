<script lang="ts">
    import NW from '~/index';

    const routes = {
        '/': 'playground',
        // '*': '404',
    };
</script>

<NW.AppRoot {routes} projectType="this" />
