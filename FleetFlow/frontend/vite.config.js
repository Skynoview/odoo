import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            // Use @/ as a shorthand for src/
            '@': path.resolve(__dirname, './src'),
        },
    },

    server: {
        port: 5173,
        strictPort: true,
        // Proxy all /api requests to the Express backend during development
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },

    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
