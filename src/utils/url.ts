import { SSO_PLATFORM_CONFIGS } from '@/utils/auth/constants';
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
 * Gets the origins of enabled SSO platforms to check against redirect URLs.
 * This avoids circular dependency with @/utils/auth/login which imports from this file.
 *
 * @returns {string[]} Array of SSO platform origins
 */
const getSsoPlatformOrigins = (): string[] => {
  return SSO_PLATFORM_CONFIGS.filter((config) => config.enabled)
    .map((config) => {
      const rawUrl = process.env[config.envKey as keyof NodeJS.ProcessEnv]?.trim();
      if (!rawUrl) return null;

      try {
        const url = new URL(rawUrl);
        return url.origin;
      } catch {
        return null;
      }
    })
    .filter((origin): origin is string => origin !== null);
};

/**
 * Sanitizes a redirect URL to prevent open redirect vulnerabilities.
 * Allows same-origin relative paths, URLs from our domain, and URLs from enabled SSO platforms.
 *
 * @param {string} rawUrl - The raw URL string to sanitize
 * @returns {string} A safe redirect URL or '/' if the input is unsafe
 */
export const resolveSafeRedirect = (rawUrl: string): string => {
  if (!rawUrl) return '/';

  try {
    const base = getBasePath();
    const isAbsoluteUrl = rawUrl.startsWith('http');
    const url = isAbsoluteUrl ? new URL(rawUrl) : new URL(rawUrl, base);

    // If it's an absolute URL, check if it's from our domain or an enabled SSO platform
    if (isAbsoluteUrl) {
      // Get our domain origin - prefer window.location.origin if available (client-side)
      const ourOrigin =
        typeof window !== 'undefined' ? window.location.origin : new URL(base).origin;

      // Check if URL is from our domain
      if (url.origin === ourOrigin) {
        return url.href;
      }

      // Check if URL is from an enabled SSO platform
      const ssoPlatformOrigins = getSsoPlatformOrigins();
      if (ssoPlatformOrigins.includes(url.origin)) {
        return url.href;
      }

      // Block external URLs that are not from our domain or SSO platforms
      return '/';
    }

    return url.href;
  } catch (error) {
    // If URL parsing fails, assume it's a relative path
    // Remove any leading slashes and dangerous characters
    const cleanPath = rawUrl.replace(/^\/+/, '').replace(/[\r\n\t]/g, '');
    return cleanPath ? `/${cleanPath}` : '/';
  }
};
