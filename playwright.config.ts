import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 2,
  },
  expect: {
    // threshold filters anti-aliasing noise per pixel; the pixel budget still catches real geometry/color changes.
    toHaveScreenshot: { maxDiffPixels: 400, threshold: 0.35, animations: 'disabled' },
  },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env['CI'],
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})
