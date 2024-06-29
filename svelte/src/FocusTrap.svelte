<script lang="ts" context="module">
    export const FOCUSABLE = ['a[href]', 'button', 'input', 'select', 'textarea', '[contenteditable]', '[tabindex]'].map(
        (selector) => `${selector}:not(:disabled):not([tabindex^="-"])`
    );
</script>

<script lang="ts">
    import { onMount } from 'svelte';

    /** Whether focus is returned after the trap is deactivated / destroyed */
    export let returnFocus: boolean = true;

    let trapContainer: HTMLElement;

    /** List of all focusable elements within the focus trap */
    let focusableEls: HTMLElement[];
    /** The currently focused element within the focus trap */
    let currentFocusedEl: HTMLElement | null = null;
    /** The element (if any) that had focus before we trapped focus */
    let originallyFocusedEl: HTMLElement | null = null;

    const observer = new MutationObserver(onDOMChange);

    onMount(() => {
        originallyFocusedEl = (document.activeElement ?? null) as HTMLElement | null;
        focusableEls = getFocusableEls();

        if (!focusableEls.length) return;

        currentFocusedEl = focusableEls[0];
        currentFocusedEl.focus();

        observer.observe(trapContainer, { attributes: true, childList: true, subtree: true });

        return dispose;
    });

    function dispose() {
        observer.disconnect();
        if (originallyFocusedEl && returnFocus) {
            originallyFocusedEl.focus();
        }
    }

    /**
     * Stops the focus trap, returning focus to the originally focused element if any and `returnFocus` is not disabled
     */
    export function deactivate() {
        return dispose();
    }

    function getFocusableEls() {
        return [...trapContainer.querySelectorAll(FOCUSABLE.join(', '))] as HTMLElement[];
    }

    function onDOMChange() {
        focusableEls = getFocusableEls();
    }

    function onKeyDown(e: KeyboardEvent) {
        const key = e.key;
        const shift = e.shiftKey;

        if (e.key === 'Escape') {
            dispose();
            return;
        }

        if (key !== 'Tab') {
            return;
        }

        e.preventDefault();

        const currentFocusedIndex = focusableEls.findIndex((el) => el === currentFocusedEl);

        if (shift) {
            if (currentFocusedIndex === 0) {
                // first item, loop to end
                currentFocusedEl = focusableEls[focusableEls.length - 1];
                currentFocusedEl.focus();
            } else {
                currentFocusedEl = focusableEls[currentFocusedIndex - 1];
                currentFocusedEl.focus();
            }
        } else {
            if (currentFocusedIndex === focusableEls.length - 1) {
                // last item, loop back round
                currentFocusedEl = focusableEls[0];
                currentFocusedEl.focus();
            } else {
                // focus next element
                currentFocusedEl = focusableEls[currentFocusedIndex + 1];
                currentFocusedEl.focus();
            }
        }
    }
</script>

<svelte:window on:keydown={onKeyDown} />

<div bind:this={trapContainer}>
    <slot />
</div>
