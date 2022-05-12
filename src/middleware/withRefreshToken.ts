/* eslint-disable no-param-reassign */
/* eslint-disable react-func/max-lines-per-function */
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiHandler, NextApiResponse } from 'next';

import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from 'src/utils/auth/constants';
import { getAuthApiPath } from 'src/utils/url';
import NextApiRequestWithTokens from 'types/NextApiRequestWithTokens';

const EXPIRY_THRESHOLD_SECONDS = 20;

/**
 * This middleware makes sure we refresh the accessToken if it has expired
 * already or about to expire and attaches the new ones in the request which
 * will be consumed by the downstream handlers that will set the `Set-Cookie`
 * response which will be consumed by the browser.
 *
 * @param {NextApiHandler} handler
 * @returns {Promise<void>}
 */
const withRefreshToken = (handler: NextApiHandler) => {
  return async (req: NextApiRequestWithTokens, res: NextApiResponse) => {
    // if the old accessToken has expired and has been removed
    if (!req.cookies[ACCESS_TOKEN_COOKIE_NAME]) {
      try {
        const response = await fetch(getAuthApiPath('tokens/refreshToken'), {
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: new URLSearchParams({
            refreshToken: req.cookies[REFRESH_TOKEN_COOKIE_NAME],
          }).toString(),
        });
        const responseJson = await response.json();
        const { accessToken, refreshToken, error } = responseJson;
        req.accessToken = accessToken;
        req.refreshToken = refreshToken;
        if (error === true) {
          // TODO: handle error cases and remove all tokens from the cookies
          return res.status(401).json({
            success: false,
            message: 'Something went wrong',
          });
        }
        return handler(req, res);
      } catch (error) {
        // TODO: handle error cases and remove all tokens from the cookies
        return res.status(401).json({
          success: false,
          message: 'Something went wrong',
        });
      }
    } else {
      try {
        const decodedAccessToken = jwt.verify(
          req.cookies[ACCESS_TOKEN_COOKIE_NAME],
          process.env.JWT_ACCESS_SECRET,
        ) as JwtPayload;
        const timeToAccessTokenExpirySeconds =
          decodedAccessToken.exp - Math.floor(Date.now() / 1000);
        // if the accessToken is about to expire
        if (timeToAccessTokenExpirySeconds <= EXPIRY_THRESHOLD_SECONDS) {
          // TODO: move this to a util along with the above one
          const response = await fetch(getAuthApiPath('tokens/refreshToken'), {
            method: 'post',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: new URLSearchParams({
              refreshToken: req.cookies[REFRESH_TOKEN_COOKIE_NAME],
            }).toString(),
          });
          const responseJson = await response.json();
          const { accessToken, refreshToken } = responseJson;
          req.accessToken = accessToken;
          req.refreshToken = refreshToken;
        }
        return handler(req, res);
      } catch (error) {
        // TODO: handle error cases and remove all tokens from the cookies
        return res.status(401).json({
          success: false,
          message: 'Something went wrong',
        });
      }
    }
  };
};

export default withRefreshToken;
