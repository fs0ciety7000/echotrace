import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // The game is fully client-side: precache everything so it plays offline once installed.
      registerType: 'autoUpdate',
      injectRegister: 'script', // external registerSW.js, compatible with our strict CSP
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Echo Trace',
        short_name: 'Echo Trace',
        description: "Simulation d'enquête cyber pédagogique. Tout laisse un écho.",
        lang: 'fr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'landscape',
        background_color: '#05070a',
        theme_color: '#05070a',
        categories: ['education', 'games'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/healthz/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: { port: 5173, fs: { allow: ['../..'] } },
  build: { target: 'es2022', sourcemap: true, chunkSizeWarningLimit: 700 },
});
