/**
 * Default deduping interval for SWR cache invalidation in milliseconds.
 * Determines how long identical requests are deduped to prevent unnecessary API calls.
 */
export const DEFAULT_DEDUPING_INTERVAL = 10000;

/**
 * Timeout delay in milliseconds after closing the notes modal before triggering action callbacks.
 * Provides sufficient time for modal close animations to complete smoothly.
 */
export const CLOSE_POPOVER_AFTER_MS = 150;

/**
 * Temporary placeholder identifier for notes being published to QuranReflect (QR).
 * Used when the API response doesn't immediately return the created post ID,
 * enabling loading states until cache revalidation provides the actual ID.
 */
export const LOADING_POST_ID = '$$$__LOADING_POST_ID__###';
