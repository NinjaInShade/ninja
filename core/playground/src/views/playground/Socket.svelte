<script lang="ts">
    import NW from '@ninjalib/svelte';
    import { checkHeartbeat } from './Socket';

    let output;

    async function heartbeat() {
        const time = await checkHeartbeat();
        output = `Response time: ${time}ms`;
    }
</script>

<div class="row">
    <div class="col">
        <h3>Actions</h3>
        <div>
            <NW.Button icon="heart-pulse" onClick={heartbeat}>Check heartbeat</NW.Button>
        </div>
    </div>
    <div class="col">
        <h3>Output</h3>
        <NW.TextArea value={output} disabled --input-width="550px" --input-height="600px" />
    </div>
</div>

<style>
    .row {
        display: flex;
        align-items: flex-start;
        width: 100%;
        gap: 16px;
    }

    .col {
        display: inline-flex;
        flex-flow: column nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
    }

    .col:first-child {
        flex: 1 0 0px;
    }
</style>
