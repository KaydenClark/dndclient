import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    esbuild: {
        jsx: 'automatic',
        loader: 'jsx',
        include: /src\/.*\.js$/,
        exclude: []
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx'
            }
        }
    },
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
