<script lang="ts">
  import Navigation from '~/components/local/Navigation.svelte';
  import Button from '~/components/Button.svelte';
  import Phone from './Phone.svelte';
  import TechnologyCard from './TechnologyCard.svelte';
  import PackageCard from './PackageCard.svelte';

  let packageSelected = 'Svelte';
  const technologies = [
    { imgName: 'typescript', imgAlt: 'Typescript', name: 'Typescript', description: 'Every package comes with Typescript' },
    { imgName: 'svelte', imgAlt: 'Svelte', name: 'Svelte', description: 'Frontend widgets are built with svelte' },
    { imgName: 'node', imgAlt: 'Node JS', name: 'Node JS', description: 'Server code uses and is written in Node JS' },
    { imgName: 'vite', imgAlt: 'Vite', name: 'Vite', description: 'The build tool is integrated with Vite' },
  ];
  const packages = [
    { icon: 'microchip', name: 'Core', description: "Mutliple client & server API's" },
    { icon: 'cubes', name: 'Build', description: 'Setup script and more' },
    { icon: 'dice', name: 'Svelte', description: '20+ widgets & 5+ actions' },
    { icon: 'wand-magic-sparkles', name: 'Util', description: '50+ utility functions' },
    { icon: 'database', name: 'SQL', description: 'MySQL connection & ORM' },
  ];
</script>

<Navigation />

<main class="outer">
  <section class="container">
    <div class="outer-flex">
      <div>
        <header>
          <h1 class="title">Create <span>full-stack</span> apps with less boilerplate</h1>
          <p class="subtitle">5 client & server packages that let you build svelte apps without thinking about the repetitive tasks</p>
          <div class="buttons">
            <Button theme="primary-400">View docs</Button>
            <Button theme="black" icon="brands fa-github">Source code</Button>
          </div>
        </header>
        <ul class="technologies">
          {#each technologies as tech}
            <TechnologyCard imgName={tech.imgName} imgAlt={tech.imgAlt} technologyName={tech.name} technologyDescription={tech.description} />
          {/each}
        </ul>
      </div>
      <Phone />
    </div>
  </section>

  <section class="container features">
    <h2 class="features-title">What kind of stuff is NINJA capable of?</h2>
    <p class="features-subtitle">Below is a quick glimpse at some cool stuff provided by each package</p>
    <div class="showcase">
      <div class="packages">
        {#each packages as pkg}
          <PackageCard bind:packageSelected icon={pkg.icon} packageName={pkg.name} packageDescription={pkg.description} />
        {/each}
      </div>
      <div class="box" />
    </div>
  </section>
</main>

<style>
  .outer {
    position: relative;
    background: linear-gradient(to bottom, var(--grey-900) 585px, rgba(0, 0, 0, 0) 150px);
    padding: 0 2em;
  }

  .outer::before,
  .outer::after {
    content: '';
    position: absolute;
    transform: rotate(3.5deg);
    width: 100vw;
    left: -10px;
  }

  .outer::before {
    background-color: var(--grey-900);
    height: 200px;
    top: 455px;
  }

  .outer::after {
    background-color: var(--grey-800);
    height: 100px;
    top: 655px;
  }

  header {
    padding: 115px 0;
  }

  .title {
    max-width: 585px;
  }

  .title span {
    color: var(--primary-400);
  }

  .subtitle {
    font-size: var(--fs-md);
    line-height: var(--fs-md-lh);
    color: var(--grey-300);
    margin: 16px 0 40px 0;
    max-width: 380px;
  }

  .buttons {
    display: flex;
    gap: 16px;
  }

  .technologies {
    display: grid;
    grid-template-columns: repeat(2, 250px);
    grid-template-rows: repeat(2, auto);
    gap: 24px;
  }

  .outer-flex {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    position: relative;
    z-index: 2;
  }

  .features {
    margin-top: 150px;
    margin-bottom: 150px;
  }

  .features-title {
    max-width: 460px;
  }

  .features-subtitle {
    color: var(--grey-300);
    max-width: 380px;
    margin-top: 16px;
  }

  .showcase {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin-top: 60px;
    gap: 75px;
  }

  .box {
    background-color: var(--grey-900);
    border-radius: 8px;
    height: 750px;
    flex-grow: 1;
  }

  .packages {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
  }
</style>
