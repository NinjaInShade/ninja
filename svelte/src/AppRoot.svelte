<script lang="ts" context="module">
    import type { SvelteComponent } from 'svelte';
    import { writable } from 'svelte/store';

    // views / routing
    export type View = [typeof SvelteComponent, ViewProps];
    export type ViewPath = string | null;
    export type ViewProps = Record<string, unknown> | null;
    export type NewViewCallback = (newViewPath: ViewPath, newViewProps: ViewProps | null) => void;
    export type Routes = Record<string, string>;

    // modals
    export type Resolve = (value: any) => void;
    export type Options = Record<string, any>;

    export let modals = writable<[typeof SvelteComponent, Options, [Resolve, Resolve] | [], Options][] | []>([]);
</script>

<script lang="ts">
    import { fade } from 'svelte/transition';
    import { sineInOut } from 'svelte/easing';
    import { onMount } from 'svelte';
    import NW from './';
    import './default-theme.css';
    import './utils.css';

    export let routes: Routes;
    export let layout: typeof SvelteComponent | null = null;
    // TODO: fix this
    // helps with view path resolution
    export let projectType: 'app' | 'lib' | 'this' = 'app';

    let view: Promise<View>;
    let currentViewPath: ViewPath;

    onMount(() => {
        NW.nav.create(routes, async (viewPath: ViewPath, viewProps: ViewProps) => {
            view = loadView(viewPath, viewProps);
        });
    });

    /**
     * Loads a view
     **/
    const loadView = async (viewPath: ViewPath, viewProps: ViewProps): Promise<View> => {
        let processedViewPath = viewPath;

        if (processedViewPath?.startsWith('/')) {
            throw new Error(`[view] invalid view ${viewPath} views cannot start with '/'`);
        }

        const _determineView = (viewToDetermine: ViewPath) => {
            // no route was found, use wildcard or first route
            if (!viewPath) {
                return routes['*'] || Object.entries(routes)[0][1];
            } else {
                return viewToDetermine;
            }
        };

        processedViewPath = _determineView(viewPath);

        try {
            // TODO: fix the projectType "hack"
            let loadedView;
            if (projectType === 'app') {
                loadedView = await import(`../../../../src/views/${processedViewPath}/client.svelte`);
            } else if (projectType === 'lib') {
                loadedView = await import(`../../../../playground/src/views/${processedViewPath}/client.svelte`);
            } else if (projectType === 'this') {
                loadedView = await import(`../playground/src/views/${processedViewPath}/client.svelte`);
            } else {
                throw new Error(`Invalid project type, can be either 'app', 'lib' or 'this', got: '${projectType}'`);
            }

            if (currentViewPath !== processedViewPath) {
                console.log(`[load view]: view '${processedViewPath}' successfully loaded.`);
            }
            currentViewPath = processedViewPath;
            return [loadedView.default, viewProps];
        } catch (err: any) {
            const couldNotImportMsg = 'Failed to fetch dynamically imported module: ';
            if (err.message?.startsWith(couldNotImportMsg)) {
                const importPath = err.message.substring(couldNotImportMsg.length);
                throw new Error(`[load view]: view '${processedViewPath}' could not be imported. Ensure it exists. From: ${importPath}`);
            } else {
                throw new Error(`[load view]: view '${processedViewPath}' could not be imported. Ensure it's valid`);
            }
        }
    };
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
    <div class="top-modal" class:visible={$modals.length} on:click|self={() => NW.nav.closeModal(1, false)} transition:fade={{ duration: 150, easing: sineInOut }}>
        {#each $modals as modal}
            <NW.Modal component={modal[0]} {...modal[1]} />
        {/each}
    </div>
{/if}

<style>
    .root-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .root-grow {
        flex-grow: 1;
        width: 100%;
        height: 100%;
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
