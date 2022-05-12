import cookie from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

import withProtect from 'src/middleware/withProtect';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  USER_NAME_COOKIE_NAME,
} from 'src/utils/auth/constants';
import { setResponseCookie } from 'src/utils/cookies';

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
      path: '/',
    }),
    cookie.serialize(REFRESH_TOKEN_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: true,
      maxAge: +new Date(0),
      path: '/',
    }),
    cookie.serialize(USER_NAME_COOKIE_NAME, '', {
      secure: process.env.NODE_ENV !== 'development',
      sameSite: true,
      maxAge: +new Date(0),
      path: '/',
    }),
  ];
  return setResponseCookie(res, cookies).json({ success: true });
};

export default withProtect(handler);
