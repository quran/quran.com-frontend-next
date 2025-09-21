import { useEffect } from 'react';

import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { fetcher } from '@/api';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import AuthError from '@/types/AuthError';
import QueryParam from '@/types/QueryParam';
import { makeRedirectTokenUrl } from '@/utils/auth/apiPaths';
import { SSO_ENABLED } from '@/utils/auth/constants';
import { buildNextPlatformUrl, buildRedirectBackUrl, getSsoPlatformPath } from '@/utils/auth/login';
import { setProxyCookies } from '@/utils/cookies';
import { ROUTES } from '@/utils/navigation';
import { resolveSafeRedirect } from '@/utils/url';

interface AuthProps {
  error?: string;
}

/**
 * Auth component that handles displaying authentication errors and redirects.
 *
 * @param {AuthProps} props - The properties for the Auth component.
 * @returns {null} - This component does not render anything.
 */
const Auth: React.FC<AuthProps> = ({ error }) => {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation('login');

  useEffect(() => {
    if (error) {
      const errorMessage = t(`login-error.${error}`);
      toast(errorMessage, {
        status: ToastStatus.Error,
      });
      router.replace('/');
    }
  }, [error, toast, t, router]);

  return null;
};

/**
 * Handles token-based redirection, sets cookies, and manages error state.
 *
 * @param {GetServerSidePropsContext} context - The context object containing request and response information.
 * @param {string} token - The token used for authentication.
 * @param {string} destination - The destination URL for redirection.
 * @returns {Promise<GetServerSidePropsResult<AuthProps>>} - A promise that resolves to the server-side props result.
 */
/* eslint-disable react-func/max-lines-per-function */
const handleTokenRedirection = async (
  context: GetServerSidePropsContext,
  token: string,
  destination: string,
): Promise<GetServerSidePropsResult<AuthProps>> => {
  try {
    const response = await fetchToken(token, context);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const { [QueryParam.SILENT]: silent, [QueryParam.REDIRECTBACK]: redirectBack } = context.query;

    setProxyCookies(response, context);

    if (silent === '1' && redirectBack) {
      // Sanitize redirectBack - external URLs are allowed for SSO platform redirects
      const safeRedirectUrl = resolveSafeRedirect(decodeURIComponent(redirectBack as string));
      return {
        props: {},
        redirect: {
          destination: safeRedirectUrl,
          permanent: false,
        },
      };
    }

    return {
      props: {},
      redirect: {
        destination,
        permanent: false,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error during token redirection:', error);
    return {
      props: {
        error: AuthError.AuthenticationError,
      },
    };
  }
};

/* eslint-disable react-func/max-lines-per-function */
/**
 * Handles the SSO redirection process based on the provided token.
 * If not silent, builds an array of platforms and redirects to them one by one
 * based on the visitedPlatform query. Each platform returns back with redirectBack
 * and visitedPlatform query updated.
 *
 * The visitedPlatform query will be used when the other platform redirects back here,
 * indicating which platforms have already been visited. Therefore, visitedPlatform
 * should be included in the redirectBack URL we pass to the next platform.
 *
 * @param {GetServerSidePropsContext} context - The context object containing request and response information.
 * @param {string} token - The token used for authentication.
 * @param {string} destination - The destination URL for redirection.
 * @param {string} [redirectUrl] - The original redirect URL from the query parameters.
 * @returns {Promise<GetServerSidePropsResult<AuthProps>>} - A promise that resolves to the server-side props result.
 *
 */
const handleSSORedirection = async (
  context: GetServerSidePropsContext,
  token: string,
  destination: string,
  redirectUrl?: string,
): Promise<GetServerSidePropsResult<AuthProps>> => {
  const { [QueryParam.VISITEDPLATFORM]: visitedPlatformQuery } = context.query;
  // Use .toString().split(',') to get visited platform IDs
  const visitedPlatformIds = (visitedPlatformQuery || '')
    .toString()
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  const ssoPlatforms = getSsoPlatformPath(ROUTES.AUTH);
  const nextPlatform = ssoPlatforms.find((platform) => !visitedPlatformIds.includes(platform.id));

  if (nextPlatform) {
    // Prepare updated visitedPlatform IDs
    const updatedVisited = [...visitedPlatformIds, nextPlatform.id];
    const redirectBackUrl = buildRedirectBackUrl(ROUTES.AUTH, updatedVisited, token, redirectUrl);
    const nextPlatformUrl = buildNextPlatformUrl(nextPlatform, redirectBackUrl, token);

    return {
      props: {},
      redirect: {
        destination: nextPlatformUrl.toString(),
        permanent: false,
      },
    };
  }

  return handleTokenRedirection(context, token, destination);
};

/**
 * Fetches the token from the API and returns the response.
 *
 * @param {string} token - The token used for authentication.
 * @param {GetServerSidePropsContext} context - The context object containing request and response information.
 * @returns {Promise<Response>} - A promise that resolves to the API response.
 */
const fetchToken = async (token: string, context: GetServerSidePropsContext): Promise<Response> => {
  return fetcher(
    makeRedirectTokenUrl(token),
    {
      method: 'GET',
      headers: {
        cookie: context.req.headers.cookie || '',
      },
      credentials: 'include',
    },
    true,
  );
};

/**
 * Next.js getServerSideProps for authentication and SSO redirection.
 *
 * @param {GetServerSidePropsContext} context - The context object containing request and response information.
 * @returns {Promise<GetServerSidePropsResult<any>>} - A promise that resolves to the server-side props result.
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    [QueryParam.REDIRECT_TO]: r,
    [QueryParam.TOKEN]: token,
    [QueryParam.SILENT]: silent,
  } = context.query;
  const redirectUrl = (r || '/') as string;
  // Sanitize redirect URL to prevent open redirect vulnerabilities
  const destination = resolveSafeRedirect(redirectUrl);

  if (token) {
    if (SSO_ENABLED && silent !== '1') {
      return handleSSORedirection(context, token as string, destination, redirectUrl);
    }

    return handleTokenRedirection(context, token as string, destination);
  }

  return {
    props: {},
    redirect: {
      destination,
      permanent: false,
    },
  };
};

export default Auth;
