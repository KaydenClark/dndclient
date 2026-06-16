import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: { host: true }, // expose to local network so phones can connect
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
        globals: true,
        setupFiles: './src/setupTests.js'
    }
});
