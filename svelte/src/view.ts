import type { SvelteComponent } from 'svelte';

export type View = [typeof SvelteComponent, ViewProps];
export type ViewProps = Record<string, unknown> | null;

let currentViewPath: string;

/**
 * Loads a view
 **/
export const loadView = async (viewPath: string, viewProps: ViewProps): Promise<View> => {
    if (viewPath?.startsWith('/')) {
        throw new Error(`[view] invalid view ${viewPath} views cannot start with '/'`);
    }

    const expandedViewPath = `/src/views/${viewPath}/client.svelte`;

    const possibleViews = import.meta.glob('/src/views/**/client.svelte');
    const view = possibleViews[expandedViewPath];

    if (!view) {
        console.error(`[load view]: view '${expandedViewPath}' does not exist.`);
        throw new Error(`[load view]: view '${expandedViewPath}' does not exist.`);
    }

    if (currentViewPath !== viewPath) {
        console.log(`[load view]: view '${viewPath}' successfully loaded.`);
    }
    currentViewPath = viewPath;

    try {
        const loadedView = await view();
        return [loadedView.default, viewProps];
    } catch (err) {
        const couldNotImportMsg = 'Failed to fetch dynamically imported module: ';

        if (err.message?.startsWith(couldNotImportMsg)) {
            const importPath = err.message.substring(couldNotImportMsg.length);
            console.error(`[load view]: view '${expandedViewPath}' could not be imported. Ensure it exists. From: ${importPath}`);
            throw new Error(`[load view]: view '${expandedViewPath}' could not be imported. Ensure it exists. From: ${importPath}`);
        }

        console.error(`[load view]: view '${expandedViewPath}' could not be imported. Ensure it's valid: '${err.message}'`);
        throw new Error(`[load view]: view '${expandedViewPath}' could not be imported. Ensure it's valid`);
    }
};
