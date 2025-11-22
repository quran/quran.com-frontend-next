/* eslint-disable jsdoc/check-tag-names */
/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME],

  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info',
  },

  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces, unless otherwise specified in a destination's
   * attributes include/exclude lists.
   */
  allow_all_headers: true,
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     *
     * NOTE: If excluding headers, they must be in camelCase form to be filtered.
     *
     * @env NEW_RELIC_ATTRIBUTES_EXCLUDE
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },

  /**
   * Proxy settings for connecting to the New Relic collector.
   */
  proxy: {
    enabled: false,
  },

  /**
   * SSL configuration for the New Relic agent.
   */
  ssl: true,

  /**
   * Transaction tracer configuration
   */
  transaction_tracer: {
    /**
     * Transaction tracer enabled
     *
     * @env NEW_RELIC_TRANSACTION_TRACER_ENABLED
     */
    enabled: true,

    /**
     * Transaction threshold (in seconds) for when to collect a transaction trace.
     * When set to 'apdex_f', the threshold will be set to 4 times the Apdex T
     * value.
     *
     * @env NEW_RELIC_TRANSACTION_TRACER_TRANSACTION_THRESHOLD
     */
    transaction_threshold: 'apdex_f',

    /**
     * Top n transactions to record trace for.
     *
     * @env NEW_RELIC_TRANSACTION_TRACER_TOP_N
     */
    top_n: 20,
  },

  /**
   * Error collector configuration
   */
  error_collector: {
    /**
     * Error collector enabled
     *
     * @env NEW_RELIC_ERROR_COLLECTOR_ENABLED
     */
    enabled: true,

    /**
     * List of HTTP error status codes the error collector should ignore.
     *
     * @env NEW_RELIC_ERROR_COLLECTOR_IGNORE_ERROR_CODES
     */
    ignore_status_codes: [404, 429],
  },

  /**
   * Browser monitoring configuration
   */
  browser_monitoring: {
    /**
     * Browser monitoring enabled
     *
     * @env NEW_RELIC_BROWSER_MONITORING_ENABLED
     */
    enabled: true,
  },

  /**
   * Transaction events configuration
   */
  transaction_events: {
    /**
     * Transaction events enabled
     *
     * @env NEW_RELIC_TRANSACTION_EVENTS_ENABLED
     */
    enabled: true,
  },

  /**
   * Distributed tracing configuration
   */
  distributed_tracing: {
    /**
     * Distributed tracing enabled
     *
     * @env NEW_RELIC_DISTRIBUTED_TRACING_ENABLED
     */
    enabled: true,
  },
};
