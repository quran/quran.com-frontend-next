import { EventEmitter } from 'events';

import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

import generateSignature from '@/utils/auth/signature';
// Define error messages in a constant object
const ERROR_MESSAGES = {
  PROXY_ERROR: 'Proxy error',
  PROXY_HANDLER_ERROR: 'Proxy handler error',
};

const INTERNAL_CLIENT_HEADERS = {
  AUTH_SIGNATURE: 'x-auth-signature',
  TIMESTAMP: 'x-timestamp',
  INTERNAL_CLIENT: 'x-internal-client',
};

// Increase the max listeners to avoid memory leak
EventEmitter.defaultMaxListeners = 20;

const apiProxy = createProxyMiddleware<NextApiRequest, NextApiResponse>({
  target: process.env.NEXT_PUBLIC_AUTH_BASE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/proxy': '' }, // eslint-disable-line @typescript-eslint/naming-convention
  secure: false, // Disable SSL verification to avoid UNABLE_TO_VERIFY_LEAF_SIGNATURE error
  logger: console,

  on: {
    proxyReq: (proxyReq, req) => {
      // Attach cookies from the request to the proxy request
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }

      // Generate and attach signature headers
      const { signature, timestamp } = generateSignature(req);

      proxyReq.setHeader(INTERNAL_CLIENT_HEADERS.AUTH_SIGNATURE, signature);
      proxyReq.setHeader(INTERNAL_CLIENT_HEADERS.TIMESTAMP, timestamp);
      proxyReq.setHeader(INTERNAL_CLIENT_HEADERS.INTERNAL_CLIENT, process.env.INTERNAL_CLIENT_ID);

      // Fix the request body if bodyParser is involved
      fixRequestBody(proxyReq, req);
    },

    proxyRes: (proxyRes, req, res) => {
      // Set cookies from the proxy response to the original response
      const proxyCookies = proxyRes.headers['set-cookie'];
      if (proxyCookies) {
        res.setHeader('Set-Cookie', proxyCookies);
      }
    },

    error: (err, req, res) => {
      res.end(() => ({ error: ERROR_MESSAGES.PROXY_ERROR, message: err.message }));
    },
  },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  apiProxy(req, res, (err) => {
    if (err) {
      res.status(500).json({ error: ERROR_MESSAGES.PROXY_HANDLER_ERROR, message: err.message });
    }
  });
}
