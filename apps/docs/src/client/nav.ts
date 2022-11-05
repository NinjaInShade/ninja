// Nav API
import type { SvelteComponent } from 'svelte';

type Routes = Record<string, string>;
type NewViewCB = (newView: SvelteComponent, newViewProps: Record<string, unknown>) => void;

const { history } = window;
let cachedRoutes: Routes;
let cachedViewCB: NewViewCB;
let currentView: string;

/**
 * Initializes the router and returns the imported view
 *
 * @param routes: The routes your app requires. Example use below:
 *
 * @example
 * ```js
 *  <script>
 *    export let routes;
 *    let view;
 *    let viewProps;
 *    onMount(async () => {
 *       [view, viewProps] = await router(routes, (newView, newViewProps) => {
 *         view = newView;
 *         viewProps = newViewProps;
 *       });
 *    })
 *  </script>
 *
 *  {#await view then}
 *    <svelte:component this={view} props={{ ...viewProps }}/>
 *  {/await}
 * ```
 */
const router = async (routes: Routes, newViewCB: NewViewCB): Promise<[SvelteComponent, Record<string, unknown>]> => {
  cachedRoutes = routes;
  cachedViewCB = newViewCB;

  const props = history.state;
  const view = matchRoute(cachedRoutes);
  return [await loadView(view), props];
};

/**
 * Matches current URL to a route
 *
 * @returns: view string or null if not found
 */
const matchRoute = (routes: Routes): string | null => {
  const currentURL = window.location.pathname;

  // find view for route
  for (const [route, view] of Object.entries(routes)) {
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
 * Loads a view
 *
 * @returns: The imported view
 */
const loadView = async (view: string): Promise<SvelteComponent> => {
  let processedView = view;

  const _determineView = (viewToDetermine) => {
    // no route was found, use wildcard or first route
    if (!view) {
      return cachedRoutes['*'] || Object.entries(cachedRoutes)[0][1];
    } else {
      return viewToDetermine;
    }
  };

  processedView = _determineView(view);

  try {
    const loadedView = await import(`~/Views/${processedView}/client.svelte`);
    currentView !== processedView ? console.warn(`[load view]: view '${processedView}' successfully loaded.`) : '';
    currentView = processedView;
    return loadedView.default;
  } catch (err) {
    throw new Error(`[load view]: view '${processedView}' could not be imported. Ensure it exists.`);
  }
};

/**
 * Identical to clicking browser back button
 *
 * @param steps: number of steps back to go (e.g. 2 would be like clicking browser back button twice);
 */
const back = async (steps: number = 1): Promise<void> => {
  history.go(-steps);
  await alertCB();
};

/**
 * Goes to the specified route
 *
 * @param route: route to navigate to
 * @param props: any props that need to be passed to the view for that route
 */
const go = async (route: string, props: Record<string, unknown> = null): Promise<void> => {
  if (route[0] !== '/') {
    throw new Error(`[navigate]: route should always start with '/'.`);
  } else if (route.length > 1 && route[route.length - 1] === '/') {
    throw new Error(`[navigate]: route should not end with a trailing '/'`);
  }

  if (route === window.location.pathname) return;
  history.pushState(props, '', `${route}`);
  await alertCB();
};

const alertCB = async () => {
  const props = history.state;
  const view = matchRoute(cachedRoutes);
  cachedViewCB(await loadView(view), props || null);
};

window.onpopstate = async (e: PopStateEvent): Promise<void> => {
  e.preventDefault();
  await alertCB();
};

export default { router, back, go };
