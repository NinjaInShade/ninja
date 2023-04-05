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
    @param icon? {string}: Sets the FA 6 icon inside button
    @param theme? {string}: Sets the color theme
    @param textColor? {string}: Sets the color of the text
    @param iconColor? {string}: Sets the color of the icon
    @param ghost? {boolean}: Sets the ghost style (note: icon/text color props only affect the hover colors in this mode)

    @example
        <NW.Button icon="trash-can" theme="primary-200" {loading} onClick={deleteTicket}>Delete</NW.Button>
 -->
<script lang="ts">
    import NW from './';

    /** Sets the on click handler */
    export let onClick: ((e?: MouseEvent) => Promise<void> | void) | undefined = undefined;
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

    const parsedTheme = `var(--${theme})`;
    const parsedThemeHover = `var(--${theme}-hover)`;

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
        if (!onClick) {
            return;
        }
        _loading = true;
        await onClick(e);
        _loading = false;
    };
</script>

<button
    type={htmlType}
    class="btn {_class || ''}"
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
        <NW.Icon name={icon} --color={iconColorParsed} />
    {/if}
    <slot />
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
        height: var(--button-height, 45px);
        border: 1px solid transparent;
        padding: 0 18px;
        font-weight: 400;
        gap: 6px;
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
