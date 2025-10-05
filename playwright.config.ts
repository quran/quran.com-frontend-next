import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: true,
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 15 * 1000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0, // /!\ If you change this, make sure to update the DiscordReporter as well (maxRetries variable)
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html'], ['./tests/reporter/discord-reporter.js']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      testDir: './tests',
    },
    /* Tests that require user authentication */
    {
      name: 'Authentificated Chromium',
      testDir: './tests/integration/loggedin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'Authentificated Mobile Chrome',
      testDir: './tests/integration/loggedin',
      use: {
        ...devices['Pixel 5'],
        storageState: './playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      testIgnore: '**/loggedin/**',
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
      testIgnore: '**/loggedin/**',
    },
  ],

  webServer: {
    command: process.env.CI ? 'yarn start' : 'yarn dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
