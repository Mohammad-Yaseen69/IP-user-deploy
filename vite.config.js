import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { sentryVitePlugin } from '@sentry/vite-plugin'


export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    }),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,  // eslint-disable-line no-undef
      project: process.env.SENTRY_PROJECT,  // eslint-disable-line no-undef
      authToken: process.env.SENTRY_AUTH_TOKEN,  // eslint-disable-line no-undef
      release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,  // eslint-disable-line no-undef
      include: "./dist",
      urlPrefix: "~/",
      setCommits: { auto: true },
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
    port: 5173,
    proxy: {
      // Assistant API. Proxying makes it same-origin, so there is no CORS and
      // no preflight at all — mirror this with a reverse proxy in production
      // and the browser never makes a cross-origin request.
      '/api/assistant': {
        target: process.env.BOT_API_URL || 'http://localhost:3000',  // eslint-disable-line no-undef
        changeOrigin: true,
        // Replies stream; buffering here would defeat that.
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['x-accel-buffering'] = 'no'
          })
        }
      },
      'https://fontawesomev23.com/': {
        target: 'https://fontawesomev23.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    hmr: {
      overlay: true,
      log: true
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  //    allowedHosts: [
  //   'procontinuation-harmonious-hayes.ngrok-free.dev'
  // ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          mui: ['@mui/material', '@mui/x-date-pickers'],
          charts: ['apexcharts', 'react-apexcharts'],
          pdf: ['jspdf', 'jspdf-autotable'],
          excel: ['xlsx'],
        }
      }
    },
    sourcemap: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.js',
        'dist/',
        'public/'
      ]
    }
  },
})
