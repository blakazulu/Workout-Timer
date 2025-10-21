import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read package.json for version injection
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  server: {
    port: 4200,
    strictPort: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html')
      }
    }
  },
  plugins: [
    tailwindcss(),
    ViteEjsPlugin({
      title: 'CYCLE',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // CRITICAL FOR iOS: Ensure service worker clears old caches on update
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff,woff2}']
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: ['robots.txt', 'bg.webp', 'icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'CYCLE',
        short_name: 'CYCLE',
        description: 'Professional workout timer with repetition tracking and music',
        theme_color: '#ff5722',
        background_color: '#121212',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        // Use versioned cache names to force cache updates on iOS
        cacheId: `cycle-v${packageJson.version}`,

        // Clean up old caches on activation (CRITICAL FOR iOS)
        cleanupOutdatedCaches: true,

        // Skip waiting to activate new service worker immediately
        clientsClaim: true,
        skipWaiting: true,

        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.youtube\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Phosphor Icons CDN fonts (Layer 2 fallback)
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/@phosphor-icons\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'phosphor-icons-cdn',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year (fonts don't change)
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache other CDN resources (Google Fonts, etc.)
            urlPattern: /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
