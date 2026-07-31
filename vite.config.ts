import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Base path para GitHub Pages
  base: '/finance-app/',

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Finance App',
        short_name: 'Finance',
        description: 'Controle de gastos pessoais',
        theme_color: '#667eea',
        background_color: '#f0f2f5',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/finance-app/',
        start_url: '/finance-app/',
        icons: [
          {
            src: 'icons/icon-1254x1254.png',
            sizes: '1254x1254',
            type: 'image/png',
          },
          {
            src: 'icons/icon-1254x1254.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-1254x1254.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-1254x1254.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: 'icons/icon-1254x1254.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache de assets estáticos
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Estratégia: network first para dados, cache first para assets
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],

  build: {
    // Otimizações para produção
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
          if (id.includes('node_modules/xlsx') || id.includes('node_modules/jspdf')) {
            return 'export';
          }
        },
      },
    },
  },
});
