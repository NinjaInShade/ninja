<!--
    @component
    Renders a button

    Accepted CSS props:
    --button-height: Sets the height

    @param onClick? {Function}: Sets the on click handler
    @param htmlType? {string}: Sets the HTML button type
    @param disabled? {boolean}: Sets the disabled state
    @param loading? {boolean}: Sets the loading state
    @param title? {string}: Sets the tooltip
    @param class? {string}: Sets the class
    @param style? {string}: Sets the style
    @param size? {string}: Sets the size
    @param icon? {string}: Sets the FA 6 icon inside button
    @param theme? {string}: Sets the color theme
    @param textColor? {string}: Sets the color of the text
    @param iconColor? {string}: Sets the color of the icon
    @param ghost? {boolean}: Sets the ghost style (note: icon/text color props only affect the hover colors in this mode)
    @param text? {string}: Text to display in the button.

    @example
        <NW.Button icon="trash-can" theme="primary-200" {loading} onClick={deleteTicket}>Delete</NW.Button>
 -->
<script lang="ts">
    import NW from './';
    import { tick } from 'svelte';

    /** Sets the on click handler */
    export let onClick: ((e?: MouseEvent) => Promise<unknown> | unknown) | undefined = undefined;
    /** Sets the HTML button type */
    export let htmlType: 'button' | 'submit' | 'reset' | null | undefined = 'button';
    /** Sets the disabled state */
    export let disabled: boolean | undefined = undefined;
    /** Sets the loading state */
    export let loading: boolean | undefined = undefined;
    /** Sets the tooltip */
    export let title: string | undefined = undefined;
    /** Sets the class */
    let _class: string | undefined = undefined;
    export { _class as class };
    /** Sets the style */
    export let style: string | undefined = undefined;
    /** Sets the size */
    export let size: 'S' | 'M' | 'L' | undefined = 'M';
    /** Sets the FA 6 icon inside button */
    export let icon: string | undefined = undefined;
    /** Sets the color theme */
    export let theme: string = 'primary-400';
    /** Sets the color of the text */
    export let textColor: string = 'var(--white)';
    /** Sets the color of the icon */
    export let iconColor: string = 'var(--white)';
    /** Sets the ghost style (note: icon/text color props only affect the hover colors in this mode) */
    export let ghost: boolean | undefined = undefined;
    /**
     * Text to display in the button.
     * Useful for where you are rendering
     * NW.Button with svelte:component and can't use the slot
     */
    export let text: string | undefined = undefined;

    const parsedTheme = `var(--${theme})`;
    const parsedThemeHover = `var(--${theme}-hover)`;

    let buttonRef: HTMLElement;

    $: _loading = loading;

    // For ghost button when hovering need to pass color dynamically
    let hovering = false;
    let textColorParsed = ghost ? parsedTheme : textColor;
    let iconColorParsed = ghost ? parsedTheme : iconColor;
    let spinnerColor = ghost ? parsedTheme : textColor;

    const toggleHovering = () => {
        hovering = !hovering;

        if (hovering && ghost) {
            textColorParsed = textColor;
            iconColorParsed = iconColor;
        } else if (ghost) {
            textColorParsed = parsedTheme;
            iconColorParsed = parsedTheme;
        }
    };

    const _onClick = async (e: MouseEvent) => {
        // prevents losing focus on keyboard enter
        async function refocus() {
            await tick();
            buttonRef.focus();
        }

        if (!onClick) {
            return;
        }
        _loading = true;
        await onClick(e);
        _loading = false;
        await refocus();
    };
</script>

<button
    bind:this={buttonRef}
    type={htmlType}
    class="btn btn-{size} {_class || ''}"
    class:icon
    class:ghost
    class:ghost-disabled={ghost && (disabled || _loading)}
    style="--theme: {parsedTheme}; --theme-hover: {parsedThemeHover}; --textColor: {textColorParsed}; {style || ''}"
    disabled={disabled || _loading}
    on:click={_onClick}
    on:mouseenter={toggleHovering}
    on:mouseleave={toggleHovering}
    {title}
>
    {#if icon}
        <NW.Icon name={icon} --color={iconColorParsed} --size={size === 'S' ? '12px' : '16px'} />
    {/if}
    {#if text}
        {text}
    {:else}
        <slot />
    {/if}
    {#if _loading}
        <div class="spinner-container">
            <NW.Spinner --color={spinnerColor} />
        </div>
    {/if}
</button>

<style>
    /* base */
    .btn {
        transition: all 0.2s ease-in-out;
        display: inline-block;
        white-space: nowrap;
        position: relative;
        font-size: var(--fs);
        line-height: var(--fs);
        color: var(--textColor);
        border-radius: var(--border-radius);
        background-color: var(--theme);
        border: 1px solid transparent;
        font-weight: 400;
        gap: 8px;
    }

    /*
     DEV: button default heights are slightly less than other widgets as due to the vibrant filling,
     it creates an optical size illusion, making the button look bigger than the widget
     */
    .btn-S {
        font-size: var(--fs-sm);
        line-height: var(--fs-sm-lh);
        height: var(--button-height, 32.5px);
        padding: 0 8px;
        gap: 4px;
    }

    .btn-M {
        height: var(--button-height, 39.5px);
        padding: 0 12px;
    }

    .btn-L {
        height: var(--button-height, 43.5px);
        padding: 0 18px;
    }

    /* icon */
    .btn.icon {
        display: inline-flex;
        justify-content: center;
        align-items: center;
    }

    /* ghost */
    .btn.ghost {
        background: none;
        border: 1px solid var(--theme);
    }

    /* focus */
    .btn:focus-visible {
        outline: var(--focus-outline);
    }

    /* hover */
    .btn:hover:not(:disabled) {
        background-color: var(--theme-hover);
    }

    .btn.ghost:hover:not(:disabled) {
        background-color: var(--theme);
    }

    /* disabled */
    .btn:disabled {
        cursor: not-allowed;
        opacity: 0.35;
    }

    /* spinner */
    .spinner-container {
        position: absolute;
        transform: translate(-50%, -50%);
        left: 50%;
        top: 50%;
    }
</style>
