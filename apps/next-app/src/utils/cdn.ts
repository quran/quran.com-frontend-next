export const CDN_HOST = 'https://static.qurancdn.com';
export const CDN_ASSETS_VERSION = '1';

/**
 * Generate versioned URL of static asset
 *
 * @param {string} path the path of static asset
 * @returns {string}
 */

export const makeCDNUrl = (path: string) => {
  return `${CDN_HOST}/${path}?v=${CDN_ASSETS_VERSION}`;
};
