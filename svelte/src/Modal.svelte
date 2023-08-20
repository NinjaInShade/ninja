<script lang="ts">
    import type { SvelteComponent } from 'svelte';
    import { fade } from 'svelte/transition';
    import { sineInOut } from 'svelte/easing';
    import NW from './';

    /** Sets the tooltip */
    export let title: string | undefined = undefined;
    /** Sets the class */
    let _class: string | undefined = undefined;
    export { _class as class };
    /** Sets the style */
    export let style: string | undefined = undefined;
    /** Sets the component the modal renders */
    export let component: typeof SvelteComponent;
</script>

<div class="modal {_class ?? ''}" style={style ?? ''} {title} transition:fade={{ duration: 150, easing: sineInOut }}>
    <div class="modal-content">
        <svelte:component this={component} {...$$restProps} />
    </div>
</div>

<style>
    .modal {
        position: absolute;
        box-shadow: 0 7px 100px 0 hsla(0, 0%, 0%, 0.9);
        border-radius: var(--border-radius);
        background-color: var(--grey-900);
        transform: translate(-50%, -50%);
        max-width: 575px;
        padding: 40px;
        width: 100%;
        left: 50%;
        top: 50%;
    }
</style>
