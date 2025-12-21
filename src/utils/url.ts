import { isStaticBuild } from '@/utils/build';

const getLocalePostfix = (locale: string) => (locale !== 'en' ? `/${locale}` : '');

export enum QuranFoundationService {
  SEARCH = 'search',
  AUTH = 'auth',
  CONTENT = 'content',
  QURAN_REFLECT = 'quran-reflect',
}

export const getCurrentPath = () => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
};

export const getWindowOrigin = (locale: string) => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${getLocalePostfix(locale)}`;
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

/**
 * Get the base path of the current deployment on Vercel/local machine
 * e.g. http://localhost
 * or https://quran-com-ebqc5a2d5-qurancom.vercel.app this is needed
 * if we want to construct a full path e.g. when we add alternate languages
 * meta tags.
 *
 * @see https://vercel.com/docs/concepts/projects/environment-variables
 * @returns {string}
 */
export const getBasePath = (): string =>
  `${process.env.NEXT_PUBLIC_VERCEL_ENV === 'development' ? 'http' : 'https'}://${
    process.env.NEXT_PUBLIC_VERCEL_URL
  }`;

export const getProxiedServiceUrl = (service: QuranFoundationService, path: string): string => {
  const PROXY_PATH = `/api/proxy/${service}`;
  const BASE_PATH = isStaticBuild
    ? `${process.env.API_GATEWAY_URL}/${service}`
    : `${getBasePath()}${PROXY_PATH}`;
  return `${BASE_PATH}${path}`;
};

/**
 * Sanitizes a redirect URL to prevent open redirect vulnerabilities.
 * Allows same-origin relative paths and URLs from enabled SSO platforms.
 *
 * @param {string} rawUrl - The raw URL string to sanitize
 * @returns {string} A safe redirect URL or '/' if the input is unsafe
 */
export const resolveSafeRedirect = (rawUrl: string): string => {
  // TODO: check for malicious external URLs
  if (!rawUrl) return '/';

  try {
    const base = getBasePath();
    const url = rawUrl.startsWith('http') ? new URL(rawUrl) : new URL(rawUrl, base);

    // For SSO platform URLs, return the full URL
    return url.href;
  } catch (error) {
    // If URL parsing fails, assume it's a relative path
    // Remove any leading slashes and dangerous characters
    const cleanPath = rawUrl.replace(/^\/+/, '').replace(/[\r\n\t]/g, '');
    return cleanPath ? `/${cleanPath}` : '/';
  }
};
