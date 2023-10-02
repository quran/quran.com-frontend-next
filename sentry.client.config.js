// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENABLED = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

Sentry.init({
  enabled: SENTRY_ENABLED,
  dsn: SENTRY_ENABLED
    ? SENTRY_DSN || 'https://4bbd08e674fc4a77a0eecd77bc6bd72d@o25468.ingest.sentry.io/5906954'
    : null,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: isDev ? 1 : 0.2,
  debug: isDev,
});
