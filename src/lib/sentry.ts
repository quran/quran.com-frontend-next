import * as Sentry from '@sentry/nextjs';

import { getUserIdCookie } from '@/utils/auth/login';

const SENTRY_ENABLED = process.env.NEXT_PUBLIC_CLIENT_SENTRY_ENABLED === 'true';

interface LogOptions {
  metadata?: Record<string, unknown>;
  transactionName?: string;
}

/**
 * A wrapper around Sentry.captureException that logs to the console if Sentry is not enabled and accepts additional metadata.
 *
 * @param {unknown} error
 * @param {LogOptions} options
 */
export const logErrorToSentry = (error: unknown, options: LogOptions = {}) => {
  if (!SENTRY_ENABLED) {
    // eslint-disable-next-line no-console
    console.error(error, options);
  } else {
    Sentry.captureException(error, (scope) => {
      if (options.metadata) {
        scope.setContext('extraData', options.metadata);
      }
      if (getUserIdCookie()) {
        scope.setUser({
          id: getUserIdCookie(),
        });
      }
      if (options.transactionName) {
        scope.setTransactionName(options.transactionName);
      }
      return scope;
    });
  }
};

/**
 * A wrapper around Sentry.captureMessage that logs to the console if Sentry is not enabled and accepts additional metadata. This is typically used for logging errors or in-app states that are not thrown.
 *
 * @param {string} message
 * @param {LogOptions} options
 */
export const logMessageToSentry = (
  message: string,
  options: {
    metadata?: Record<string, unknown>;
    transactionName?: string;
  } = {},
) => {
  if (!SENTRY_ENABLED) {
    // eslint-disable-next-line no-console
    console.log(message, options);
  } else {
    Sentry.captureMessage(message, (scope) => {
      if (options.metadata) {
        scope.setContext('extraData', options.metadata);
      }
      if (options.transactionName) {
        scope.setTransactionName(options.transactionName);
      }
      return scope;
    });
  }
};
