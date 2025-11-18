import * as Sentry from '@sentry/nextjs';

import { getUserIdCookie } from '@/utils/auth/login';

const SENTRY_ENABLED = process.env.NEXT_PUBLIC_CLIENT_SENTRY_ENABLED === 'true';

interface LogOptions {
  metadata?: Record<string, unknown>;
  transactionName?: string;
}

/**
 * Process a Response object error for Sentry
 *
 * @param {Response} response The response error
 * @param {LogOptions} options Current logging options
 * @returns {Promise<{processedError: unknown, updatedMetadata: Record<string, unknown> | undefined}>}
 */
const processResponseError = async (response: Response, options: LogOptions = {}) => {
  try {
    // Safely clone the response (some responses can't be cloned if already read)
    const clonedResponse = response.clone();
    let responseData = '';
    try {
      responseData = await clonedResponse.text();
    } catch (textError) {
      responseData = 'Could not extract response text';
    }

    const errorObj = new Error(`Response error: ${response.status} ${response.statusText || ''}`);
    // Create updated metadata
    const updatedMetadata = {
      ...options.metadata,
      responseStatus: response.status,
      responseStatusText: response.statusText || '',
      responseUrl: response.url || 'unknown',
      responseData,
    };
    return { processedError: errorObj, updatedMetadata };
  } catch (extractionError) {
    // If anything fails during response handling
    return {
      processedError: new Error(`Response error handling failed: ${String(extractionError)}`),
      updatedMetadata: {
        ...options.metadata,
        originalError: 'Response object (extraction failed)',
        extractionError: String(extractionError),
      },
    };
  }
};

/**
 * Process a non-Error object for Sentry
 *
 * @param {unknown} err The error object
 * @param {LogOptions} options Current logging options
 * @returns {{processedError: Error, updatedMetadata: Record<string, unknown> | undefined}}
 */
const processNonErrorObject = (err: unknown, options: LogOptions = {}) => {
  try {
    // Try to create a useful message from the object
    const errorMessage = `Non-Error object thrown: ${JSON.stringify(err)}`;
    return {
      processedError: new Error(errorMessage),
      updatedMetadata: {
        ...options.metadata,
        originalErrorType: Object.prototype.toString.call(err),
        originalErrorData: err,
      },
    };
  } catch (stringifyError) {
    // If JSON.stringify fails (e.g., circular references)
    return {
      processedError: new Error('Non-Error object thrown (could not stringify)'),
      updatedMetadata: {
        ...options.metadata,
        originalErrorType: Object.prototype.toString.call(err),
      },
    };
  }
};

/**
 * Process an error before sending to Sentry, handling Response objects specially
 *
 * @param {unknown} err The error to process
 * @param {LogOptions} options Current logging options
 * @returns {Promise<{processedError: unknown, updatedMetadata: Record<string, unknown> | undefined}>}
 */
const processError = async (err: unknown, options: LogOptions = {}) => {
  try {
    // Check if error is a Response object (safely handle environments where Response might not exist)
    if (typeof Response !== 'undefined' && err instanceof Response) {
      return processResponseError(err, options);
    }

    // Handle cases where the error is not a standard Error object
    if (err && typeof err === 'object' && !(err instanceof Error)) {
      return processNonErrorObject(err, options);
    }

    // Default case - return as is
    return { processedError: err, updatedMetadata: options.metadata };
  } catch (processingError) {
    // Safety net - if anything goes wrong in our error processing
    return {
      processedError: new Error(`Error processor failed: ${String(processingError)}`),
      updatedMetadata: {
        ...options.metadata,
        processingError: String(processingError),
      },
    };
  }
};

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
    // Process the error and then send to Sentry
    processError(error, options)
      .then(({ processedError, updatedMetadata }) => {
        Sentry.captureException(processedError, (scope) => {
          if (updatedMetadata) {
            scope.setContext('extraData', updatedMetadata);
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
      })
      .catch((processingError) => {
        // Last resort - if promise handling fails, log both original error and processing error
        Sentry.captureException(error);
        Sentry.captureException(processingError);
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
      if (getUserIdCookie()) {
        scope.setUser({
          id: getUserIdCookie(),
        });
      }
      return scope;
    });
  }
};

/**
 * Add a breadcrumb (lightweight log) to Sentry for state/flow tracing without creating a full event.
 * Falls back to console when Sentry disabled.
 *
 * @param {string} category Logical category e.g. 'auth.redirect'
 * @param {string} message Short description
 * @param {Record<string, unknown>} data Additional context data
 */
export const addSentryBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, unknown>,
) => {
  if (!SENTRY_ENABLED) {
    // eslint-disable-next-line no-console
    console.debug(`[breadcrumb] ${category}: ${message}`, data);
    return;
  }
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
};
