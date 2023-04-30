import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte()],
    root: '.',
    publicDir: './src/static',
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
        },
    },
    build: {
        target: 'esnext', //browsers can handle the latest ES features
        outDir: './dist/client',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, './index.html'),
            },
        },
        dynamicImportVarsOptions: {
            // by default vite doesn't look in node modules
            // but ninjalib/svelte requires it too look there
            exclude: [/node_modules\/(?!@ninjalib\/)/],
        },
    },
});
