import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

const cwd = process.cwd();

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte()],
    root: cwd,
    publicDir: './src/static',
    resolve: {
        alias: {
            '~': path.resolve(cwd, './src'),
        },
    },
    build: {
        target: 'esnext', //browsers can handle the latest ES features
        outDir: path.resolve(cwd, './dist/vite'),
        rollupOptions: {
            input: {
                main: path.resolve(cwd, './index.html'),
            },
        },
        dynamicImportVarsOptions: {
            // by default vite doesn't look in node modules
            // but ninjalib/svelte requires it too look there
            exclude: [/node_modules\/(?!@ninjalib\/)/],
        },
    },
});
