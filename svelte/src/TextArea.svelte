<!--
    @component
    Renders a textarea which can optionally grow to it's content's size

    Accepted CSS props:
    --input-height: Sets the height
    --input-width: Sets the width

    @param value {string}: Sets the bound value
    @param onChange? {Function}: Sets the on change handler
    @param disabled? {boolean}: Sets the disabled state
    @param loading? {boolean}: Sets the loading state
    @param error? {string}: Sets the error message
    @param title? {string}: Sets the tooltip
    @param class? {string}: Sets the class
    @param style? {string}: Sets the style
    @param placeholder? {string}: Sets the placeholder
    @param size? {string} Sets the size
    @param autoResize? {boolean} Enables auto height resizing

    @example
        <Fieldset label="Description">
            <TextArea bind:value={description} autoResize />
        </Fieldset>
 -->
<script lang="ts">
    import NW from './';
    import { onMount, getContext } from 'svelte';

    /** Sets the bound value */
    export let value: string | null = null;
    /** Sets the on change handler */
    export let onChange: ((value: any) => Promise<void> | void) | undefined = undefined;
    /**  Sets the disabled state */
    export let disabled: boolean | undefined = undefined;
    /**  Sets the loading state */
    export let loading: boolean | undefined = undefined;
    /**  Sets the error message */
    export let error: string | undefined | null = undefined;
    /** Sets the tooltip */
    export let title: string | undefined = undefined;
    /** Sets the class */
    let _class: string | undefined = undefined;
    export { _class as class };
    /** Sets the style */
    export let style: string | undefined = undefined;
    /** Sets the placeholder */
    export let placeholder: string | undefined = '';
    /** Sets the size */
    export let size: 'S' | 'M' | 'L' | undefined = 'M';
    /** Enables auto height resizing */
    export let autoResize: boolean | undefined = false;

    // Passed down from context in parent <Fieldset />
    const htmlName = getContext<string>('htmlName');

    let containerInstance: HTMLElement;
    let txAreaInstance: HTMLElement;

    let maxTxAreaInstanceHeight = 0;

    onMount(() => {
        if (autoResize) {
            const { scrollHeight } = txAreaInstance;

            containerInstance.style.height = `${scrollHeight}px`;

            // Set the record height the text area has grown too (on mount will be the initial scrollheight)
            maxTxAreaInstanceHeight = scrollHeight;
        }
    });

    const calculateHeight = async (value: string | null) => {
        if (!value) return;
        txAreaInstance.value = value;
        if (onChange) {
            await onChange(value);
        }

        if (!autoResize) return;

        const { scrollHeight } = txAreaInstance;

        // Prevents height shrinking (if you actually delete text and you get less rows, scrollHeight just minuses -2 every type event until its at the texts height so doesnt resize properly)
        // A workaround to this would be to calculate height based on rows and a texts' height, but adds complexity. Note: go this route if it is really annoying.
        if (scrollHeight > maxTxAreaInstanceHeight) {
            maxTxAreaInstanceHeight = scrollHeight;
            containerInstance.style.height = `${scrollHeight}px`;
        }
    };

    $: {
        value;
        calculateHeight(value);
    }
</script>

<div class="outer-container" class:error class:autoResize bind:this={containerInstance}>
    <textarea class="textarea textarea-{size} {_class || ''}" disabled={disabled || loading} {placeholder} on:input={(e) => calculateHeight(e.target.value)} bind:value bind:this={txAreaInstance} name={htmlName} id={htmlName} {title} {style} cols="99999" rows="1" />
    {#if loading}
        <div class="spinner-container">
            <NW.Spinner --color="var(--grey-darkest)" />
        </div>
    {/if}
    {#if error}
        <small class="error-container">
            <NW.Icon name="exclamation" --color="var(--error-400)" --size="13px" style="position: relative; top: 2.5px;" />
            <span>{error}</span>
        </small>
    {/if}
</div>

<style>
    .outer-container {
        position: relative;
        display: flex;
        flex-direction: column;
        max-width: var(--input-width, 250px);
        min-height: var(--input-height, 65px);
        flex: 1 0 0px;
        height: 100%;
        width: 100%;
    }

    .autoResize {
        flex: unset;
    }

    /* Input */
    .textarea {
        outline: none;
        display: block;
        background-color: var(--grey-900);
        border: 1px solid var(--grey-700);
        font-size: var(--fs);
        line-height: var(--fs-lh);
        color: var(--grey-100);
        border-radius: var(--border-radius);
        flex: 1 0 0px;
        height: 100%;
        width: 100%;
    }

    .textarea-S {
        font-size: var(--fs-sm);
        line-height: var(--fs-sm-lh);
        padding: 6px 8px;
    }

    .textarea-M {
        padding: 6px 12px;
    }

    .textarea-L {
        padding: 8px 16px;
    }

    .autoResize .textarea {
        overflow: hidden;
    }

    /* Input states */
    .textarea::placeholder {
        color: var(--grey-600);
    }

    .textarea:active,
    .textarea:focus {
        outline: none;
        border: 1px solid var(--primary-400);
        box-shadow: 0 0 10px 0 hsla(209, 95%, 50%, 0.2);
    }

    .outer-container.error .textarea:active {
        box-shadow: 0 0 10px 0 hsla(0, 50%, 50%, 0.2);
    }

    .textarea:disabled {
        user-select: none;
        cursor: not-allowed;
        opacity: 0.35;
    }

    /* TODO: Find out how to add this only on keyboard focus, chrome doesn't do this */
    /* .input:focus-visible {
    outline: var(--focus-outline);
  } */

    /* Errors  */

    .outer-container.error .textarea {
        border: 1px solid var(--error-400);
    }

    .error-container {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        margin-top: 6px;
        user-select: text;
        cursor: auto;
    }

    .error-container span {
        font-size: var(--fs-sm);
        line-height: var(--fs-sm-lh);
        color: var(--error-400);
        white-space: break-spaces;
    }

    /* Spinner */

    .spinner-container {
        position: absolute;
        transform: translate(-50%, -50%);
        left: 50%;
        top: 50%;
    }
</style>
