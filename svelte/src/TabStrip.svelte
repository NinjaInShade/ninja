<!--
    @component
    Renders a tab strip

    @param tabs {Array}: Sets the tabs
    @param title? {string}: Sets the tooltip
    @param class? {string}: Sets the class
    @param style? {string}: Sets the style
    @param tabStyle? {string}: Sets the tab style

    @example
        <NW.TabStrip tabs={[
          ['Buttons', Buttons],
          ['Inputs', Inputs],
          ['Misc', Misc],
        ]} />
 -->
<script lang="ts">
    import type { SvelteComponent } from 'svelte';
    import { onMount } from 'svelte';
    import NW from './';

    type Tab = [string, typeof SvelteComponent, Record<string, unknown>] | [string, typeof SvelteComponent];

    /** Sets the tabs */
    export let tabs: Tab[];
    /** Sets the tooltip */
    export let title: string | undefined = undefined;
    /** Sets the class */
    let _class: string | undefined = undefined;
    export { _class as class };
    /** Sets the style */
    export let style: string | undefined = undefined;
    /** Sets the tab style */
    export let tabStyle: string | undefined = undefined;

    let currentTab = tabs[0];

    onMount(() => {
        const tab = NW.nav.getQuery('tab');
        if (!tab) {
            NW.nav.setQuery('tab', currentTab[0]);
        } else {
            const foundTab = tabs.find((t) => t[0] === tab);
            if (!foundTab) return;
            currentTab = foundTab;
        }
    });

    const changeTab = (tab: Tab) => {
        currentTab = tab;
        NW.nav.setQuery('tab', tab[0]);
    };
</script>

<div class="tabs {_class || ''}" {style} {title}>
    {#each tabs as tab, index}
        <button class="tab" class:active={currentTab[0] === tab[0]} on:click={() => changeTab(tab)} style={tabStyle}>
            {tab[0]}
        </button>
    {/each}
</div>

<!-- has props -->
{#if currentTab.length === 3}
    <svelte:component this={currentTab[1]} props={currentTab[2]} />
{:else}
    <svelte:component this={currentTab[1]} />
{/if}

<style>
    .tabs {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        border-bottom: 2px solid var(--grey-700);
        margin-bottom: 2em;
        width: 100%;
    }

    .tab {
        position: relative;
        padding: 0.5em 1.5em;
        color: var(--grey-400);
    }

    .tab.active {
        color: var(--grey-200);
    }

    .tab.active::after {
        position: absolute;
        content: '';
        bottom: -2px;
        width: 100%;
        height: 2px;
        left: 0;
        background-color: var(--primary-400);
    }
</style>
