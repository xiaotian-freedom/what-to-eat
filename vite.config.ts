import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            urlPattern: /\.(png|jpe?g|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      includeAssets: ['icon.svg'],
      manifest: {
        name: '今天吃什么',
        short_name: '吃什么',
        description: '帮你决定今天吃什么的美食选择应用',
        theme_color: '#818CF8',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        categories: ['food', 'lifestyle', 'utilities'],
        lang: 'zh-CN',
        dir: 'ltr',
      },
    }),
  ],
  server: {
    port: 3000,
    open: false,
    host: '0.0.0.0', // 配置项目可以局域网访问
    cors: true, // 默认启用并允许任何源
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
