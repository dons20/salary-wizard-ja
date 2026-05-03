import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'Salary Wizard Jamaica',
        short_name: 'Salary Wizard',
        description: 'Jamaican salary conversion and self-employed tax estimates.',
        theme_color: '#0f5d46',
        background_color: '#f4efe5',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: 'icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
        navigateFallback: '/index.html',
        skipWaiting: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/test/unit/**/*.test.ts'],
  },
})
