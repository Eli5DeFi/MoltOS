import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Web-only Vite config for Vercel deployment (no Electron plugins)
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@/core': resolve(__dirname, 'src/core'),
            '@/ui': resolve(__dirname, 'src/ui'),
            '@/apps': resolve(__dirname, 'src/apps'),
            '@/frameworks': resolve(__dirname, 'src/frameworks'),
            '@/types': resolve(__dirname, 'src/types'),
            '@/utils': resolve(__dirname, 'src/utils'),
            '@/assets': resolve(__dirname, 'assets')
        }
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true
    },
    server: {
        host: 'localhost',
        port: 3000
    },
    css: {
        postcss: './postcss.config.js'
    }
})
