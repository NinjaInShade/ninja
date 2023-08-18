<script lang="ts" context="module">
    import type { ComponentType } from 'svelte';
    type Component = [ComponentType, Record<string, any>];
    export type Column<Row> = {
        key: string;
        label?: string;
        width?: string;
        minWidth?: string;
        maxWidth?: string;
        // FIX... typescript will complain if string isn't here (as const doesn't help :p)
        align?: 'left' | 'center' | 'right' | string;
        /** Tooltip */
        title?: ((row: Row) => string) | string;
        /**
         * This can be used to override the value that is used for any sort of sorting/filtering
         * */
        value?: ((row: Row) => any) | any;
        /** Used to override the value that is rendered in a cell */
        render?: ((row: Row) => any) | any;
        /** Renders a component */
        component?: ((row: Row) => Component) | Component;
    };
</script>

<script lang="ts">
    import NW from './';

    type RowData = Record<string, any>;
    type Row = $$Generic<RowData>;

    /** Columns to display */
    export let columns: Column<Row>[];
    /** Data to be displaying, conforming to the columns */
    export let data: Row[];
    /** Sets the default column key to sort by (default is first column) */
    export let defaultSortKey: string | undefined = undefined;
    /** Sets the default sorting direction */
    export let defaultSortDir: 'asc' | 'desc' = 'desc';
    /** The selected rows (must use the rows 'id' field) */
    export let selectedKeys: number[] | undefined = undefined;
    /** Defines whether the table is selectable */
    export let selectable: boolean = false;
    /** Defines whether the table is sortable */
    export let sortable: boolean = true;
    /** Function that fires of upon selection of a row */
    export let onSelect: ((row: Row, e: MouseEvent) => Promise<void> | void) | undefined = undefined;

    const minColWidth = 75;
    const yPadding = 12;
    const xPadding = 12;

    let sortKey = defaultSortKey || columns[0].key;
    let sortDir = defaultSortDir;

    // the final, processed data that is displayed in the table
    let tableData: Row[];
    $: {
        const originalData = [...data];
        if (!sortKey || !sortable) {
            tableData = originalData;
        } else {
            tableData = sortData(originalData, sortKey, sortDir);
        }
    }

    /**
     * Sort table data by the field provided
     * TODO: use getRawValue() here
     */
    function sortData(data: Row[], field: string, order: 'asc' | 'desc' = 'asc') {
        const sortedData = [...data];

        // Use this and if true convert value's into dates and compare times?
        // const isParsableDate = (value: Row[keyof Row]) => {
        //     return !isNaN(Date.parse(value));
        // }

        sortedData.sort((a: Row, b: Row) => {
            const valueA = getRawValue(
                a,
                columns.find((col) => col.key === field)
            );
            const valueB = getRawValue(
                b,
                columns.find((col) => col.key === field)
            );

            if (typeof valueA === 'string') {
                return valueA.localeCompare(valueB);
            } else if (typeof valueA === 'number' || typeof valueA === 'bigint' || typeof valueA === 'boolean') {
                return valueA - valueB;
            } else if (valueA instanceof Date) {
                return +valueA - +valueB;
            }
        });

        if (order === 'desc') {
            sortedData.reverse();
        }

        return sortedData;
    }

    const setSort = (key: string) => {
        if (!sortable) {
            return;
        }

        if (sortKey !== key) {
            sortKey = key;
            sortDir = 'desc';
            return;
        }

        if (sortDir === 'desc') {
            sortDir = 'asc';
        } else if (sortDir === 'asc') {
            sortKey = null;
        } else {
            sortDir = 'desc';
        }
    };

    const getRawValue = (row: Row, col: Column<Row>) => {
        let value;

        if (typeof col.value === 'function') {
            value = col.value(row);
        } else if (col.value) {
            value = col.value;
        } else {
            value = row[col.key];
        }

        return value;
    };

    const getRenderedValue = (row: Row, col: Column<Row>) => {
        let value;
        //
        if (typeof col.render === 'function') {
            value = col.render(row);
        } else if (col.render) {
            value = col.render;
        } else {
            value = getRawValue(row, col);
        }

        return value ?? '-';
    };

    const getTitle = (row: Row, col: Column<Row>) => {
        if (typeof col.title === 'function') {
            return col.title(row);
        } else if (col.title) {
            return col.title;
        } else {
            return getRawValue(row, col);
        }
    };

    const handleSelect = async (row: Row, e: MouseEvent) => {
        if (!selectable) {
            return;
        }
        let selectedRow: any | null = row;
        if (selectedKeys) {
            if (e.ctrlKey && selectedKeys.includes(row.id)) {
                selectedRow = null;
                selectedKeys = [];
            } else {
                selectedKeys = [row.id];
            }
        }
        if (onSelect) {
            await onSelect(selectedRow, e);
        }
    };

    const getCellStyle = (col: Column<Row>) => {
        const styles: string[] = ['display: flex', 'align-items: center', 'justify-content: flex-start'];

        // Alignment
        if (col.align === 'center') {
            styles.push('justify-content: center');
        } else if (col.align === 'right') {
            styles.push('justify-content: flex-end');
        }

        // Width
        styles.push(`min-width: ${col.minWidth ?? col.width ?? `${minColWidth}px`}`);
        if (col.width) {
            styles.push(`max-width: ${col.width}`);
        }
        if (col.maxWidth) {
            styles.push(`max-width: ${col.maxWidth}`);
        }

        return styles.join('; ');
    };
</script>

<div class="table-container" style="--yPadding: {yPadding}px; --xPadding: {xPadding}px;">
    <table class="table" class:selectable>
        <thead>
            <tr>
                {#each columns as col}
                    {@const style = getCellStyle(col)}
                    <th {style} class="th-cell">
                        <button style="cursor: {sortable ? 'pointer' : 'unset'}" on:click={() => setSort(col.key)}>
                            {col.label ?? col.key}
                            {#if sortable && sortKey && sortKey === col.key}
                                <NW.Icon name="arrow-up-wide-short" class="table-header-sort-icon" style={sortDir === 'asc' ? 'transform: rotateX(180deg)' : ''} --size="14px" --color="var(--grey-500)" />
                            {/if}
                        </button>
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each tableData as row}
                <tr class:selected={selectedKeys && selectedKeys.includes(row.id)} on:click={async (e) => await handleSelect(row, e)}>
                    {#each columns as col}
                        {@const title = getTitle(row, col)}
                        {@const style = getCellStyle(col)}
                        {#if col.component}
                            {@const c = typeof col.component === 'function' ? col.component(row) : col.component}
                            <td {style} {title} class="cell">
                                <svelte:component this={c[0]} {...c[1]} />
                            </td>
                        {:else}
                            <td {style} {title} class="cell">
                                {getRenderedValue(row, col)}
                            </td>
                        {/if}
                    {/each}
                </tr>
            {:else}
                <tr class="no-data">
                    <td class="no-data-text"> No data available... </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .table-container {
        position: relative;
        background-color: var(--grey-1000);
        border-radius: var(--border-radius);
        border: 1px solid var(--grey-700);
        overflow-x: auto;
        flex: 1 0 0px;
        width: 100%;
    }

    .table {
        display: flex;
        flex-flow: column nowrap;
        border-spacing: 0;
        min-width: 100%;
        height: 100%;
    }

    thead,
    tbody {
        display: contents;
    }

    thead tr {
        position: sticky;
        z-index: 1;
        top: 0;
    }

    tr {
        display: flex;
    }

    th {
        background-color: var(--grey-900);
        border-bottom: 1px solid var(--grey-700);
        height: 45px;
    }

    td {
        background-color: var(--grey-1000);
        font-size: var(--fs);
        line-height: var(--fs-lh);
        color: var(--grey-300);
    }

    th,
    td {
        transition: all 0.1s ease-in-out;
        padding: var(--yPadding) var(--xPadding);
        overflow-x: hidden;
        flex: 1 0 0px;
    }

    th:not(:last-child),
    td:not(:last-child) {
        border-right: 1px solid var(--grey-700);
    }

    /*
    * Cell is the actual user data that is rendered, not any other custom element like the no-data section
    */
    .cell {
        white-space: nowrap;
        height: 65px;
        /* TODO: looks like 2px border if stuff lines up perfectly, ok or not (?) */
        border-bottom: 1px solid var(--grey-700);
    }

    .table.selectable .cell {
        cursor: pointer;
    }

    .table.selectable tr:hover .cell,
    tr.selected .cell {
        background-color: var(--grey-900);
    }

    .th-cell button {
        display: inline-flex;
        justify-content: flex-start;
        align-items: center;
        font-size: var(--fs);
        line-height: var(--fs);
        color: var(--white);
        font-weight: 600;
        padding: 2px;
        gap: 6px;
    }

    .th-cell button:focus-visible {
        outline: var(--focus-outline);
    }

    /* No data */
    .no-data {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1 0 0px;
        padding: 0.25em;
    }

    .no-data-text {
        text-align: center;
        color: var(--grey-500);
    }
</style>
