/* eslint-disable no-console */

// MSW Logging Utility
// Provides configurable logging levels and formatting for MSW request interception

const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  VERBOSE: 5,
};

// Configure log level via environment variable or default to INFO
const currentLogLevel = LOG_LEVELS[process.env.MSW_LOG_LEVEL] || LOG_LEVELS.INFO;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Format timestamp
const getTimestamp = () => new Date().toISOString();

// Format request details for logging
const formatRequestDetails = (request) => {
  const url = new URL(request.url);
  const details = {
    method: request.method,
    url: request.url,
    pathname: url.pathname,
    search: url.search,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: getTimestamp(),
  };

  // Add query params if they exist
  if (url.search) {
    details.queryParams = Object.fromEntries(url.searchParams.entries());
  }

  return details;
};

// Format response details for logging
const formatResponseDetails = (response, data = null) => {
  const details = {
    status: response?.status || 'unknown',
    statusText: response?.statusText || '',
    timestamp: getTimestamp(),
  };

  if (data) {
    details.data = data;
  }

  return details;
};

// Logging functions
const logger = {
  error: (message, ...args) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      console.error(`${colors.red}❌ MSW ERROR:${colors.reset} ${message}`, ...args);
    }
  },

  warn: (message, ...args) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn(`${colors.yellow}⚠️  MSW WARN:${colors.reset} ${message}`, ...args);
    }
  },

  info: (message, ...args) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.info(`${colors.blue}ℹ️  MSW INFO:${colors.reset} ${message}`, ...args);
    }
  },

  debug: (message, ...args) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.debug(`${colors.magenta}🐛 MSW DEBUG:${colors.reset} ${message}`, ...args);
    }
  },

  verbose: (message, ...args) => {
    if (currentLogLevel >= LOG_LEVELS.VERBOSE) {
      console.log(`${colors.dim}🔍 MSW VERBOSE:${colors.reset} ${message}`, ...args);
    }
  },

  // Request logging
  logRequest: (request, handlerName = 'Unknown') => {
    const details = formatRequestDetails(request);

    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log(`${colors.green}🔍 MSW REQUEST INTERCEPTED${colors.reset}`);
      console.log(`  ${colors.bright}Handler:${colors.reset} ${handlerName}`);
      console.log(`  ${colors.bright}Method:${colors.reset} ${details.method}`);
      console.log(`  ${colors.bright}URL:${colors.reset} ${details.url}`);
      console.log(`  ${colors.bright}Timestamp:${colors.reset} ${details.timestamp}`);

      if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.log(`  ${colors.bright}Headers:${colors.reset}`, details.headers);
        if (details.queryParams) {
          console.log(`  ${colors.bright}Query Params:${colors.reset}`, details.queryParams);
        }
      }
    }
  },

  // Response logging
  logResponse: (response, data = null, handlerName = 'Unknown') => {
    const details = formatResponseDetails(response, data);

    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log(`${colors.cyan}✅ MSW RESPONSE SENT${colors.reset}`);
      console.log(`  ${colors.bright}Handler:${colors.reset} ${handlerName}`);
      console.log(`  ${colors.bright}Status:${colors.reset} ${details.status}`);
      console.log(`  ${colors.bright}Timestamp:${colors.reset} ${details.timestamp}`);

      if (currentLogLevel >= LOG_LEVELS.DEBUG && data) {
        console.log(
          `  ${colors.bright}Response Data:${colors.reset}`,
          typeof data === 'string' ? data : JSON.stringify(data, null, 2),
        );
      }
    }
  },

  // Request body logging
  logRequestBody: async (request, handlerName = 'Unknown') => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      try {
        const body = await request.json();
        console.log(`${colors.magenta}📦 MSW REQUEST BODY${colors.reset}`);
        console.log(`  ${colors.bright}Handler:${colors.reset} ${handlerName}`);
        console.log(`  ${colors.bright}Body:${colors.reset}`, JSON.stringify(body, null, 2));
        return body;
      } catch (error) {
        logger.warn(`Could not parse request body for ${handlerName}:`, error.message);
        return null;
      }
    }
    return null;
  },

  // Unhandled request logging
  logUnhandledRequest: (request) => {
    const details = formatRequestDetails(request);

    console.log(`${colors.red}🚨 MSW UNHANDLED REQUEST${colors.reset}`);
    console.log(`  ${colors.bright}Method:${colors.reset} ${details.method}`);
    console.log(`  ${colors.bright}URL:${colors.reset} ${details.url}`);
    console.log(`  ${colors.bright}Timestamp:${colors.reset} ${details.timestamp}`);

    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log(`  ${colors.bright}Headers:${colors.reset}`, details.headers);
      if (details.queryParams) {
        console.log(`  ${colors.bright}Query Params:${colors.reset}`, details.queryParams);
      }
    }
  },
};

module.exports = {
  logger,
  LOG_LEVELS,
  formatRequestDetails,
  formatResponseDetails,
  getTimestamp,
};
