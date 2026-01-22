import { logEvent } from './eventLogger';

const PREVIOUS_WEBSITE_URL = 'https://previous.quran.com/';

/* eslint-disable import/prefer-default-export */
export const logAndRedirectUnsupportedLogicalCSS = () => {
  if (window.CSS && window.CSS.supports) {
    // log when css logical properties are not supported by testing the supportability of "padding-inline" logical property as a sample.
    if (!window.CSS.supports('padding-inline', '10px')) {
      logEvent('logical_css_un_supported');
      window.location.replace(PREVIOUS_WEBSITE_URL);
    }
  }
};

/**
 * Get the transition duration from the CSS variable --transition-regular.
 * This ensures the JavaScript timing stays in sync with the CSS theme definition.
 *
 * @returns {number} The transition duration in milliseconds. Returns 400ms as fallback.
 */
export const getSidebarTransitionDurationFromCss = (): number => {
  // Fallback value matches the default theme transition duration.
  const fallbackDurationMs = 400;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallbackDurationMs;
  }

  const rootElement = document.documentElement;
  if (!rootElement) {
    return fallbackDurationMs;
  }

  const rawValue = window
    .getComputedStyle(rootElement)
    .getPropertyValue('--transition-regular')
    .trim();

  if (!rawValue) {
    return fallbackDurationMs;
  }

  let parsedMs: number;

  if (rawValue.endsWith('ms')) {
    parsedMs = Number.parseFloat(rawValue.slice(0, -2));
  } else if (rawValue.endsWith('s')) {
    parsedMs = Number.parseFloat(rawValue.slice(0, -1)) * 1000;
  } else {
    parsedMs = Number.parseFloat(rawValue);
  }

  if (!Number.isFinite(parsedMs) || parsedMs <= 0) {
    return fallbackDurationMs;
  }

  return parsedMs;
};
