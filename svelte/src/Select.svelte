<script context="module" lang="ts">
    type CloseFunction = () => void;
    const selectInstances: [HTMLElement, CloseFunction][] = [];
</script>

<!--
    @component
    Renders a select component in which you can select a value/s (multi-select supported)

    @param data {{value: any, label: string}}: Data that can be selected
    @param onSelect {(value: any) => void}: Function that runs when you select an item
    @param selected {any | any[]}: Currently selected item's value
    @param width? {string}: Sets the min-width of the select
    @param icon? {string}: Sets the icon to be used in the select button
    @param disabled? {boolean}: Sets the disabled state of the select
    @param loading? {boolean}: Sets the loading state of the select
    @param error? {string}: Sets the error string that will be shown underneath the select
    @param multiSelect? {boolean}: Enables multi selection support
    @param allowNone? {boolean}: Allows you to select none (default true)

    @example
        // If using multi select, and want a default values, use an array e.g. ['foo'] or ['foo', 'bar']
        <NW.Fieldset label='Category'>
            <Select
                data={[
                    { value: 'new', label: 'New' },
                    { value: 'completed', label: 'Completed' },
                ]}
                bind:value={category}
            />
        <NW.Fieldset />
 -->
<script lang="ts">
    type SelectData = { value: any; label: string };

    import NW from './';
    import { onMount, getContext } from 'svelte';

    /** Sets the bound value */
    export let value: any | any[] = undefined;
    /** Data that can be selected */
    export let data: SelectData[];
    /** Function that runs when you select an item */
    export let onSelect: ((newValue: any) => Promise<void> | void) | undefined = undefined;
    /** Sets the disabled state */
    export let disabled: boolean | undefined = undefined;
    /** Sets the loading state */
    export let loading: boolean | undefined = undefined;
    /** Sets the error message  */
    export let error: string | undefined | null = undefined;
    /** Sets the tooltip */
    export let title: string | undefined = undefined;
    /** Sets the class */
    let _class: string | undefined = undefined;
    export { _class as class };
    /** Sets the style */
    export let style: string | undefined = undefined;
    /** Sets the placeholder text if nothing is selected */
    export let placeholder: string | undefined = undefined;
    /** Sets the size */
    export let size: 'S' | 'M' | 'L' | undefined = 'M';
    /** Allows you to clear select */
    export let allowClear: boolean = false;
    /** Enables multi selection support */
    export let multiSelect: boolean | undefined = undefined;

    // Passed down from context in parent <Fieldset />
    const htmlName = getContext<string>('htmlName');

    let open = false;
    let thisInstance: HTMLElement;
    let thisButtonInstance: HTMLElement;
    let thisMenuInstance: HTMLElement;

    onMount(() => {
        selectInstances.push([thisInstance, () => (open = false)]);
    });

    // Calculate label
    let label;
    $: if (value && multiSelect) {
        label = data.find((item) => item.value === value[0])?.label!;
    } else {
        label = data.find((item) => item.value === value)?.label!;
    }

    // Calculates if an item is active
    const isActive = (itemValue: any) => {
        if (!multiSelect) {
            return itemValue === value;
        } else if (value) {
            return value.includes(itemValue);
        } else {
            return false;
        }
    };

    const handleOpen = () => {
        if (!open) {
            // Closes all other select menu's, thus showing only one at a time
            selectInstances.forEach(([el, close]) => {
                if (el === thisInstance) {
                    return;
                }

                close();
            });
            open = true;
        } else {
            open = false;
        }
    };

    // Closes if you click outside of the select
    const handleOutsideClick = (e) => {
        if (thisButtonInstance.contains(e.target)) {
            return;
        }
        if (multiSelect && thisMenuInstance.contains(e.target)) {
            return;
        }
        open = false;
    };

    const handleSelect = async (newValue: any) => {
        if (!newValue) {
            value = null;
        } else if (!multiSelect) {
            value = newValue;
        } else {
            if (!value) {
                value = [];
            }
            if (value.includes(newValue)) {
                if (value.length !== 1) {
                    const existingIndex = value.findIndex((existingValue) => existingValue === newValue);
                    value.splice(existingIndex, 1);
                    value = value;
                }
            } else {
                value = [...value, newValue];
            }
        }

        if (!multiSelect) {
            open = false;
        }
        if (onSelect) {
            await onSelect(newValue);
        }
    };
</script>

<svelte:window on:click|capture={handleOutsideClick} />

<div class="outer-container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="inner-container select-{size}" on:click|stopPropagation bind:this={thisInstance}>
        <!-- Select button -->
        <button class="select {_class || ''}" class:error disabled={disabled || loading} {title} {style} name={htmlName} id={htmlName} on:click={handleOpen} bind:this={thisButtonInstance}>
            {#if loading}
                <div class="spinner-container">
                    <NW.Spinner --color="var(--grey-darkest)" />
                </div>
            {/if}
            <span class="select-label" class:placeholder={!value && placeholder}>
                {#if value}
                    {#if !multiSelect || value.length === 1}
                        {label}
                    {:else if multiSelect && value.length > 1}
                        {label} + {value.length - 1} {value.length === 2 ? 'other' : 'others'}
                    {/if}
                {:else if placeholder}
                    {placeholder}
                {/if}
            </span>
            <NW.Icon name="chevron-down" style={disabled || loading ? 'opacity: 0.1' : ''} --size={size === 'S' ? '12px' : '16px'} />
        </button>
        <!-- Select menu -->
        <ul class="select-menu" class:open bind:this={thisMenuInstance}>
            <!-- Forces re-evaluation of active item (might need to re-think approach for larger datasets) -->
            {#key value}
                {#if allowClear}
                    <li>
                        <button class="select-menu-item clear" on:click={() => handleSelect(null)}><NW.Icon name="ban" --size="0.75em" --color="var(--grey-400)" />Clear</button>
                    </li>
                {/if}
                {#each data as item}
                    <li>
                        <button class="select-menu-item" class:active={isActive(item.value)} on:click|stopPropagation={() => handleSelect(item.value)}>{item.label}</button>
                    </li>
                {/each}
            {/key}
        </ul>
    </div>
    {#if error}
        <small class="error-container">
            <NW.Icon name="exclamation" --color="var(--error-400)" --size="13px" style="position: relative; top: 2.5px;" />
            <span>{error}</span>
        </small>
    {/if}
</div>

<style>
    .outer-container {
        position: relative;
        max-width: var(--input-width, 250px);
        width: 100%;
    }

    .inner-container {
        position: relative;
        width: 100%;
    }

    .select {
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        border-radius: var(--border-radius);
        font-size: var(--fs);
        line-height: var(--fs-lh);
        background-color: var(--grey-900);
        border: 1px solid var(--grey-700);
        color: var(--grey-100);
        width: 100%;
        gap: 8px;
    }

    .select-S .select {
        font-size: var(--fs-sm);
        line-height: var(--fs-sm-lh);
        height: var(--input-height, 34px);
        padding: 0 8px;
    }

    .select-M .select {
        height: var(--input-height, 41px);
        padding: 0 12px;
    }

    .select-L .select {
        height: var(--input-height, 45px);
        padding: 0 18px;
    }

    .select:focus,
    .select:active {
        outline: none;
        border: 1px solid var(--primary-400);
        box-shadow: 0 0 10px 0 hsla(209, 95%, 50%, 0.2);
    }

    .select-label {
        display: flex;
        align-items: center;
        color: var(-grey-100);
        gap: 6px;
    }

    .select-label.placeholder {
        color: var(--grey-400);
    }

    .select:disabled {
        user-select: none;
        cursor: not-allowed;
        opacity: 0.5;
    }

    .select.error {
        border: 1px solid var(--error-400);
    }

    .select.error:active {
        box-shadow: 0 0 10px 0 hsla(0, 50%, 50%, 0.2);
    }

    .error-container {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        margin-top: 6px;
        user-select: text;
        cursor: auto;
    }

    .error-container span {
        font-size: var(--fs-sm);
        line-height: var(--fs-sm-lh);
        color: var(--error-400);
        white-space: break-spaces;
    }

    /* Menu */

    .select-menu {
        z-index: 2;
        display: none;
        position: absolute;
        border-radius: var(--border-radius);
        left: 0;
    }

    .select-menu.open {
        display: block;
        /* box-shadow: var(--grey-active-shadow); */
    }

    .select-menu-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: var(--fs);
        line-height: var(--fs);
        background-color: var(--grey-900);
        color: var(--grey-100);
        width: 100%;
        gap: 4px;
    }

    .select-S .select-menu {
        top: calc(100% + 4px);
    }

    .select-M .select-menu {
        top: calc(100% + 6px);
    }

    .select-L .select-menu {
        top: calc(100% + 8px);
    }

    .select-S .select-menu-item {
        font-size: var(--fs-sm);
        line-height: var(--fs-sm-lh);
        height: var(--input-height, 34px);
        padding: 0 8px;
    }

    .select-M .select-menu-item {
        height: var(--input-height, 41px);
        padding: 0 12px;
    }

    .select-L .select-menu-item {
        height: var(--input-height, 45px);
        padding: 0 18px;
    }

    .select-menu-item.clear {
        color: var(--grey-400);
    }

    .select-menu-item:hover {
        background-color: var(--grey-700);
    }

    .select-menu-item.active,
    .select-menu-item.active:hover {
        color: var(--primary-400);
    }

    .select-menu li:first-child,
    .select-menu li:first-child .select-menu-item {
        border-radius: var(--border-radius) var(--border-radius) 0 0;
    }
    .select-menu li:last-child,
    .select-menu li:last-child .select-menu-item {
        border-radius: 0 0 var(--border-radius) var(--border-radius);
    }

    .select-menu li:not(:last-child) .select-menu-item:not(.select-menu-item:focus) {
        border-bottom: 1px solid var(--grey-700);
    }

    .select-menu-item:focus {
        outline: none;
        border: 1px solid var(--primary-400);
        box-shadow: 0 0 10px 0 hsla(209, 95%, 50%, 0.2);
    }

    /* Spinner */
    .spinner-container {
        position: absolute;
        transform: translate(-50%, -50%);
        left: 50%;
        top: 50%;
    }
</style>
