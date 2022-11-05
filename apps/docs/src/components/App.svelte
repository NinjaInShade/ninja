<script lang="ts">
  import AppRoot from '~/components/AppRoot.svelte';

  const routes = {
    '/': 'landing',
    '/tracker': 'tracker',
    '/docs': 'docs',
    '*': '404',
  };
</script>

<AppRoot {routes} />
