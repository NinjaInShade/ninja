<script lang="ts" context="module">
    import type { SvelteComponent } from 'svelte';
    import { writable } from 'svelte/store';
    import type { View, ViewProps } from './view';

    // views / routing
    export type NewViewCallback = (newViewPath: string | null, newViewProps: ViewProps | null) => void;
    export type Routes = Record<string, string>;

    // modals
    export type ModalOptions = {
        asPromise?: boolean;
    };
    export type ModalDef = {
        view: Promise<View>;
        options: ModalOptions;
        resolve?: (value: any) => void;
    };

    // export let modals = writable<[typeof SvelteComponent, Options, [Resolve, Resolve] | [], Options][] | []>([]);
    export let modals = writable<ModalDef[]>([]);
</script>

<script lang="ts">
    import { fade } from 'svelte/transition';
    import { sineInOut } from 'svelte/easing';
    import { onMount } from 'svelte';
    import { loadView } from './view';
    import NW from './';
    import './default-theme.css';
    import './utils.css';

    export let routes: Routes;
    export let layout: typeof SvelteComponent | null = null;

    let view: Promise<View>;

    onMount(() => {
        NW.nav.create(routes, async (viewPath: string | null, viewProps: ViewProps) => {
            if (!viewPath) {
                viewPath = routes['*'] || Object.entries(routes)[0][1];
            }

            view = loadView(viewPath, viewProps);
        });
    });
</script>

<!-- if check for initial load as view is not yet a promise -->
{#if view}
    {#await view}
        <div class="root-center root-grow">
            <NW.Spinner --size="36px" />
        </div>
    {:then loadedView}
        {#if layout}
            <svelte:component this={layout}>
                <div class="root-grow" slot="content">
                    {#if loadedView[1]}
                        <svelte:component this={loadedView[0]} props={{ ...loadedView[1] }} />
                    {:else}
                        <svelte:component this={loadedView[0]} />
                    {/if}
                </div>
            </svelte:component>
        {:else}
            <div class="root-grow">
                {#if loadedView[1]}
                    <svelte:component this={loadedView[0]} props={{ ...loadedView[1] }} />
                {:else}
                    <svelte:component this={loadedView[0]} />
                {/if}
            </div>
        {/if}
    {:catch err}
        <!-- TODO: check if 404 is provided, if not show a better styled UI with home button -->
        {(console.error(err), '')}
        <div class="root-center root-grow">
            <h1>View not found</h1>
        </div>
    {/await}
{/if}

<!-- modals -->
{#if $modals.length}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="top-modal"
        class:visible={$modals.length}
        on:click|self={() => NW.nav.closeModal(1, null)}
        transition:fade={{ duration: 150, easing: sineInOut }}
    >
        {#each $modals as modal}
            {@const view = modal.view}
            {#await view}
                <div class="root-center-modal">
                    <NW.Spinner --size="36px" --color="var(--grey-100)" />
                </div>
            {:then loadedView}
                {#if loadedView[1]}
                    <svelte:component this={loadedView[0]} props={{ ...loadedView[1] }} />
                {:else}
                    <svelte:component this={loadedView[0]} />
                {/if}
            {:catch}
                <!-- TODO: ERROR HANDLING IF MODAL CANNOT LOAD (PERHAPS VIEW ISN'T VALID) -->
                <div class="root-center-modal">
                    <NW.Spinner --size="36px" --color="var(--grey-100)" />
                </div>
            {/await}
        {/each}
    </div>
{/if}

<style>
    .root-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .root-center-modal {
        position: absolute;
        transform: translate(-50%, -50%);
        left: 50%;
        top: 50%;
    }

    .root-grow {
        flex-grow: 1;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .top-modal {
        position: fixed;
        display: none;
        background-color: hsla(0, 0%, 0%, 0.8);
        z-index: 9999;
        bottom: 0;
        right: 0;
        left: 0;
        top: 0;
    }

    .visible {
        display: block;
    }
</style>
