import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, fs: { allow: ['../..'] } },
  build: { target: 'es2022', sourcemap: true, chunkSizeWarningLimit: 700 },
});
