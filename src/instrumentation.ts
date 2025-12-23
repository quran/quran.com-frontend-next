import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.MSW_ENABLED === 'true' && process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../tests/mocks/msw/setup.mjs');
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
