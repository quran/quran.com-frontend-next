/* eslint-disable react-func/max-lines-per-function */
import cookie from 'cookie';
import type { NextApiResponse } from 'next';

import withProtect from 'src/middleware/withProtect';
import withRefreshToken from 'src/middleware/withRefreshToken';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from 'src/utils/auth/constants';
import { setResponseCookie } from 'src/utils/cookies';
import { getAuthApiPath } from 'src/utils/url';
import NextApiRequestWithTokens from 'types/NextApiRequestWithTokens';

const handler = async (req: NextApiRequestWithTokens, res: NextApiResponse) => {
  const refreshToken = req.accessToken || req.cookies[ACCESS_TOKEN_COOKIE_NAME];
  const response = await fetch(getAuthApiPath('users/profile'), {
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      // eslint-disable-next-line i18next/no-literal-string
      Authorization: `bearer ${refreshToken}`,
    },
  });
  const jsonResponse = await response.json();
  // TODO: make this a util
  // if we just refreshed the token
  if (req.accessToken && req.refreshToken) {
    const cookies = [
      cookie.serialize(ACCESS_TOKEN_COOKIE_NAME, req.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: true,
        // maxAge: accessTokenExpiresInSeconds, // TODO: update this
        path: '/',
      }),
      cookie.serialize(REFRESH_TOKEN_COOKIE_NAME, req.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: true,
        // maxAge: refreshTokenExpiresInSeconds, // TODO: update this
        path: '/',
      }),
    ];

    return setResponseCookie(res, cookies).json({ success: true, user: jsonResponse });
  }
  return res.json({ success: true, user: jsonResponse });
};

export default withRefreshToken(withProtect(handler));
