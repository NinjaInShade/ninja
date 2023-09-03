<script lang="ts">
    import type { SvelteComponent } from 'svelte';
    import { fade } from 'svelte/transition';
    import { sineInOut } from 'svelte/easing';
    import NW from './';

    /** Sets the class */
    let _class: string | undefined = undefined;
    export { _class as class };
    /** Sets the style */
    export let style: string | undefined = undefined;
    /** Sets the header style */
    export let headerStyle: string | undefined = undefined;
    /** Sets the footer style */
    export let footerStyle: string | undefined = undefined;
    /** Sets the content style */
    export let contentStyle: string | undefined = undefined;
    /** Sets the title of the modal */
    export let title: string | undefined = undefined;
    /** Sets the component the modal renders */
    export let component: typeof SvelteComponent | undefined = undefined;

    function closeModal() {
        NW.nav.closeModal(1, null);
    }
</script>

<div class="modal {_class ?? ''}" style={style ?? ''} transition:fade={{ duration: 150, easing: sineInOut }}>
    <div class="modal-header" style={headerStyle ?? ''}>
        <p class="modal-title">{title ?? ''}</p>
        <button class="close-btn" on:click={closeModal}>
            <NW.Icon name="close" --size="1.35em" />
        </button>
    </div>
    <div class="modal-content" style={contentStyle ?? ''}>
        {#if component}
            <svelte:component this={component} {...$$restProps} />
        {:else}
            <slot />
        {/if}
    </div>
    <div class="modal-footer" style={footerStyle ?? ''}>
        {#if $$slots.controls}
            <slot name="controls" />
        {:else}
            <NW.Button onClick={closeModal}>Close</NW.Button>
        {/if}
    </div>
</div>

<style>
    .modal {
        display: flex;
        flex-flow: column nowrap;
        position: absolute;
        transform: translate(-50%, -50%);
        box-shadow: 0 7px 100px 0 hsla(0, 0%, 0%, 0.9);
        border-radius: var(--border-radius);
        background-color: var(--grey-800);
        max-width: var(--modal-width, 575px);
        height: var(--modal-height, auto);
        width: 100%;
        left: 50%;
        top: 50%;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--grey-900);
        padding: 0.75em 1.25em;
        height: 60px;
    }

    .modal-title {
        color: var(--grey-100);
        line-height: 1.35em;
        font-size: 1.35em;
    }

    .close-btn:focus-visible {
        outline: var(--focus-outline);
    }

    .modal-footer {
        border-top: 1px solid var(--grey-700);
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0.5em;
    }
    .modal-content {
        padding: 1.5em 1.25em;
        flex: 1 0 0px;
    }

    .modal-footer {
        padding: 1.25em;
    }
</style>
