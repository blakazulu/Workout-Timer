import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration for CYCLE Workout Timer
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directory where tests are located
  testDir: './tests',

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    // Add GitHub Actions reporter when running in CI
    process.env.CI ? ['github'] : ['list']
  ].filter(Boolean),

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:4200',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Viewport size
    viewport: { width: 1280, height: 720 },
  },

  // Configure projects for major browsers and devices
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Test against mobile viewports (using Chromium for WSL compatibility)
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13 Pro'],
        // Use Chromium engine for WSL compatibility (WebKit requires system deps)
        browserName: 'chromium',
      },
    },

    {
      name: 'mobile-landscape',
      use: {
        ...devices['iPhone 13 Pro'],
        viewport: { width: 844, height: 390 },
        // Use Chromium engine for WSL compatibility
        browserName: 'chromium',
      },
    },

    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
        // Use Chromium engine for WSL compatibility
        browserName: 'chromium',
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 3 minutes for slow starts
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
