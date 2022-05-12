import { NextApiHandler, NextApiResponse } from 'next';

import { ACCESS_TOKEN_COOKIE_NAME } from 'src/utils/auth/constants';
import NextApiRequestWithTokens from 'types/NextApiRequestWithTokens';

/**
 * This is a middleware that will check if there is
 * accessToken in the cookies or in the received request
 * (when we have just refreshed the token) and if neither
 * exist, we will return an error since this is meant to act
 * like a guard for a protected API routes.
 *
 * @param {NextApiHandler} handler
 * @returns {Promise<void>}
 */
const withProtect = (handler: NextApiHandler) => {
  return async (req: NextApiRequestWithTokens, res: NextApiResponse): Promise<void> => {
    if (!req.cookies[ACCESS_TOKEN_COOKIE_NAME] && !req.accessToken) {
      return res.status(401).json({ success: false });
    }
    return handler(req, res);
  };
};

export default withProtect;
