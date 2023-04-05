<!--
    @component
    Renders a font awesome 6 icon

     Accepted CSS props:
    --color: Sets the icons color
    --size: Sets the icons size

    @param name {string}: Name of the FA 6 icon
    @param title? {string}: Sets the tooltip
    @param class? {string}: Sets the class
    @param style? {string}: Sets the style

    @example
        <NW.Icon name='bars-staggered' --color='var(--primary-200)' />
-->
<script lang="ts">
  /** Name of the FA 6 icon */
  export let name: string;
  /** Sets the tooltip */
  export let title: string | undefined = undefined;
  /** Sets the class */
  let _class: string | undefined = undefined;
  export { _class as class };
  /** Sets the style */
  export let style: string | undefined = undefined;

  // Note: has to be wrapped into a span as otherwise you get:
  // 'cannot remove node error' (https://github.com/sveltejs/svelte/issues/2086)
</script>

<span {style} {title} class={_class || ''}>
  <i class="font-awesome-icon fa-solid fa-fw fa-{name}" />
</span>

<style>
  .font-awesome-icon {
    display: block;
    font-size: var(--size, 16px);
    color: var(--color, #fff);
    transition: color var(--color-transition-time) ease-in-out;
  }
</style>
