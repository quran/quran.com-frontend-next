import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';

if (!process.env.CI) {
  dotenv.config({ path: '.env' });
}

const baseURL =
  process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${process.env.PORT || '3000'}`;
const hostHeader = process.env.PLAYWRIGHT_TEST_HOST_HEADER;
const ignoreHTTPSErrors = Boolean(process.env.PLAYWRIGHT_TEST_IGNORE_HTTPS_ERRORS || hostHeader);
const headlessMode = process.env.PLAYWRIGHT_HEADLESS_MODE;
const launchArgs = headlessMode === 'new' ? ['--headless=new'] : [];
const ignoreDefaultArgs =
  headlessMode === 'new' ? ['--headless=old', '--headless'] : undefined;

const isLocalhost = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');
const skipWebServer = process.env.PW_SKIP_WEBSERVER === '1' || process.env.PW_SKIP_WEBSERVER === 'true';
const hasAuthCreds = Boolean(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests/integration',
  fullyParallel: true,
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 30 * 1000,
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
    baseURL:
      process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${process.env.PORT || '3000'}`,
    ignoreHTTPSErrors,
    extraHTTPHeaders: hostHeader ? { host: hostHeader } : undefined,
    launchOptions:
      launchArgs.length > 0 || ignoreDefaultArgs
        ? {
            args: launchArgs,
            ignoreDefaultArgs,
          }
        : undefined,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Configure projects for major browsers */
  projects: [
    ...(hasAuthCreds
      ? [
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
        ]
      : []),
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

  webServer: isLocalhost && !skipWebServer
    ? {
        command: process.env.CI ? 'yarn start' : 'yarn dev',
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
        reuseExistingServer: !process.env.CI,
        env: {
          NODE_ENV: 'development',
          PORT: process.env.PORT || '3000',
          MSW_ENABLED: 'true', // Enable MSW for tests
          NEXT_PUBLIC_APP_ENV: 'test', // Set environment to staging to match cookie names
        },
      }
    : undefined,
};

export default defineConfig(config);
