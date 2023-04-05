<!--
    @component
    Renders a text input

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
    @param icon? {string} Sets the FA 6 icon inside input
    @param iconPlacement? {string}: Sets the icon position

    @example
        <NW.Fieldset label="Description">
            <NW.Input bind:value={description} />
        </NW.Fieldset>
 -->
<script lang="ts">
  import NW from './';
  import { getContext } from 'svelte';

  /** Sets the bound value */
  export let value: string | null = null;
  /** Sets the on change handler */
  export let onChange: ((value: any) => Promise<void> | void) | undefined = undefined;
  /** Sets the disabled state */
  export let disabled: boolean | undefined = undefined;
  /** Sets the loading state */
  export let loading: boolean | undefined = undefined;
  /** Sets the error message  */
  export let error: string | undefined | null = undefined;
  /** Sets the tooltip */
  export let title: string | undefined = undefined;
  /** Sets the class */
  let _class: string | undefined = undefined;
  export { _class as class };
  /** Sets the style */
  export let style: string | undefined = undefined;
  /** Sets the placeholder */
  export let placeholder: string | undefined = undefined;
  /** Sets the FA 6 icon inside input */
  export let icon: string | undefined = undefined;
  /** Sets the icon position */
  export let iconPlacement: 'start' | 'end' | undefined = 'end';

  // Passed down from context in parent <Fieldset />
  const htmlName = getContext<string>('htmlName');

  let iconColor = 'var(--body)';
  $: _loading = loading;

  // Set icon colors based on props
  $: if (disabled || _loading || error) {
    if (error && placeholder && !value) {
      iconColor = 'var(--grey-600)';
    } else {
      iconColor = 'var(--grey-darkest)';
    }
  } else if (!disabled && !_loading && !error) {
    if (placeholder && !value) {
      iconColor = 'var(--grey-600)';
    } else {
      iconColor = 'var(--body)';
    }
  }

  const _onChange = async (e: Event) => {
    if (!onChange) {
      return;
    }
    await onChange(e.target?.value || null);
  };
</script>

<!-- Input -->
<div class="container" class:error>
  <div class="inner-container" {title}>
    <input bind:value on:input={_onChange} class="input {_class || ''}" class:icon class:icon-start={iconPlacement === 'start'} disabled={disabled || _loading} {placeholder} type="text" name={htmlName} id={htmlName} size="99999" {style} />
    {#if icon}
      <NW.Icon name={icon} class="input-icon {iconPlacement === 'start' ? 'input-icon-start' : ''}" style={disabled || _loading ? 'opacity: 0.1' : ''} --color={iconColor} />
    {/if}
    {#if _loading}
      <div class="spinner-container">
        <NW.Spinner --color="var(--grey-darkest)" />
      </div>
    {/if}
  </div>
  {#if error}
    <small class="error-container">
      <NW.Icon name="exclamation" --color="var(--error-400)" --size="13px" style="position: relative; top: 2.5px;" />
      <span>{error}</span>
    </small>
  {/if}
</div>

<style>
  .container {
    position: relative;
    max-width: var(--input-width, 250px);
    width: 100%;
  }

  .inner-container {
    position: relative;
    width: 100%;
  }

  /* Input */
  .input {
    outline: none;
    background-color: var(--grey-900);
    border: 1px solid var(--grey-700);
    height: var(--input-height, 45px);
    font-size: var(--fs);
    line-height: var(--fs-lh);
    color: var(--grey-100);
    border-radius: 4px;
    padding: 6px 16px;
    width: 100%;
  }

  /* Input states */
  .input::placeholder {
    color: var(--grey-600);
  }

  .input:active,
  .input:focus {
    outline: none;
    border: 1px solid var(--primary-400);
    box-shadow: 0 0 10px 0 hsla(209, 95%, 50%, 0.2);
  }

  .container.error .input:active {
    box-shadow: 0 0 10px 0 hsla(0, 50%, 50%, 0.2);
  }

  .input:disabled {
    user-select: none;
    cursor: not-allowed;
    opacity: 0.35;
  }

  /* TODO: Find out how to add this only on keyboard focus, chrome doesn't do this */
  /* .input:focus-visible {
    outline: var(--focus-outline);
  } */

  /* Icon */

  .input.icon {
    padding-right: 40px;
  }

  .input.icon-start {
    padding-left: 40px;
    padding-right: 0;
  }

  :global(.input-icon) {
    position: absolute;
    cursor: not-allowed;
    transform: translateY(-50%);
    right: 16px;
    top: 50%;
  }

  :global(.input-icon-start) {
    right: 0;
    left: 16px;
  }

  /* Errors  */

  .container.error .input {
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
