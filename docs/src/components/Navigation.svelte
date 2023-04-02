<nav class="nav shadow-black-darker">
  <div class="flex">
    <a href="/"><img src="/logo-white.png" alt="Ninja logo" /></a>
    <b class="brand-name">Ninja</b>
    <small class="version"><span>v</span>0.0.1</small>
  </div>
  <ul class="links">
    <li><a href="/">ninja</a></li>
    <li><a href="/docs">docs</a></li>
  </ul>
  <div class="flex">
    <a href="https://github.com/NinjaInShade/ninja" target="_blank" rel="noreferrer"><img src="/docs/github.svg" alt="Github icon" /></a>
    <a href="..."><img src="/docs/discord.svg" alt="Discord icon" /></a>
  </div>
</nav>

<style>
  .nav,
  .flex,
  .links {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav {
    background-color: var(--grey-800);
    padding: 1em 2em;
  }

  .flex {
    justify-content: flex-start;
    width: 250px;
    gap: 0.5em;
  }

  .flex:last-child {
    justify-content: flex-end;
  }

  .links {
    justify-content: center;
    gap: 1.5em;
  }

  .brand-name {
    color: var(--white);
    font-size: 1.625em;
    line-height: 1.625em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .version {
    display: block;
    border: 1px solid var(--primary-400);
    color: var(--primary-400);
    padding: 5px 10px 3px 10px;
    border-radius: 50px;
    line-height: 10px;
    font-weight: 600;
    font-size: 12px;
  }

  .version span {
    display: inline-block;
    font-size: 10px;
  }
</style>
