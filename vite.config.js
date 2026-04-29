import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
    }),
    {
      name: 'i18n-missing-keys',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'POST' && req.url === '/save-missing-key') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const { key } = JSON.parse(body);
                if (!key) {
                  res.statusCode = 400;
                  res.end('Missing key');
                  return;
                }
                const filePath = path.resolve(__dirname, 'src/missingKeys.json');
                let missingKeys = [];
                if (fs.existsSync(filePath)) {
                  const content = fs.readFileSync(filePath, 'utf-8');
                  missingKeys = JSON.parse(content || '[]');
                }
                if (!missingKeys.includes(key)) {
                  missingKeys.push(key);
                  fs.writeFileSync(filePath, JSON.stringify(missingKeys, null, 2));
                  console.log(`Added missing key: ${key}`);
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ status: 'ok' }));
              } catch (err) {
                console.error('Error saving missing key:', err);
                res.statusCode = 500;
                res.end('Error');
              }
            });
          } else {
            next();
          }
        });
      }
    }
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