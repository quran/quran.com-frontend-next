/* eslint-disable react-func/max-lines-per-function */
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { fetcher } from '@/api';
import QueryParam from '@/types/QueryParam';
import { makeLogoutUrl } from '@/utils/auth/apiPaths';
import { SSO_ENABLED } from '@/utils/auth/constants';
import { buildNextPlatformUrl, buildRedirectBackUrl, getSsoPlatformPath } from '@/utils/auth/login';
import { setProxyCookies } from '@/utils/cookies';
import { ROUTES } from '@/utils/navigation';
import { clearQdcPreferencesCookies } from '@/utils/qdcPreferencesCookies';
import { getBasePath, resolveSafeRedirect } from '@/utils/url';

/**
 * Triggers logout for all platforms by redirecting to each platform's logout URL.
 * @param {string[]} visitedPlatformIds - Array of platform IDs that have already been visited.
 * @param {GetServerSidePropsContext} context - The context object containing request details.
 * @returns {Promise<GetServerSidePropsResult<any>>} - The result of the server-side props function, including redirection.
 */
const triggerPlatformLogouts = async (
  visitedPlatformIds: string[],
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<any>> => {
  const ssoPlatforms = getSsoPlatformPath(ROUTES.LOGOUT);
  const nextPlatform = ssoPlatforms.find((platform) => !visitedPlatformIds.includes(platform.id));

  const { [QueryParam.REDIRECT_TO]: redirectTo } = context.query;
  if (nextPlatform) {
    const updatedVisited = [...visitedPlatformIds, nextPlatform.id];
    const redirectBackUrl = buildRedirectBackUrl(
      ROUTES.LOGOUT,
      updatedVisited,
      '', // Empty string for token in logout case
      redirectTo as string,
    );
    const nextPlatformUrl = buildNextPlatformUrl(nextPlatform, redirectBackUrl);

    return {
      props: {},
      redirect: {
        destination: nextPlatformUrl.toString(),
        permanent: false,
      },
    };
  }

  const pathname = redirectTo ? resolveSafeRedirect(decodeURIComponent(redirectTo as string)) : '/';
  // All platforms are covered, perform logout
  const absolute = new URL(pathname, getBasePath()).toString();
  return performLogout(context, absolute);
};

/**
 * Performs the logout by calling the logout API and clearing cookies.
 * @param {GetServerSidePropsContext} context - The context object containing request details.
 * @param {string} destination - The URL to redirect to after logout.
 * @returns {Promise<GetServerSidePropsResult<any>>} - The result of the server-side props function, including redirection.
 */
const performLogout = async (
  context: GetServerSidePropsContext,
  destination: string,
): Promise<GetServerSidePropsResult<any>> => {
  // Never cache /logout (it mutates auth state and clears cookies).
  context.res.setHeader('Cache-Control', 'private, no-store');

  const { cookie } = context.req.headers;

  const response: Response = await fetcher(
    makeLogoutUrl(),
    {
      method: 'POST',
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'content-type': 'application/json',
        cookie,
      },
      body: null,
    },
    true,
  );

  setProxyCookies(response, context);

  // Clear SSR preference snapshot + manual locale marker.
  const isSecure =
    context.req.headers['x-forwarded-proto'] === 'https' ||
    (typeof context.req.headers['cf-visitor'] === 'string' &&
      context.req.headers['cf-visitor'].includes('https'));

  const clearedPrefsCookies = clearQdcPreferencesCookies({ secure: isSecure });
  const manualLocaleExpiry = new Date(0).toUTCString();
  const manualLocaleCookie = [
    `QDC_MANUAL_LOCALE=`,
    `Path=/`,
    `Expires=${manualLocaleExpiry}`,
    `SameSite=Lax`,
    ...(isSecure ? ['Secure'] : []),
  ].join('; ');

  const existing = context.res.getHeader('Set-Cookie');
  const nextCookies: string[] = [];

  if (existing) {
    if (Array.isArray(existing)) nextCookies.push(...existing.map((c) => c.toString()));
    else nextCookies.push(existing.toString());
  }

  nextCookies.push(...clearedPrefsCookies, manualLocaleCookie);
  context.res.setHeader('Set-Cookie', nextCookies);

  return {
    props: {},
    redirect: {
      destination,
      permanent: false,
    },
  };
};

/**
 * Next.js getServerSideProps for handling logout and SSO redirection.
 * @param {GetServerSidePropsContext} context - The context object containing request details.
 * @returns {Promise<GetServerSidePropsResult<any>>} - The result of the server-side props function, including redirection.
 */
/* eslint-disable react-func/max-lines-per-function */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    [QueryParam.SILENT]: silent,
    [QueryParam.REDIRECTBACK]: redirectBack,
    [QueryParam.VISITEDPLATFORM]: visitedPlatform,
    [QueryParam.REDIRECT_TO]: redirectTo,
  } = context.query;
  const visitedPlatformIds = visitedPlatform
    ? visitedPlatform
        .toString()
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

  try {
    if (SSO_ENABLED && silent !== '1') {
      return triggerPlatformLogouts(visitedPlatformIds, context);
    }

    let finalPath =
      silent && redirectBack
        ? resolveSafeRedirect(decodeURIComponent(redirectBack as string))
        : getBasePath();
    finalPath = redirectTo
      ? resolveSafeRedirect(decodeURIComponent(redirectTo as string))
      : finalPath;
    // Call the main logout API
    return performLogout(context, finalPath);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error during logout:', error);
    return {
      props: {},
      redirect: {
        destination: getBasePath(),
        permanent: false,
      },
    };
  }
};

export default function Logout() {
  // Since logout is handled server-side via getServerSideProps,
  // this component should not render. If it does render, it means
  // there was an error in the server-side redirect.
  return (
    <div>
      <p>Signing you out...</p>
    </div>
  );
}
