<script lang="ts">
    import NW from '~/index';

    type Props = {
        close: () => void;
    };
    export let props: Props;
    const { close } = props;
</script>

<NW.Modal>
    <h1 style="color: var(--grey-100);">Testing modals!</h1>
    <p>Hi</p>
</NW.Modal>
