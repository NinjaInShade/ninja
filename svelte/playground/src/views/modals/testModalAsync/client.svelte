<script lang="ts">
    import NW from '~/index';

    type Props = {
        close: (value: any) => void;
    };
    export let props: Props;
    const { close } = props;

    const columns = [{ key: 'username' }, { key: 'email' }];
    const data = [
        { username: 'Ninja', email: 'dojoninja@gmail.com' },
        { username: 'Ninja2', email: 'dojoninja2@gmail.com' },
        { username: 'Ninja3', email: 'dojoninja3@gmail.com' },
        { username: 'Ninja4', email: 'dojoninja4@gmail.com' },
    ];
</script>

<NW.Modal title="Async modal" contentStyle="display: flex; flex-flow: column nowrap;" --modal-width="650px" --modal-height="650px">
    <p>Here's some random data</p>
    <div class="table-container">
        <NW.Table {data} {columns} />
    </div>
    <div class="controls" slot="controls">
        <NW.Button onClick={() => close(null)}>Cancel</NW.Button>
        <NW.Button onClick={() => close('Saved!')}>Save</NW.Button>
    </div>
</NW.Modal>

<style>
    .controls {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    .table-container {
        display: flex;
        flex-flow: column nowrap;
        flex: 1 0 0px;
    }

    p {
        margin-bottom: 1.5em;
    }
</style>
