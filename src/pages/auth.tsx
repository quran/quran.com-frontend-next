import { useEffect } from 'react';

import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { fetcher } from '@/api';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import AuthError from '@/types/AuthError';
import { makeRedirectTokenUrl } from '@/utils/auth/apiPaths';
import { SSO_ENABLED, SSO_PLATFORMS } from '@/utils/auth/constants';
import { buildNextPlatformUrl, buildRedirectBackUrl } from '@/utils/auth/login';
import { setProxyCookies } from '@/utils/cookies';
import { ROUTES } from '@/utils/navigation';

interface AuthProps {
  error?: string;
}

const LOGIN_URL = '/login';

const PLATFORMS = SSO_PLATFORMS.map((platform) => {
  const url = new URL(ROUTES.AUTH, platform.url);
  return { id: platform.id, url: url.toString() };
});

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

/* eslint-disable react-func/max-lines-per-function */
/**
 * Handles token-based redirection, sets cookies, and manages error state.
 *
 * @param {GetServerSidePropsContext} context - The context object containing request and response information.
 * @param {string} token - The token used for authentication.
 * @param {string} destination - The destination URL for redirection.
 * @returns {Promise<GetServerSidePropsResult<any>>} - A promise that resolves to the server-side props result.
 */
const handleTokenRedirection = async (
  context: GetServerSidePropsContext,
  token: string,
  destination: string,
): Promise<GetServerSidePropsResult<any>> => {
  try {
    const response = await fetchToken(token, context);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const { silent, redirectBack } = context.query;

    setProxyCookies(response, context);

    if (silent === '1' && redirectBack) {
      return {
        props: {},
        redirect: {
          destination: decodeURIComponent(redirectBack as string),
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
 * @returns {Promise<GetServerSidePropsResult<any>>} - A promise that resolves to the server-side props result.
 *
 */
const handleSSORedirection = async (
  context: GetServerSidePropsContext,
  token: string,
  destination: string,
): Promise<GetServerSidePropsResult<any>> => {
  const { visitedPlatform: visitedPlatformQuery } = context.query;
  // Use .toString().split(',') to get visited platform IDs
  const visitedPlatformIds = (visitedPlatformQuery || '').toString().split(',').filter(Boolean);
  const nextPlatform = PLATFORMS.find((platform) => !visitedPlatformIds.includes(platform.id));

  if (nextPlatform) {
    // Prepare updated visitedPlatform IDs
    const updatedVisited = [...visitedPlatformIds, nextPlatform.id];
    const redirectBackUrl = buildRedirectBackUrl(context.req.url, updatedVisited, token);
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
  const { r, token, silent } = context.query;
  const redirectUrl = (r || '/') as string;
  const destination = redirectUrl === LOGIN_URL ? '/' : redirectUrl;

  if (token) {
    if (SSO_ENABLED && silent !== '1') {
      return handleSSORedirection(context, token as string, destination);
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
