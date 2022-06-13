/* eslint-disable import/prefer-default-export */
import { NextApiResponse } from 'next';

const LOCALE_COOKIE_PERSISTENCE_PERIOD_MS = 86400000000000; // maximum milliseconds-since-the-epoch value https://stackoverflow.com/a/56980560/1931451

/**
 * Set the cookies of the response.
 *
 * @param {NextApiResponse} response
 * @param {number | string | ReadonlyArray<string>} cookies
 * @returns {NextApiResponse}
 */
export const setResponseCookie = (
  response: NextApiResponse,
  cookies: number | string | ReadonlyArray<string>,
): NextApiResponse => {
  return response.setHeader('Set-Cookie', cookies);
};

export const setLocaleCookie = (newLocale: string) => {
  const date = new Date();
  date.setTime(LOCALE_COOKIE_PERSISTENCE_PERIOD_MS);
  // eslint-disable-next-line i18next/no-literal-string
  document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`;
};
