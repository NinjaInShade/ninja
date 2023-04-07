<script lang="ts">
    import NW from '@ninjalib/svelte';
    import Sidebar, { activeSection } from '~/components/Sidebar.svelte';
    import { INTRO_LINKS, DOC_LINKS } from './links';

    /**
     * Gets the component for the current section
     */
    function getCurrentSection(activeSection: string | null) {
        const split = activeSection?.split('/');
        let component = INTRO_LINKS[activeSection]?.component;
        if (!component && split?.length) {
            component = DOC_LINKS[split[0]][split[1]];
        }
        return component;
    }

    $: currentSection = getCurrentSection($activeSection);
</script>

<div class="layout">
    <nav class="sidebar">
        <Sidebar introLinks={INTRO_LINKS} docLinks={DOC_LINKS} />
    </nav>
    <main class="content">
        {#if currentSection}
            <svelte:component this={currentSection} />
        {:else}
            <NW.Spinner />
        {/if}
    </main>
</div>

<style>
    .layout {
        display: flex;
        justify-content: center;
        align-items: stretch;
        height: 100%;
    }

    .sidebar {
        display: flex;
        flex-flow: column nowrap;
        justify-content: flex-start;
        align-items: stretch;
        background-color: var(--grey-900);
        box-shadow: 0 5px 30px 0 rgba(0, 0, 0, 0.2);
        padding: 42px 32px 42px 0;
        max-width: 285px;
        width: 100%;
        height: 100%;
    }

    .content {
        flex: 1 0 0px;
    }
</style>
