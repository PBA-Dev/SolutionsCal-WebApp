import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: true, // Enable sourcemaps for debugging
    rollupOptions: {
      output: {
        manualChunks: undefined // Disable code splitting for simpler debugging
      }
    }
  },
  define: {
    'import.meta.env.ADMIN_PASSWORD': JSON.stringify(process.env.ADMIN_PASSWORD),
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.ADMIN_PASSWORD': JSON.stringify(process.env.ADMIN_PASSWORD)
  }
}) as UserConfig
