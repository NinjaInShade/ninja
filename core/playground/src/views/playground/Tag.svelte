<script lang="ts">
    import NW from '@ninjalib/svelte';
    import core from '~/browser';

    const client = core.getClient();

    let output;
</script>

<div class="row">
    <div class="col">
        <h3>Tags</h3>
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
