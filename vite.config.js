import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 8 (Rolldown) defaults to excluding plain .js files from JSX parsing.
// This codebase uses .js everywhere for React components, so we pre-transform
// them with oxc before Rolldown's bundled vite-transform sees the raw JSX.
const jsJsxPlugin = {
    name: 'vite:js-as-jsx',
    enforce: 'pre',
    async transform(code, id) {
        const clean = id.split('?')[0];
        if (!clean.endsWith('.js') || clean.includes('node_modules') || !code.includes('<')) return;
        return transformWithOxc(code, id, {
            lang: 'jsx',
            jsx: { runtime: 'automatic', importSource: 'react' },
        });
    },
};

export default defineConfig({
    plugins: [jsJsxPlugin, react()],
    server: { host: true }, // expose to local network so phones can connect
    test: {
        environment: 'jsdom',
        environmentOptions: {
            jsdom: {
                url: 'http://localhost/'
            }
        },
        globals: true,
        setupFiles: './src/setupTests.js'
    }
});
