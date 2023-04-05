<script lang="ts">
    import Navigation from './Navigation.svelte';
</script>

<div class="ninja-container">
    <Navigation />
    <slot name="content" />
</div>

<style>
    .ninja-container {
        display: flex;
        flex-flow: column nowrap;
        width: 100%;
        flex: 1 0 0px;
    }
</style>
