<!--
    @component
    A component that renders a button and controls it's states

    @param onClick? {(e: mouseEvent) => void}: Sets the on click handler on the button
    @param theme? {string}: Sets the colour theme for the button (default 'primary')
    @param ghost? {boolean}: Sets the button to be a ghost style
    @param icon? {string}: Font awesome 6 icon to use before the text in the button
    @param disabled? {boolean}: Sets the disabled state of the button
    @param loading? {boolean}: Sets the loading state of the button
    @param style? {string}: Sets the style attribute of the button
    @param type? {string}: Sets the type of the button

    @example
        <Button icon="trash-can" theme="error" {loading} onClick={deleteTicket}>Delete</Button>
 -->
<script lang="ts">
  import Icon from './Icon.svelte';
  import Spinner from './Spinner.svelte';

  /** Sets the on click handler on the button */
  export let onClick: ((e: MouseEvent) => void) | undefined = undefined;
  /** Sets the colour theme for the button (default 'primary') */
  export let theme: string = 'primary';
  /** Sets the button to be a ghost style */
  export let ghost: boolean | undefined = undefined;
  /** Font awesome 6 icon to use before the text in the button */
  export let icon: string | undefined = undefined;
  /** Sets the disabled state of the button */
  export let disabled: boolean | undefined = undefined;
  /** Sets the loading state of the button */
  export let loading: boolean | undefined = undefined;
  /** Sets the style attribute of the button */
  export let style: string | undefined = undefined;
  /** Sets the type of the button */
  export let type: string | undefined = 'button';

  const parsedTheme = `var(--${theme})`;
  const parsedThemeHover = `var(--${theme}-hover)`;
  const parsedThemeDisabled = `var(--${theme}-disabled)`;

  // For ghost button when hovering need to pass colour dynamically
  let hovering = false;
  let iconColour = ghost ? parsedTheme : 'var(--white)';
  let spinnerColour = ghost ? 'var(--black) ' : 'var(--white)';

  if ((disabled || loading) && ghost) {
    iconColour = parsedThemeDisabled;
  }

  const toggleHovering = () => {
    hovering = !hovering;

    if (hovering && ghost) {
      iconColour = 'var(--white)';
    } else if (ghost) {
      iconColour = parsedTheme;
    }
  };
</script>

<button
  class="btn"
  class:ghost
  class:ghost-disabled={ghost && (disabled || loading)}
  style="--theme: {parsedTheme}; --theme-hover: {parsedThemeHover}; --theme-disabled: {parsedThemeDisabled}; {style || ''}"
  disabled={disabled || loading}
  {type}
  on:click={onClick && onClick}
  on:mouseenter={toggleHovering}
  on:mouseleave={toggleHovering}
>
  {#if loading}
    <div class="spinner-container">
      <Spinner colour={spinnerColour} />
    </div>
  {/if}
  {#if icon}
    <Icon name={icon} colour={iconColour} class="button-icon" />
  {/if}
  <slot />
</button>

<style>
  .btn {
    transition: all 0.2s ease-in-out;
    display: flex;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    position: relative;
    font-size: var(--fs);
    line-height: var(--fs);
    color: var(--white);
    border-radius: 8px;
    background-color: var(--theme);
    border: 1px solid transparent;
    padding: 14px 18px;
    font-weight: 500;
    gap: 6px;
  }

  .btn:focus-visible {
    outline: var(--focus-outline);
  }

  .btn:hover:not(:disabled) {
    background-color: var(--theme-hover);
  }

  .btn:disabled {
    cursor: not-allowed;
    background-color: var(--theme-disabled);
  }

  .btn.ghost {
    background-color: var(--white);
    border: 1px solid var(--theme);
    color: var(--theme);
  }

  .btn.ghost:hover:not(:disabled) {
    background-color: var(--theme);
    color: var(--white);
  }

  .btn.ghost-disabled {
    border-color: var(--theme-disabled);
    color: var(--theme-disabled);
  }

  .btn :global(.button-icon > *) {
    transition: all var(--color-transition-time) ease-in-out;
  }

  .spinner-container {
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
  }
</style>
