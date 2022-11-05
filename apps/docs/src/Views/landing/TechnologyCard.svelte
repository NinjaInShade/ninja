<script lang="ts">
  export let imgName: string;
  export let imgAlt: string;
  export let technologyName: string;
  export let technologyDescription: string;
</script>

<li class="card shadow-black">
  <div class="flex">
    <img src="/docs/{imgName}.png" alt="{imgAlt} logo" />
    <em>{technologyName}</em>
  </div>
  <p>{technologyDescription}</p>
</li>

<style>
  .card {
    transition: transform 0.2s ease-in-out;
    background-color: var(--grey-900);
    border-radius: 8px;
    padding: 24px;
  }

  .card:hover {
    transform: translateY(-5px);
  }

  .flex {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 16px;
    gap: 10px;
  }

  .flex em {
    font-size: var(--fs-md);
    line-height: var(--fs-md-lh);
    color: var(--white);
    font-weight: 600;
  }
</style>
