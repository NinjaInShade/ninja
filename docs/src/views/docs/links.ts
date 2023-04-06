import { type IntroLinks, type DocLinks } from '~/components/Sidebar.svelte';
import Introduction from './sections/Introduction.svelte';
import Installation from './sections/Installation.svelte';
import Conventions from './sections/Conventions.svelte';
import CoreNavApi from './sections/core/NavApi.svelte';

export const INTRO_LINKS: IntroLinks = {
    Introduction: {
        icon: 'play',
        iconStyle: 'position: relative; left: 1.5px',
        component: Introduction,
    },
    Installation: {
        icon: 'gear',
        component: Installation,
    },
    Conventions: {
        icon: 'globe',
        component: Conventions,
    },
};

export const DOC_LINKS: DocLinks = {
    theming: {
        'Nav API': CoreNavApi,
    },
    styles: {
        'Nav API': CoreNavApi,
    },
    // KEEP
    core: {
        'Nav API': CoreNavApi,
        Observables: CoreNavApi,
        Client: CoreNavApi,
        Server: CoreNavApi,
        Utilities: CoreNavApi,
        Tests: CoreNavApi,
    },
    // KEEP
    build: {
        'Nav API': CoreNavApi,
    },
    widgets: {
        'Nav API': CoreNavApi,
    },
    util: {
        'Nav API': CoreNavApi,
    },
    sql: {
        'Nav API': CoreNavApi,
    },
};
