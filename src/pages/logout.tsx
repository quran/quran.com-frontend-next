import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { makeLogoutUrl } from '@/utils/auth/apiPaths';
import { SSO_PLATFORMS } from '@/utils/auth/constants';
import { buildNextPlatformUrl, buildRedirectBackUrl } from '@/utils/auth/login';
import { setProxyCookies } from '@/utils/cookies';
import { ROUTES } from '@/utils/navigation';
import { getBasePath } from '@/utils/url';

const PLATFORMS = SSO_PLATFORMS.map((platform) => {
  const url = new URL(ROUTES.LOGOUT, platform.url);
  return { id: platform.id, url: url.toString() };
});

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
  const nextPlatform = PLATFORMS.find((platform) => !visitedPlatformIds.includes(platform.id));

  if (nextPlatform) {
    const updatedVisited = [...visitedPlatformIds, nextPlatform.id];
    const redirectBackUrl = buildRedirectBackUrl(context.req.url, updatedVisited);
    const nextPlatformUrl = buildNextPlatformUrl(nextPlatform, redirectBackUrl);

    return {
      props: {},
      redirect: {
        destination: nextPlatformUrl.toString(),
        permanent: false,
      },
    };
  }

  // All platforms are covered, perform logout
  return performLogout(context, getBasePath());
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
  const { cookie } = context.req.headers;
  const response = await fetch(makeLogoutUrl(), {
    method: 'POST',
    headers: {
      cookie,
    },
    credentials: 'include',
    body: JSON.stringify({}),
  });

  setProxyCookies(response, context);

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
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { silent, redirectBack, visitedPlatform } = context.query;
  const visitedPlatformIds = visitedPlatform
    ? visitedPlatform.toString().split(',').filter(Boolean)
    : [];
  const SSO_ENABLED = process.env.SSO_ENABLED === 'true';

  try {
    if (SSO_ENABLED && silent !== '1') {
      return triggerPlatformLogouts(visitedPlatformIds, context);
    }

    // Call the main logout API
    return performLogout(context, decodeURIComponent(redirectBack as string));
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
  return null;
}
