import { logEvent } from './eventLogger';

/* eslint-disable import/prefer-default-export */
export const checkForCSSLogicalUnsupported = () => {
  if (window.CSS && window.CSS.supports) {
    // log when css logical properties are not supported by testing the supportability of "padding-inline" logical property as a sample.
    if (!window.CSS.supports('padding-inline', '10px')) {
      logEvent('logical_css_un_supported');
    }
  }
};
