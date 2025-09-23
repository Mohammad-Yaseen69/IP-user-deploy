import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'


export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true, // build bana na ke baad browser me graph khol dega
      gzipSize: true,
      brotliSize: true
    })
  ],
  css: {
    preprocessorOptions: {
      scss: { quietDeps: true },
    },
  },
  assetsInclude: ['**/*.lottie'],
  optimizeDeps: {
    include: ['crypto-js'],
  },
  resolve: {
    alias: { '~': '/src' },
  },
  preview: {
    port: 3000
  },
  server: {
    port: 5173, // tu jo chahe port
    proxy: {
      '/api': {
        target: 'https://fontawesomev23.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
