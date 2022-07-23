import { NextApiRequest } from 'next';

type NextApiRequestWithTokens = NextApiRequest & {
  accessToken?: string;
  refreshToken?: string;
};

export default NextApiRequestWithTokens;
