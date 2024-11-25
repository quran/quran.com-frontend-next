import { EventEmitter } from 'events';

import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

import { X_AUTH_SIGNATURE, X_INTERNAL_CLIENT, X_TIMESTAMP } from '@/api';
import generateSignature from '@/utils/auth/signature';

// Define error messages in a constant object
const ERROR_MESSAGES = {
  PROXY_ERROR: 'Proxy error',
  PROXY_HANDLER_ERROR: 'Proxy handler error',
};

// This line increases the default maximum number of event listeners for the EventEmitter to a better number like 20.
// It is necessary to prevent memory leak warnings when multiple listeners are added,
// which can occur in a proxy setup like this where multiple requests are handled concurrently.
EventEmitter.defaultMaxListeners = Number(process.env.PROXY_DEFAULT_MAX_LISTENERS) || 100;

// This file sets up a proxy middleware for API requests. It is needed to forward requests from the frontend
// to the backend server, allowing for features like cookie handling and request body fixing, which are essential
// for maintaining session state and ensuring correct request formatting while in a cross domain env.
const apiProxy = createProxyMiddleware<NextApiRequest, NextApiResponse>({
  target: process.env.API_GATEWAY_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/proxy': '' }, // eslint-disable-line @typescript-eslint/naming-convention
  secure: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production', // Disable SSL verification to avoid UNABLE_TO_VERIFY_LEAF_SIGNATURE error for dev
  logger: console,

  on: {
    proxyReq: (proxyReq, req) => {
      // Attach cookies from the request to the proxy request
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }

      // Generate and attach signature headers
      const requestUrl = `${process.env.API_GATEWAY_URL}${req.url}`;
      const { signature, timestamp } = generateSignature(req, requestUrl);

      proxyReq.setHeader(X_AUTH_SIGNATURE, signature);
      proxyReq.setHeader(X_TIMESTAMP, timestamp);
      proxyReq.setHeader(X_INTERNAL_CLIENT, process.env.INTERNAL_CLIENT_ID);

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
