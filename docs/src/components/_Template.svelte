<!--
    @component
    ...

    Accepted CSS props:
    --a: ...

    @param disabled? {boolean}: Sets the disabled state
    @param loading? {boolean}: Sets the loading state
    @param error? {string}: Sets the error message
    @param title? {string}: Sets the tooltip
    @param class? {string}: Sets the class
    @param style? {string}: Sets the style

    @example
        <NW.A {props}>
            <NW.B {style} />
        </NW.A>
 -->
<script lang="ts">
  import NW from '@ninjalib/svelte';

  /** TODO: Sets the disabled state */
  export let disabled: boolean | undefined = undefined;
  /** TODO: Sets the loading state */
  export let loading: boolean | undefined = undefined;
  /** TODO: Sets the error message */
  export let error: string | undefined | null = undefined;
  /** TODO: Sets the tooltip */
  export let title: string | undefined = undefined;
  /** TODO: Sets the class */
  let _class: string | undefined = undefined;
  export { _class as class };
  /** TODO: Sets the style */
  export let style: string | undefined = undefined;
</script>

<!-- {#if _loading}
      <div class="spinner-container">
        <NW.Spinner --color="var(--grey-darkest)" />
      </div>
    {/if} -->

<!-- {#if error}
    <small class="error-container">
      <NW.Icon name="exclamation" style="position: relative; top: 2.5px;" --color="var(--error-400)" --size="13px" />
      <span>{error}</span>
    </small>
  {/if} -->
<style>
  /* Errors  */
  /* .container.error .input {
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
  } */

  /* Spinner */
  /* .spinner-container {
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
  } */
</style>
