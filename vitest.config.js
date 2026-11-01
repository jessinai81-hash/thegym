import { defineConfig } from 'vitest/config'

// Backend + logic tests. Browser tests live in tests/e2e and run with Playwright.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.js', 'tests/api/**/*.test.js'],
    setupFiles: ['tests/setup/env.js'],
    globalSetup: ['tests/setup/global.js'],
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
})
