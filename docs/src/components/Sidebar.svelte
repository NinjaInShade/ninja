<script lang="ts" context="module">
    import type { SvelteComponent } from 'svelte';
    import { writable } from 'svelte/store';

    export const activeSection = writable<string | null>(null);

    export type IntroLinks = Record<string, { icon: string; iconStyle?: string; component: typeof SvelteComponent }>;
    export type DocLinks = Record<string, Record<string, typeof SvelteComponent>>;
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import NW from '@ninjalib/svelte';

    export let introLinks: IntroLinks;
    export let docLinks: DocLinks;

    let openMenu: string | null = null;

    onMount(() => {
        $activeSection = Object.keys(introLinks)[0];
    });

    function changeActiveSection(section: string) {
        $activeSection = section;
    }
</script>

<section class="intro">
    {#each Object.entries(introLinks) as [text, data]}
        {@const active = $activeSection === text}
        <button
            on:click={() => {
                changeActiveSection(text);
                openMenu = null;
            }}
            class="intro-link"
            class:active
        >
            <div class="circle">
                <NW.Icon name={data.icon} style={data.iconStyle} --color="#000" --size="0.9em" />
            </div>
            {text}
        </button>
    {/each}
</section>
<section class="docs">
    <ul class="root-list">
        {#each Object.entries(docLinks) as [text, children]}
            {@const open = openMenu === text}
            <li>
                <button
                    class="root-button"
                    class:open
                    on:click={() => {
                        if (openMenu === text) {
                            openMenu = null;
                        } else {
                            openMenu = text;
                        }
                    }}
                >
                    <NW.Icon name="chevron-right" --color="var(--grey-300)" style="transition: transform 0.1s ease-in-out;" class={open ? 'docs-menu-open' : ''} />
                    {text}
                </button>
                {#if open}
                    <ul class="child-list">
                        {#each Object.keys(children) as child}
                            {@const active = $activeSection === text + '/' + child}
                            <li>
                                <button
                                    on:click={() => {
                                        $activeSection = text + '/' + child;
                                    }}
                                    class:active>{child}</button
                                >
                            </li>
                        {/each}
                    </ul>
                {/if}
            </li>
        {/each}
    </ul>
</section>

<style>
    .intro-link {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        color: var(--grey-300);
        border-radius: 0 8px 8px 0;
        padding: 12px 32px;
        width: 100%;
        gap: 12px;
    }

    .intro-link .circle {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
        border-radius: 50%;
        height: 26px;
        width: 26px;
    }

    .intro-link.active {
        background-color: var(--grey-800);
    }

    .intro {
        margin-bottom: 40px;
    }

    .docs {
        margin-left: 32px;
    }

    .docs .root-list {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        gap: 16px;
    }

    .docs .root-button {
        display: flex;
        align-items: center;
        color: var(--grey-300);
        text-transform: uppercase;
        gap: 16px;
    }

    .docs .root-button.open {
        margin-bottom: 16px;
    }

    :global(.docs-menu-open) {
        transform: rotate(90deg);
    }

    .child-list {
        display: flex;
        flex-flow: column nowrap;
        border-left: 0.5px var(--grey-400) solid;
        margin-left: 8px;
        padding-left: 24px;
        gap: 8px;
    }

    .child-list li button {
        transition: color 0.2s ease-in-out;
        color: var(--grey-400);
        font-weight: 500;
    }

    .child-list li button:hover,
    .child-list li button.active {
        color: var(--grey-600);
    }
</style>
