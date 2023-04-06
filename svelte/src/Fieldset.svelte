<!--
    @component
    Renders a fieldset element with a label and ability to pass an input inside of it.
    Label must be given, if you don't want it displayed, use the 'hideLabel' prop

    @param label {string}: Sets the label text
    @param labelDir? {string}: Sets the labels direction
    @param hideLabel? {boolean}: Sets label visually hidden
    @param htmlName {string}: Sets the label 'for' attr
    @param title? {string}: Sets the tooltip
    @param style? {string}: Sets the style
    @param class? {string}: Sets the class
    @param size? {string}: Sets the size

    @example
        <NW.Fieldset label="Search for ticket">
            <NW.Input bind:value />
        </NW.Fieldset>
 -->
<script lang="ts">
    import { setContext } from 'svelte';

    /** Sets the label */
    export let label: string;
    /** Sets the labels direction */
    export let labelDir: 'row' | 'row-reverse' | 'column' = 'column';
    /** Sets label visually hidden */
    export let hideLabel: boolean = false;
    /** Sets the label 'for' attr */
    export let htmlName: string;
    /** Sets the tooltip */
    export let title: string | undefined = undefined;
    /** Sets the class */
    let _class: string | undefined = undefined;
    export { _class as class };
    /** Sets the style */
    export let style: string | undefined = undefined;
    /** Sets the size */
    export let size: 'S' | 'M' | 'L' | undefined = 'M';

    // Sets the context for children form elements to use
    setContext('htmlName', htmlName);
</script>

<fieldset class="fieldset fieldset-{size} {_class || ''}" style="--label-dir: {labelDir} {style || ''}" class:row={labelDir === 'row' || labelDir === 'row-reverse'} {title}>
    <label class:visually-hidden={hideLabel} for={htmlName}>{label}</label>
    <slot {htmlName} />
</fieldset>

<style>
    .fieldset {
        border: none;
        display: flex;
        position: relative;
        flex-direction: var(--label-dir, column);
        align-items: flex-start;
        user-select: none;
        white-space: nowrap;
        color: var(--grey-300);
        font-size: var(--fs);
        line-height: var(--fs-lh);
        width: fit-content;
        flex: 1 0 0px;
        gap: 4px;
    }

    .fieldset-S {
        font-size: var(--fs-sm);
        line-height: var(--fs-sm-lh);
    }

    .fieldset-M {
    }

    .fieldset-L {
    }

    .fieldset.row {
        align-items: center;
        gap: 8px;
    }
</style>
