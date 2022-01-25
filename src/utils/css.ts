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
