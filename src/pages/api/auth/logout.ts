import cookie from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  USER_ID,
} from 'src/utils/auth/constants';
import { setResponseCookie } from 'src/utils/cookies';

const { COOKIES_DOMAIN } = process.env;

/**
 * A protected route that will be called when we want
 * to log the user out by un-settings auth-related
 * cookies.
 *
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 * @returns {Promise<void>}
 */
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const cookies = [
    cookie.serialize(ACCESS_TOKEN_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: true,
      maxAge: +new Date(0),
      domain: COOKIES_DOMAIN,
      path: '/',
    }),
    cookie.serialize(REFRESH_TOKEN_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: true,
      maxAge: +new Date(0),
      domain: COOKIES_DOMAIN,
      path: '/',
    }),
    cookie.serialize(USER_ID, '', {
      secure: process.env.NODE_ENV !== 'development',
      sameSite: true,
      maxAge: +new Date(0),
      domain: COOKIES_DOMAIN,
      path: '/',
    }),
  ];
  return setResponseCookie(res, cookies).json({ success: true });
};

export default handler;
