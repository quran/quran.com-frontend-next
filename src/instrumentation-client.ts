/* eslint-disable import/prefer-default-export */
// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENABLED = process.env.NEXT_PUBLIC_CLIENT_SENTRY_ENABLED === 'true';
const isDev = process.env.NODE_ENV === 'development';
const version = `quran.com-frontend-next@${process.env.NEXT_PUBLIC_APP_VERSION}`;

const IGNORED_ERRORS: Array<string | RegExp> = [
  /hydration failed/i,
  /an error occurred during hydration/i,
  /there was an error while hydrating/i,
  /text content does not match server-rendered html/i,
  /expected server html to contain a matching/i,
  /did not match\. server:/i,
  /hydration error/i,
  /minified react error #418/i,
  /invariant=418/i,
];

Sentry.init({
  enabled: SENTRY_ENABLED,
  dsn: SENTRY_ENABLED ? SENTRY_DSN : null,
  debug: isDev,
  tracesSampleRate: isDev ? 1 : 0.1,
  replaysOnErrorSampleRate: isDev ? 1 : 0.1,
  // Session replays sample rate - only capture dev sessions
  replaysSessionSampleRate: isDev ? 1.0 : 0,
  release: version,
  ignoreErrors: IGNORED_ERRORS,
  integrations: [
    // Add the replay integration for session replays
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
