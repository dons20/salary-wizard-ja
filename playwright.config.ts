import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer:{
    command: 'npm run build && npm run preview -- --host localhost --port 4173',
    port: 4173,
    // @ts-expect-error process missing
    reuseExistingServer: !process.env.CI,
  },
})