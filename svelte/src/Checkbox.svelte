<!--
    @component
    Renders a checkbox input

    @param value {boolean}: Sets the bound value
    @param disabled? {boolean}: Sets the disabled state
    @param loading? {boolean}: Sets the loading state
    @param error? {string}: Sets the error message
    @param title? {string}: Sets the tooltip
    @param class? {string}: Sets the class on the checkbox
    @param style? {string}: Sets the style on the checkbox
    @param onChange? {Function}: Sets the on change handler

    @example
        <NW.Fieldset label="Are you in tech?">
            <NW.Checkbox bind:value={isInTech} />
        </NW.Fieldset>
 -->
<script lang="ts">
  import NW from './';
  import { getContext } from 'svelte';

  /** Sets the bound value */
  export let value = false;
  /** Sets the disabled state */
  export let disabled: boolean | undefined = undefined;
  /** Sets the loading state */
  export let loading: boolean | undefined = undefined;
  /** Sets the error message */
  export let error: string | undefined | null = undefined;
  /** Sets the tooltip */
  export let title: string | undefined = undefined;
  /** Sets the class */
  let _class: string | undefined = undefined;
  export { _class as class };
  /** Sets the style */
  export let style: string | undefined = undefined;
  /** Sets the on change handler */
  export let onChange: ((value: boolean) => Promise<void> | void) | undefined = undefined;

  // Passed down from context in parent <Fieldset />
  const htmlName = getContext<string>('htmlName');

  $: _loading = loading;

  const _onChange = async (e: Event) => {
    if (!onChange) {
      return;
    }
    _loading = true;
    await onChange(e.target?.checked);
    _loading = false;
  };
</script>

<div class="container" class:error>
  <button class="inner-container {_class || ''}" tabindex="-1" {style} {title}>
    <input bind:checked={value} on:change={_onChange} class="input" disabled={disabled || _loading} name={htmlName} id={htmlName} type="checkbox" />
    {#if value}
      <NW.Icon name="check" --color="#fff" --size="13px" />
    {/if}
    {#if _loading}
      <div class="spinner-container">
        <NW.Spinner --color="#fff" --size="16px" />
      </div>
    {/if}
  </button>
  {#if error}
    <small class="error-container">
      <NW.Icon name="exclamation" --color="var(--error-400)" --size="13px" style="position: relative; top: 2.5px;" />
      <span>{error}</span>
    </small>
  {/if}
</div>

<style>
  /* Checkbox  */
  .inner-container {
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    outline: none;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--grey-900);
    border: 1px solid var(--grey-700);
  }

  .inner-container,
  .input {
    height: 25px;
    width: 25px;
  }

  .input {
    position: absolute;
    cursor: pointer;
    opacity: 0;
    left: 0;
    top: 0;
  }

  /* Checkbox states */
  .inner-container:has(.input:active),
  .inner-container:has(.input:focus) {
    outline: none;
    border: 1px solid var(--primary-400);
    box-shadow: 0 0 10px 0 hsla(209, 95%, 50%, 0.2);
  }

  .container.error .inner-container:has(.input:active) {
    box-shadow: 0 0 10px 0 hsla(0, 50%, 50%, 0.2);
  }

  .inner-container:has(.input:disabled) {
    user-select: none;
    cursor: not-allowed;
    opacity: 0.35;
  }

  .input:disabled {
    cursor: not-allowed;
  }

  .inner-container:has(.input:checked) {
    border-color: var(--primary-500);
    background-color: var(--primary-500);
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
