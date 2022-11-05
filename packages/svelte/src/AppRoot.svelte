<script lang="ts">
  import { onMount } from 'svelte';
  import nav from '~/client/nav';
  import '~/styles/theme.css';
  import '~/styles/global.css';

  export let routes: Record<string, string>;

  let view;
  let viewProps;

  onMount(async () => {
    [view, viewProps] = await nav.router(routes, (newView, newViewProps) => {
      view = newView;
      viewProps = newViewProps;
    });
  });
</script>

{#await view then}
  {#if viewProps}
    <svelte:component this={view} props={{ ...viewProps }} />
  {:else}
    <svelte:component this={view} />
  {/if}
{/await}
