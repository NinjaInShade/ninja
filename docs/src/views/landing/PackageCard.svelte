<script lang="ts">
  import NW from '@ninjalib/svelte';

  export let icon: string;
  export let packageSelected: string;
  export let packageName: string;
  export let packageDescription: string;

  $: _packageSelected = packageSelected === packageName;
  const changePackage = () => {
    packageSelected = packageName;
  };
</script>

<button on:click={changePackage} class="showcase-card" class:showcase-card-active={_packageSelected} class:shadow-black={_packageSelected}>
  <NW.Icon name={icon} --color="var(--primary-400)" --size="32px" />
  <div>
    <b class="package-name">{packageName}</b>
    <p>{packageDescription}</p>
  </div>
</button>

<style>
  .showcase-card {
    display: flex;
    align-items: center;
    transition: background-color 0.2s ease-in-out;
    padding: 16px 24px;
    border-radius: var(--border-radius);
    cursor: pointer;
    gap: 24px;
  }

  .showcase-card:hover,
  .showcase-card-active {
    background-color: var(--grey-900);
  }

  .package-name {
    color: var(--white);
    font-size: var(--fs-md);
    line-height: var(--fs-md);
    display: block;
    text-align: left;
    font-weight: 600;
  }
</style>
