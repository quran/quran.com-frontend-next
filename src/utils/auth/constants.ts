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
  const branch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;
  const repo = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER;

  // handle preview deployments from forked repos
  if (repo === process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER) {
    if (branch === 'production') {
      return cookieName;
    }

    if (branch === 'staging2') {
      return `${cookieName}_staging2`;
    }
  }

  return `${cookieName}_staging`;
};

// NOTE: IF THOSE VALUES CHANGE, WE SHOULD CHANGE IT IN OUR AUTH REPO
export const REFRESH_TOKEN_COOKIE_NAME = addEnvSuffixToAuthCookie('rt');
export const ACCESS_TOKEN_COOKIE_NAME = addEnvSuffixToAuthCookie('at');
export const USER_ID = addEnvSuffixToAuthCookie('id');

export const DEFAULT_PHOTO_URL = `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y`;

export const AUTH_ONBOARDING_ANNOUNCEMENT_TYPE = 'auth-onboarding';
