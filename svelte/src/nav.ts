// Nav API
import type { NewViewCallback, ViewProps, Routes, ModalOptions } from './AppRoot.svelte';
import { loadView } from './view';
import { modals } from './AppRoot.svelte';
import { get } from 'svelte/store';

const { history } = window;
let cachedRoutes: Routes;
let cachedViewCallback: NewViewCallback;

/**
 * Initializes the router
 *
 * @param routes: The routes your app requires
 * @param newViewCallback: Callback that is ran with new view path & view props every time navigation happens
 *
 */
const create = async (routes: Routes, newViewCallback: NewViewCallback): Promise<void> => {
    cachedRoutes = routes;
    cachedViewCallback = newViewCallback;

    alertCallback();
};

/**
 * Matches current URL to a route
 *
 * @returns: view string or null if not found
 */
const matchRoute = (routes: Routes): string | null => {
    const currentURL = window.location.pathname;

    // find view for route
    for (const [route, view] of Object.entries(routes || {})) {
        if (route === '*') {
            continue;
        }

        if (currentURL === route) {
            return view;
        }
    }

    return null;
};

/**
 * Identical to clicking browser back button
 *
 * @param steps: number of steps back to go (e.g. 2 would be like clicking browser back button twice);
 */
const back = (steps: number = 1): void => {
    history.go(-steps);
    alertCallback();
};

/**
 * Goes to the specified route
 *
 * @param route: route to navigate to
 * @param props: any props that need to be passed to the view for that route
 */
const go = (route: string, props: ViewProps = null): void => {
    if (route[0] !== '/') {
        throw new Error(`[navigate]: route should always start with '/'.`);
    } else if (route.length > 1 && route[route.length - 1] === '/') {
        throw new Error(`[navigate]: route should not end with a trailing '/'`);
    }

    if (route === window.location.pathname) return;
    history.pushState(props, '', route);
    alertCallback();
};

const alertCallback = () => {
    const props = history.state;
    const viewPath = matchRoute(cachedRoutes);
    cachedViewCallback(viewPath, props || null);
};

window.onpopstate = (e: PopStateEvent): void => {
    e.preventDefault();
    alertCallback();
};

window.onclick = (e: Event): void => {
    const target = e.target as HTMLElement;

    // ensures we clicked on anchor tag or any parent of the node is an anchor tag
    const anchorTag = isInAnchorTag(target);
    if (anchorTag) {
        const href = anchorTag.getAttribute('href');
        const hrefTarget = anchorTag.getAttribute('target');
        if (!href) return;
        if (!href.startsWith('/')) return;
        if (hrefTarget && hrefTarget === '_blank') return;

        // prevent default behavior and navigate with nav API
        e.preventDefault();
        go(href);
    }
};

const isInAnchorTag = (element: HTMLElement): HTMLElement | null => {
    if (element.tagName === 'A') {
        return element;
    } else if (!element.parentElement) {
        return null;
    }

    return isInAnchorTag(element.parentElement);
};

/**
 * Opens a modal with the wanted props and modal options.
 * Passed a `close` prop that can be used to close the modal with an optional value.
 */
export const openModal = (modal: string, props: ViewProps = {}, options: ModalOptions = {}): void | Promise<any> => {
    const defaultOptions: ModalOptions = {
        asPromise: false,
    };
    const opts = Object.assign({}, defaultOptions, options);

    if (!opts.asPromise) {
        props.close = () => closeModal(1, null);
        const modalDef = {
            view: loadView(modal, props),
            options: opts,
        };

        modals.update((m) => [...m, modalDef]);
        return;
    } else {
        return new Promise((resolve) => {
            props.close = (value: any) => closeModal(1, value);
            const modalDef = {
                view: loadView(modal, props),
                options: opts,
                resolve,
            };
            modals.update((m) => [...m, modalDef]);
        });
    }
};

export const closeModal = (amount = 1, value: any = null) => {
    const m = get(modals);

    for (let i = 0; i < amount; i++) {
        const modal = m.at(-1);
        const opts = modal.options;

        if (opts.asPromise) {
            modal.resolve(value);
        }

        modals.update((m) => m.slice(0, -1));
    }
};

export const setQuery = (key: string, value: string | undefined) => {
    const searchParams = new URLSearchParams(window.location.search);
    if (value === undefined) {
        searchParams.delete(key);
    } else {
        searchParams.set(key, value);
    }
    const newURL = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(history.state, '', newURL);
};

export const getQuery = (key: string): string | undefined => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(key);
};

export default { create, back, go, closeModal, openModal, setQuery, getQuery };
