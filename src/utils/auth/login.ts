import Cookies from 'js-cookie';

import {
  NOTIFICATION_SUBSCRIBER_COOKIE_NAME,
  SSO_PLATFORM_CONFIGS,
  USER_ID_COOKIE_NAME,
} from './constants';

import QueryParam from '@/types/QueryParam';
import { SsoPlatform } from '@/utils/auth/types/Auth';
import { getBasePath } from '@/utils/url';

export type UserType = 'logged_in' | 'guest';

export const getUserIdCookie = () => Cookies.get(USER_ID_COOKIE_NAME);
export const removeUserIdCookie = () => Cookies.remove(USER_ID_COOKIE_NAME);
export const isLoggedIn = () => !!getUserIdCookie();

/**
 * Returns user type by authentication status.
 * @param {boolean} [isLoggedInValue] - Optional status override.
 * @returns {UserType} 'logged_in' or 'guest'.
 */
export const getUserType = (isLoggedInValue?: boolean): UserType => {
  const loggedIn = isLoggedInValue ?? isLoggedIn();
  return loggedIn ? 'logged_in' : 'guest';
};

export const getNotificationSubscriberHashCookie = () =>
  Cookies.get(NOTIFICATION_SUBSCRIBER_COOKIE_NAME);

/**
 * Builds a redirect back URL for SSO platform navigation
 * @param {string} pathname - The path to redirect to after authentication
 * @param {string[]} updatedVisited - Array of platform IDs that have been visited
 * @param {string} [token] - Optional authentication token
 * @param {string} [redirectTo] - Optional final redirect destination
 * @returns {URL} URL object with query parameters for platform navigation
 */
export const buildRedirectBackUrl = (
  pathname: string,
  updatedVisited: string[],
  token?: string,
  redirectTo?: string,
): URL => {
  const url = new URL(pathname, getBasePath());
  url.searchParams.set(QueryParam.VISITEDPLATFORM, updatedVisited.join(','));
  if (token) url.searchParams.set(QueryParam.TOKEN, token);
  if (redirectTo) url.searchParams.set(QueryParam.REDIRECT_TO, redirectTo);
  return url;
};

/**
 * Builds a URL for the next SSO platform in the authentication flow
 * @param {SsoPlatform} nextPlatform - The next platform to authenticate with
 * @param {URL} redirectBackUrl - URL to redirect back to after platform authentication
 * @param {string} [token] - Optional authentication token
 * @returns {URL} URL object for the next platform with redirect parameters
 */
export const buildNextPlatformUrl = (
  nextPlatform: SsoPlatform,
  redirectBackUrl: URL,
  token?: string,
): URL => {
  const nextPlatformUrl = new URL(nextPlatform.url);
  nextPlatformUrl.searchParams.set(
    QueryParam.REDIRECTBACK,
    encodeURIComponent(redirectBackUrl.href),
  );
  nextPlatformUrl.searchParams.set(QueryParam.SILENT, '1');
  if (token) nextPlatformUrl.searchParams.set(QueryParam.TOKEN, token);

  return nextPlatformUrl;
};

/**
 * Builds an array of enabled SSO platforms from environment configuration
 * @returns {ReadonlyArray<SsoPlatform>} ReadonlyArray of enabled SSO platforms with valid URLs
 */
export const buildSsoPlatforms = (): ReadonlyArray<SsoPlatform> => {
  return SSO_PLATFORM_CONFIGS.filter((config) => config.enabled)
    .map((config) => {
      const rawUrl = process.env[config.envKey as keyof NodeJS.ProcessEnv]?.trim();
      if (!rawUrl) return null;

      try {
        // Validate URL format by creating URL object
        const url = new URL(rawUrl);
        return { id: config.id, url: url.toString().trim(), enabled: true };
      } catch {
        // eslint-disable-next-line no-console
        console.warn(`Invalid SSO platform URL for ${config.id}: ${rawUrl}`);
        return null;
      }
    })
    .filter((platform): platform is SsoPlatform => platform !== null);
};

/**
 * Gets SSO platform paths with optional path appended to each platform URL
 * @param {string} [path] - Optional path to append to each platform URL
 * @returns {ReadonlyArray<SsoPlatform>} ReadonlyArray of SSO platforms with modified URLs
 */
export const getSsoPlatformPath = (path?: string): ReadonlyArray<SsoPlatform> => {
  return buildSsoPlatforms().map((platform) => {
    if (!path) return platform;

    try {
      const url = new URL(path, platform.url);
      return {
        ...platform,
        url: url.toString(),
      };
    } catch {
      // If URL construction fails, return original platform
      return platform;
    }
  });
};
