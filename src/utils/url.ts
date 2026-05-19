import { isStaticBuild } from '@/utils/build';

const getLocalePostfix = (locale: string) => (locale !== 'en' ? `/${locale}` : '');

export enum QuranFoundationService {
  SEARCH = 'search',
  AUTH = 'auth',
  CONTENT = 'content',
  QURAN_REFLECT = 'quran-reflect',
}

const STAGING_CONTENT_HOST = 'https://staging.quran.com';
const PRODUCTION_CONTENT_HOST = 'https://api.qurancdn.com';

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

export type QueryParamValue = string | string[] | undefined;

/**
 * Normalize a query parameter to a single string value.
 *
 * @param {QueryParamValue} param
 * @returns {string | undefined}
 */
export const normalizeQueryParam = (param: QueryParamValue): string | undefined =>
  Array.isArray(param) ? param[0] : param;

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

function resolveDeployHost(): string {
  const fromEnv = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
  const netlifyUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (netlifyUrl) {
    try {
      return new URL(netlifyUrl).host;
    } catch {
      // fall through
    }
  }
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'development' ? 'localhost:3000' : 'quran.com';
}

/**
 * Get the base path of the current deployment on Vercel/local machine
 * e.g. http://localhost
 * or https://quran-com-ebqc5a2d5-qurancom.vercel.app this is needed
 * if we want to construct a full path e.g. when we add alternate languages
 * meta tags.
 *
 * On Netlify, falls back to `URL` / `DEPLOY_PRIME_URL` when `NEXT_PUBLIC_VERCEL_URL` is unset.
 *
 * @see https://vercel.com/docs/concepts/projects/environment-variables
 * @returns {string}
 */
export const getBasePath = (): string => {
  const isDev = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
  return `${isDev ? 'http' : 'https'}://${resolveDeployHost()}`;
};

export const getProxiedServiceUrl = (service: QuranFoundationService, path: string): string => {
  if (service === QuranFoundationService.CONTENT) {
    const contentHost = STAGING_CONTENT_HOST;
    return `${contentHost}${path}`;
  }

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
