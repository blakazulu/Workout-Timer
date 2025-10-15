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
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  plugins: [
    tailwindcss(),
    ViteEjsPlugin({
      title: 'CYCLE',
    }),
    VitePWA({
      registerType: 'autoUpdate',
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
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'],
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
          }
        ]
      }
    })
  ]
})
