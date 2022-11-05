<!--
    @component
    A component that renders a font awesome 6 icon.

    @param name {string}: Name of the font awesome 6 icon
    @param colour? {string}: Colour of the icon (default '#fff')
    @param size? {string}: Size of the icon (default '16px')
    @param title? {string}: Title of the icon
    @param class? {string}: Custom class for the icon container element

    @example
        <Icon name='bars-staggered' colour='#fff' size='20px'/>
-->
<script lang="ts">
    /** Name of the font awesome 6 icon e.g. bars-staggered */
    export let name: string;
    /** Colour of the icon e.g. #fff */
    export let colour: string = '#fff';
    /** Size of the icon e.g. 16px */
    export let size: string = '16px';
    /** Title of the icon e.g 'hamburger' */
    export let title: string | undefined = undefined;
    /** Custom class for the icon container element */
    let _class: string | undefined = undefined;
    export { _class as class };

    // Note: has to be wrapped into a span as otherwise get a cannot remove node error (https://github.com/sveltejs/svelte/issues/2086)
</script>

<!-- Colour var has to be set here so icon re renders if colour is dynamically changed -->
<span class={_class} style:--colour={colour}>
    <i class="font-awesome-icon fa-solid fa-fw fa-{name}" style="--size: {size}" {title} />
</span>

<style>
    .font-awesome-icon {
        display: block;
        font-size: var(--size);
        color: var(--colour);
    }
</style>
