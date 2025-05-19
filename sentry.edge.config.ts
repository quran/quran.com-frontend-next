// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENABLED = process.env.NEXT_PUBLIC_SERVER_SENTRY_ENABLED === 'true';
const isDev = process.env.NODE_ENV === 'development';

Sentry.init({
  enabled: SENTRY_ENABLED,
  dsn: SENTRY_ENABLED ? SENTRY_DSN : null,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: isDev ? 1 : 0,
  debug: isDev,
});
