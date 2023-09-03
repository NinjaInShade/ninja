<script lang="ts">
    import NW from '~/index';

    function openModal() {
        NW.nav.openModal('modals/testModal', {});
    }

    async function openAsyncModal() {
        const valueReturned = await NW.nav.openModal('modals/testModalAsync', {}, { asPromise: true });
        console.log('Returned with', valueReturned);
    }
</script>

<div class="flex">
    <div style="display: flex; align-items: center; gap: 12px;">
        <p>Standard</p>
        <NW.Button onClick={openModal}>Open</NW.Button>
    </div>

    <div style="display: flex; align-items: center; gap: 12px;">
        <p>Async</p>
        <NW.Button onClick={openAsyncModal}>Open</NW.Button>
    </div>
</div>

<style>
    .flex {
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        align-items: flex-start;
        gap: 1.5em;
    }
</style>
