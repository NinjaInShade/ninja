<script lang="ts">
    import NW from '@ninjalib/svelte';
</script>

<div class="center">
    <h1>NOT FOUND</h1>
    <NW.Button
        onClick={() => {
            NW.nav.back();
        }}
    >
        Go back
    </NW.Button>
</div>

<style>
    .center {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1em;
        height: 100%;
    }
</style>
