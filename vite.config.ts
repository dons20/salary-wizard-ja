import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    cloudflare(),
    tailwindcss(),
    VitePWA({
      manifestFilename: 'site.webmanifest',
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png',
      ],
      manifest: {
        name: 'Salary Wizard Jamaica',
        short_name: 'Salary Wizard',
        description: 'Income and tax calculator for Jamaicans',
        theme_color: '#0f5d46',
        background_color: '#f4efe5',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
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
        enabled: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/test/unit/**/*.test.ts'],
  },
})
