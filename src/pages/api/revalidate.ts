/* eslint-disable react-func/max-lines-per-function */
import { NextApiRequest, NextApiResponse } from 'next';

const ERROR_MESSAGES = {
  INVALID_METHOD: 'Method not allowed',
  INVALID_TOKEN: 'Invalid token',
  MISSING_PATH: 'Missing path to revalidate',
  MISSING_SERVER_TOKEN: 'Revalidation token is not configured',
  REVALIDATION_FAILED: 'Revalidation failed',
  INVALID_PATH: 'Invalid path to revalidate',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res
      .status(405)
      .json({ revalidated: false, now: Date.now(), message: ERROR_MESSAGES.INVALID_METHOD });
  }

  const configuredToken = process.env.REVALIDATION_TOKEN;
  if (!configuredToken) {
    return res.status(500).json({
      revalidated: false,
      now: Date.now(),
      message: ERROR_MESSAGES.MISSING_SERVER_TOKEN,
    });
  }

  const headerTokenValue = req.headers['x-revalidate-token'];
  const headerToken = Array.isArray(headerTokenValue) ? headerTokenValue[0] : headerTokenValue;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : undefined;
  const tokenQueryValue = req.query.token;
  const tokenQuery = Array.isArray(tokenQueryValue) ? tokenQueryValue[0] : tokenQueryValue;
  const secretQueryValue = req.query.secret;
  const secretQuery = Array.isArray(secretQueryValue) ? secretQueryValue[0] : secretQueryValue;
  const token = headerToken || bearerToken || tokenQuery || secretQuery;
  if (!token || token !== configuredToken) {
    return res
      .status(401)
      .json({ revalidated: false, now: Date.now(), message: ERROR_MESSAGES.INVALID_TOKEN });
  }

  const pathQueryValue = req.query.path;
  const path = Array.isArray(pathQueryValue) ? pathQueryValue[0] : pathQueryValue;
  if (!path) {
    return res
      .status(400)
      .json({ revalidated: false, now: Date.now(), message: ERROR_MESSAGES.MISSING_PATH });
  }

  if (!path.startsWith('/')) {
    return res
      .status(400)
      .json({ revalidated: false, now: Date.now(), message: ERROR_MESSAGES.INVALID_PATH });
  }

  try {
    await res.revalidate(path);
    return res.status(200).json({ revalidated: true, now: Date.now(), path });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Revalidation failed', error);
    return res.status(500).json({
      revalidated: false,
      now: Date.now(),
      message: ERROR_MESSAGES.REVALIDATION_FAILED,
    });
  }
}
