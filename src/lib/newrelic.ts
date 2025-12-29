/* eslint-disable react-func/max-lines-per-function */
/**
 * New Relic logging utility
 *
 * This module provides functions to log debug information to New Relic.
 * Uses New Relic's dedicated logging service instead of transaction-based logging.
 */

// Get the New Relic API
// Since New Relic is required at the application entry point,
// we can safely access it through the global scope
// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-extraneous-dependencies
const newrelic = typeof window === 'undefined' ? require('newrelic') : null;

/**
 * Log levels for New Relic logging
 */
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log debug information to New Relic's logging service
 *
 * @param {string} message - The message to log
 * @param {Record<string, any>} [attributes] - Additional attributes to include with the log
 * @param {LogLevel} [level=LogLevel.DEBUG] - The log level
 */
export function logDebug(
  message: string,
  attributes?: Record<string, any>,
  level: LogLevel = LogLevel.DEBUG,
): void {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[NewRelic ${level}]`, message, attributes || {});
  }

  if (!newrelic) {
    return;
  }

  try {
    // Create a log object with the message and attributes
    const logObject = {
      message,
      timestamp: Date.now(),
      level,
      ...attributes,
    };

    // Send the log to New Relic's logging service
    newrelic.recordLogEvent(logObject);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to log to New Relic:', error);
  }
}

/**
 * Log information to New Relic's logging service
 *
 * @param {string} message - The message to log
 * @param {Record<string, any>} [attributes] - Additional attributes to include with the log
 */
export function logInfo(message: string, attributes?: Record<string, any>): void {
  logDebug(message, attributes, LogLevel.INFO);
}

/**
 * Log warning to New Relic's logging service
 *
 * @param {string} message - The message to log
 * @param {Record<string, any>} [attributes] - Additional attributes to include with the log
 */
export function logWarning(message: string, attributes?: Record<string, any>): void {
  logDebug(message, attributes, LogLevel.WARN);
}

/**
 * Log error to New Relic's logging service
 *
 * @param {string} message - The message to log
 * @param {Error} [error] - The error object
 * @param {Record<string, any>} [attributes] - Additional attributes to include with the log
 */
export function logError(message: string, error?: Error, attributes?: Record<string, any>): void {
  const errorAttributes = error
    ? {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        ...attributes,
      }
    : attributes;

  logDebug(message, errorAttributes, LogLevel.ERROR);
}

/**
 * Log a transaction to New Relic with timing information
 * This still uses transaction-based logging but also adds a log entry
 *
 * @param {string} name - The name of the transaction
 * @param {string} group - The group the transaction belongs to
 * @param {() => Promise<T>} callback - The function to execute and time
 * @returns {Promise<T>} The result of the callback function
 */
export async function logTransaction<T>(
  name: string,
  group: string,
  callback: () => Promise<T>,
): Promise<T> {
  if (!newrelic) {
    return callback();
  }
  const startTime = Date.now();

  try {
    // Log the start of the transaction
    logInfo(`Starting transaction: ${group}/${name}`, { transactionName: name, group });

    // Start a new transaction
    const transaction = newrelic.startWebTransaction(name, async () => {
      return callback();
    });

    const result = await transaction;

    // Log the successful completion of the transaction
    const duration = Date.now() - startTime;
    logInfo(`Completed transaction: ${group}/${name}`, {
      transactionName: name,
      group,
      duration,
      success: true,
    });

    return result;
  } catch (error) {
    // Record the error with New Relic
    newrelic.noticeError(error, {
      name,
      group,
      duration: Date.now() - startTime,
    });

    // Log the error
    logError(`Failed transaction: ${group}/${name}`, error as Error, {
      transactionName: name,
      group,
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

/**
 * Set the current transaction name in New Relic
 *
 * @param {string} name - The name to set for the current transaction
 * @param {string} group - The group the transaction belongs to
 */
export function setTransactionName(name: string, group: string): void {
  if (!newrelic) {
    return;
  }
  try {
    const transactionName = `${group}/${name}`;
    newrelic.setTransactionName(transactionName);

    // Also log this as an event
    logInfo(`Transaction started: ${transactionName}`, {
      transactionName: name,
      group,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to set New Relic transaction name:', error);
  }
}

/**
 * Add custom attributes to the current New Relic transaction
 *
 * @param {Record<string, any>} attributes - The attributes to add to the current transaction
 */
export function addCustomAttributes(attributes: Record<string, any>): void {
  if (!newrelic) {
    return;
  }
  try {
    newrelic.addCustomAttributes(attributes);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to add custom attributes to New Relic:', error);
  }
}
