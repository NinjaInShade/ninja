// Nav API
import type { ViewPath, NewViewCallback, ViewProps, Routes, Resolve, Options } from './AppRoot.svelte';
import { modals } from './AppRoot.svelte';
import type { SvelteComponent } from 'svelte';
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
const matchRoute = (routes: Routes): ViewPath => {
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
    history.pushState(props, '', `${route}`);
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

// TODO: make openModal work with viewPaths
// modal component will be used per modal, instead of `<AppRoot />`

// const openModal = (viewPath: string, props: ViewProps) => {
//   if (!viewPath) {
//     throw new Error(`You must provide a view path e.g. 'admin/editUser'`);
//   }

//   if (viewPath.startsWith('/')) {
//     throw new Error(`View path must not start with '/'`);
//   }
// };

export const closeModal = (amount = 1, returnVal: any = null) => {
    const m = get(modals);

    for (let i = 0; i < amount; i++) {
        const opts = m[m.length - 1][3];

        if (opts.asPromise) {
            const [resolve, reject] = m[m.length - 1][2];

            if (!Boolean(returnVal)) {
                reject?.(returnVal);
            } else {
                resolve?.(returnVal);
            }
        }

        modals.update((m) => m.slice(0, -1));
    }
};
create;

/**
 * Opens a modal with the wanted props and modal options. The component you open will receive a close function you can.
 */
export const openModal = (modal: typeof SvelteComponent, props?: Options, options?: Options): void | Promise<any> => {
    const defaultOptions: Options = {
        asPromise: false,
    };

    const opts = Object.assign({}, defaultOptions, options || {});

    if (!opts.asPromise) {
        modals.update((m) => [...m, [modal, { ...props, close: (returnVal: any) => closeModal(1, returnVal) }, [], opts]]);
        return;
    } else {
        return new Promise((resolve, reject) => {
            modals.update((m) => [...m, [modal, { ...props, close: (returnVal: any) => closeModal(1, returnVal) }, [resolve, reject], opts]]);
        });
    }
};

export default { create, back, go, closeModal, openModal };
