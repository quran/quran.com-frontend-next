import { useEffect } from 'react';

import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import AuthError from '@/types/AuthError';
import { makeRedirectTokenUrl } from '@/utils/auth/apiPaths';

interface AuthProps {
  error?: string;
}

const LOGIN_URL = '/login';

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
 * Handles the redirection process based on the provided token.
 * It fetches the token from the server, sets the necessary cookies,
 * and redirects the user to the specified URL.
 *
 * @param {GetServerSidePropsContext} context - The context object containing request and response information.
 * @param {string} token - The token used for authentication and redirection.
 * @param {string} destination - The URL to redirect the user to after successful token handling.
 * @returns {Promise<GetServerSidePropsResult<any>>} - A promise that resolves to the server-side props result,
 * which includes either a redirection or an error message.
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

    setProxyCookies(response, context);

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

/**
 * Fetches a token from the server using the provided base URL and token.
 *
 * @param {string} token - The token to be included in the request URL.
 * @param {GetServerSidePropsContext} context - The context object containing request and response information.
 * @returns {Promise<Response>} - A promise that resolves to the response from the fetch request.
 */
const fetchToken = async (token: string, context: GetServerSidePropsContext): Promise<Response> => {
  return fetch(makeRedirectTokenUrl(token), {
    method: 'GET',
    headers: {
      cookie: context.req.headers.cookie || '',
    },
    credentials: 'include',
  });
};

/**
 * Sets cookies from the proxy response to the server-side response.
 *
 * This function extracts the 'set-cookie' header from the proxy response,
 * splits it into individual cookies, and sets them in the server-side response
 * headers. This is necessary to ensure that cookies set by the proxy are
 * correctly forwarded to the client.
 *
 * @param {Response} response - The response object from the proxy request.
 * @param {GetServerSidePropsContext} context - The context object containing request and response information.
 */
const setProxyCookies = (response: Response, context: GetServerSidePropsContext): void => {
  const proxyCookies = response.headers.get('set-cookie');
  if (proxyCookies) {
    const cookiesArray = proxyCookies.split(/,(?=\s*\w+=)/).map((cookie) => cookie.trim());
    context.res.setHeader('Set-Cookie', cookiesArray);
  }
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { r, token } = context.query;
  const redirectUrl = (r || '/') as string;
  const destination = redirectUrl === LOGIN_URL ? '/' : redirectUrl;

  if (token) {
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
