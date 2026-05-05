import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { cloudflare } from "@cloudflare/vite-plugin";
import { analyzer } from "vite-bundle-analyzer";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const isVitest = mode === "test";
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      Boolean(env.VITE_ANALYZE_BUNDLE) && analyzer(),
      !isVitest && cloudflare(),
      tailwindcss(),
      VitePWA({
        manifestFilename: "site.webmanifest",
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "favicon.svg",
          "favicon-96x96.png",
          "apple-touch-icon.png",
          "web-app-manifest-192x192.png",
          "web-app-manifest-512x512.png",
          "app-screenshot-mobile.png",
          "app-screenshot-wide.png",
          "logo-full.webp",
          "logo-transparent.png",
          "social-preview.webp",
        ],
        manifest: {
          name: "Salary Wizard Jamaica",
          short_name: "Salary Wizard",
          description: "Income and tax calculator for Jamaicans",
          theme_color: "#0f5d46",
          background_color: "#f4efe5",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "web-app-manifest-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "web-app-manifest-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "web-app-manifest-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          screenshots: [
            {
              src: "app-screenshot-mobile.png",
              sizes: "390x844",
              type: "image/png",
              label: "Salary input and tax summary on mobile",
            },
            {
              src: "app-screenshot-wide.png",
              sizes: "1920x1080",
              type: "image/png",
              label: "Salary input and tax summary on desktop",
              form_factor: "wide",
            },
          ],
        },
        workbox: {
          clientsClaim: true,
          globPatterns: ["**/*.{js,css,html,svg,png,webp,ico,txt,webmanifest}"],
          navigateFallback: "/index.html",
          skipWaiting: true,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ].filter(Boolean),
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes("react-dom") ||
              id.includes("react/") ||
              id.includes("react\\") ||
              id === "react"
            ) {
              return "01-react-core"; // Use numeric prefix to ensure proper ordering
            }

            if (id.includes("zustand/") || id.includes("zod")) {
              return "02-validation-and-state";
            }

            // Leave everything else in the main bundle
            return undefined;
          },
        },
      },
    },
    test: {
      environment: "node",
      include: ["src/test/unit/**/*.test.ts"],
    },
  };
});
