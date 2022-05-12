/* eslint-disable import/prefer-default-export */
import { NextApiResponse } from 'next';

// TODO: convert every function that calls this into a common util
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
