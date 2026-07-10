import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  server: {
    host: true,
    allowedHosts: [
      'vella-3.onrender.com',
    ],
    hmr: true,
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});