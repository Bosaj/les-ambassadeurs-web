import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/.netlify/functions': 'http://localhost:8888'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  build: {
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — changes rarely, long cache lifetime
          if (id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // React Router
          if (id.includes('node_modules/react-router') ||
            id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }
          // Supabase SDK
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
          // Stripe
          if (id.includes('node_modules/@stripe/') ||
            id.includes('node_modules/stripe')) {
            return 'vendor-stripe';
          }
          // PayPal
          if (id.includes('node_modules/@paypal/')) {
            return 'vendor-paypal';
          }
          // Leaflet map — large, cached separately
          if (id.includes('node_modules/leaflet') ||
            id.includes('node_modules/react-leaflet') ||
            id.includes('node_modules/@react-leaflet/')) {
            return 'vendor-map';
          }
          // React Icons — split by icon family for granular caching
          if (id.includes('node_modules/react-icons/fa')) return 'icons-fa';
          if (id.includes('node_modules/react-icons/md')) return 'icons-md';
          if (id.includes('node_modules/react-icons/bi')) return 'icons-bi';
          if (id.includes('node_modules/react-icons/io')) return 'icons-io';
          if (id.includes('node_modules/react-icons/hi')) return 'icons-hi';
          if (id.includes('node_modules/react-icons/ai')) return 'icons-ai';
          if (id.includes('node_modules/react-icons/')) return 'icons-other';
          // Everything else (react-hot-toast, etc.)
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
        }
      }
    }
  }
})

