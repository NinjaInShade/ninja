import { type IntroLinks, type DocLinks } from '~/components/Sidebar.svelte';
import GettingStarted from './sections/GettingStarted.svelte';
import LearnTheBasics from './sections/LearnTheBasics.svelte';
import CoreNavApi from './sections/core/NavApi.svelte';

export const INTRO_LINKS: IntroLinks = {
    'Getting started': {
        icon: 'mug-hot',
        iconStyle: 'position: relative; left: 1.5px',
        component: GettingStarted,
    },
    'Learn the basics': {
        icon: 'home',
        component: LearnTheBasics,
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
