/* eslint-disable import/prefer-default-export */
// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENABLED = process.env.NEXT_PUBLIC_CLIENT_SENTRY_ENABLED === 'true';
const isDev = process.env.NODE_ENV === 'development';
const version = `quran.com-frontend-next@${process.env.NEXT_PUBLIC_APP_VERSION}`;

Sentry.init({
  enabled: SENTRY_ENABLED,
  dsn: SENTRY_ENABLED ? SENTRY_DSN : null,
  debug: isDev,
  tracesSampleRate: isDev ? 1 : 0.1,
  replaysOnErrorSampleRate: isDev ? 1 : 0.1,
  // Session replays sample rate - only capture dev sessions
  replaysSessionSampleRate: isDev ? 1.0 : 0,
  release: version,
  integrations: [
    // Add the replay integration for session replays
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
