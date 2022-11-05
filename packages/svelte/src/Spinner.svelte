<!--
    @component
    A component that renders a loading spinner.

    @param colour? {string}: Colour of the spinner (default 'var(--white)')
    @param size? {string}: Size of the spinner (default '24px')

    @example
        <Spinner colour='#000' size='32px'/>
-->
<script lang="ts">
  import Icon from './Icon.svelte';
  /** Colour of the spinner */
  export let colour: string = 'var(--white)';
  /** Size of the spinner */
  export let size: string = '24px';
</script>

<Icon name="spinner fa-spin-pulse" {size} {colour} title="Loading spinner" />
