import { GetServerSidePropsContext } from 'next';

const LOCALE_COOKIE_PERSISTENCE_PERIOD_MS = 86400000000000; // maximum milliseconds-since-the-epoch value https://stackoverflow.com/a/56980560/1931451

// eslint-disable-next-line import/prefer-default-export
export const setLocaleCookie = (newLocale: string) => {
  const date = new Date();
  date.setTime(LOCALE_COOKIE_PERSISTENCE_PERIOD_MS);
  // eslint-disable-next-line i18next/no-literal-string
  document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`;
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
export const setProxyCookies = (response: Response, context: GetServerSidePropsContext): void => {
  const proxyCookies = response.headers.get('set-cookie');
  if (proxyCookies) {
    const cookiesArray = proxyCookies.split(/,(?=\s*\w+=)/).map((cookie) => cookie.trim());
    context.res.setHeader('Set-Cookie', cookiesArray);
  }
};
