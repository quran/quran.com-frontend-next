import AppEnv from '@/types/AppEnv';

/**
 * This function adds a suffix to the cookie name based on the environment.
 * We do this to enable users to login to multiple environments at the same time without one deployment overriding the other's cookies.
 *
 * Note: these suffixes are also used in the backend, so if they're changed there, they should be changed here as well.
 *
 * @param {string} cookieName
 * @returns {string}
 */
const addEnvSuffixToAuthCookie = (cookieName: string) => {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV as AppEnv | undefined;

  // handle preview deployments from forked repos
  if (!appEnv || appEnv === AppEnv.PRODUCTION) {
    return cookieName;
  }

  return `${cookieName}_${appEnv}`;
};

// NOTE: IF THIS VALUE CHANGE, WE SHOULD CHANGE IT IN OUR AUTH REPO
export const USER_ID_COOKIE_NAME = addEnvSuffixToAuthCookie('id');
export const USER_DATA_SYNC_COOKIE_NAME = addEnvSuffixToAuthCookie('lastSyncAt');
export const NOTIFICATION_SUBSCRIBER_COOKIE_NAME = addEnvSuffixToAuthCookie('notif_sub_id');

export const DEFAULT_PHOTO_URL = `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y`;

export const AUTH_ONBOARDING_ANNOUNCEMENT_TYPE = 'auth-onboarding';
