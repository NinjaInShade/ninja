<script lang="ts">
    import NW from '@ninjalib/svelte';
    import Socket from './Socket.svelte';
    import Tag from './Tag.svelte';

    const tabs = [
        ['WebSocket', Socket],
        ['Tag', Tag],
    ];
</script>

<main class="main container">
    <NW.TabStrip {tabs} style="margin: 2em 0 3.5em 0;" />
</main>

<style>
    .main {
        padding: 0 32px 56px 32px;
    }
</style>
