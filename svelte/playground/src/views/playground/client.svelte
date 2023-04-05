<script lang="ts">
    import Buttons from './Buttons.svelte';
    import Inputs from './Inputs.svelte';
    import Misc from './Misc.svelte';
    import NW from '~/index';

    const tabs = [
        ['Buttons', Buttons],
        ['Inputs', Inputs],
        ['Misc', Misc],
    ];
</script>

<main class="main container">
    <NW.TabStrip {tabs} style="margin: 2em 0 3.5em 0;" />
</main>

<style>
    .main {
        padding: 0 32px;
    }
</style>
