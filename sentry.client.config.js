// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENABLED = process.env.NEXT_PUBLIC_CLIENT_SENTRY_ENABLED === 'true';
const isDev = process.env.NODE_ENV === 'development';

Sentry.init({
  enabled: SENTRY_ENABLED,
  dsn: SENTRY_ENABLED ? SENTRY_DSN : null,
  debug: isDev,
  defaultIntegrations: false,
  autoSessionTracking: false,
  tracesSampleRate: isDev ? 1 : 0,
});
