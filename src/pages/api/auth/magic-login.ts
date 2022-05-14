/* eslint-disable react-func/max-lines-per-function */
import { URLSearchParams } from 'url';

import cookie from 'cookie';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  USER_NAME_COOKIE_NAME,
} from 'src/utils/auth/constants';
import { setResponseCookie } from 'src/utils/cookies';
import { getAuthApiPath } from 'src/utils/url';

/**
 * A route that will be redirected to from our Node app
 * when it receives the callback from Google side.
 * We will receive the userId and in turn call
 * the generateToken API which will generate a
 * refreshToken and an accessToken.
 *
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 * @returns {Promise<NextApiResponse>}
 */
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<NextApiResponse> => {
  // TODO: we should validate this using joi and that it's a GET request
  const { id } = req.query;
  const response = await fetch(getAuthApiPath('tokens/generateToken'), {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: new URLSearchParams({
      userId: id,
    }).toString(),
  });
  // TODO: move this into a util
  if (response.status === 200) {
    const jsonResponse = await response.json();
    const { accessToken, refreshToken } = jsonResponse;
    let name: string;
    let accessTokenExpiresInSeconds: number;
    let refreshTokenExpiresInSeconds: number;
    try {
      const decodedAccessToken = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET,
      ) as JwtPayload;
      const decodedRefreshToken = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      ) as JwtPayload;
      const { name: userName } = decodedAccessToken;
      name = userName;
      accessTokenExpiresInSeconds = decodedAccessToken.exp - decodedAccessToken.iat;
      refreshTokenExpiresInSeconds = decodedRefreshToken.exp - decodedRefreshToken.iat;

      const cookies = [
        cookie.serialize(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: true,
          maxAge: accessTokenExpiresInSeconds,
          path: '/',
        }),
        cookie.serialize(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: true,
          maxAge: refreshTokenExpiresInSeconds,
          path: '/',
        }),
        cookie.serialize(USER_NAME_COOKIE_NAME, name, {
          secure: process.env.NODE_ENV !== 'development',
          maxAge: refreshTokenExpiresInSeconds,
          path: '/',
          sameSite: true,
        }),
      ];
      return setResponseCookie(res, cookies).status(200).redirect('/');
    } catch (err) {
      // TODO: handle error case
      return res.redirect('/');
    }
  }
  // TODO: handle error case
  return res.redirect('/');
};

export default handler;
