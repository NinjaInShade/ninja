<script lang="ts">
    import NW from '~/index';

    export let close: any;
</script>

<h1 style="color: black;">Testing modals!</h1>
<p>Well this, is, really cool!</p>
<NW.Button onClick={() => close('Deep')}>Close me!</NW.Button>
