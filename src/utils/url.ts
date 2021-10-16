export const getCurrentPath = () => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
};

export const getWindowOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

/**
 * Navigate programmatically to an external url. we will try to open
 * the url in a new tab and if it doesn't work due to pop-ups being blocked,
 * we will open the url in the current tab.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/open#return_value
 *
 * @param {string} url
 */
export const navigateToExternalUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    // if it's being blocked
    if (!window.open(url, '_blank')) {
      window.location.replace(url);
    }
  }
};
