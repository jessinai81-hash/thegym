import { defineConfig, devices } from '@playwright/test'

// Browser tests run against their own copy of the app on separate ports,
// so they never collide with an `npm run dev` you already have open.
const PORT = 5174
const API_PORT = 3102

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  globalSetup: './tests/e2e/global-setup.js',
  globalTeardown: './tests/e2e/global-teardown.js',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'iphone-13', use: { ...devices['iPhone 13'], browserName: 'chromium', channel: 'chrome' } },
  ],
  webServer: {
    command: 'node server/dev.js',
    url: `http://localhost:${PORT}`,
    env: { PORT: String(PORT), API_PORT: String(API_PORT) },
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
