<script lang="ts">
    import NW from '@ninjalib/svelte';

    let random;
</script>

<div class="outer-layout">
    <div class="layout">
        <h2 style="margin-bottom: 0.1em">Welcome to NINJA</h2>
        <p>Ninja is a group of packages made to make writing fullstack web apps easy, fast and using minimal dependencies. These packages cover client & server management, frontend framework integration, database API usage, utility functions and everything in-between.</p>
        <div style="display: inline-flex; align-items: flex-end; gap: 8px; margin-top: 24px;">
            <NW.Button
                theme="black"
                onClick={() => {
                    random = Math.floor(Math.random() * 500);
                }}>Generate</NW.Button
            >
            <NW.Input value={random} disabled --input-width="55px" />
        </div>
    </div>
</div>

<style>
    .outer-layout {
        padding: 4em 2em;
    }

    .layout {
        margin: 0 auto;
        max-width: 1080px;
        width: 100%;
    }
</style>
