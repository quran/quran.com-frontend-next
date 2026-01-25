import { EventEmitter } from 'events';

import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

import generateSignature from '@/utils/auth/signature';
import {
  X_AUTH_SIGNATURE,
  X_INTERNAL_CLIENT,
  X_TIMESTAMP,
  X_PROXY_SIGNATURE,
  X_PROXY_TIMESTAMP,
} from '@/utils/headers';

const ERROR_MESSAGES = {
  PROXY_ERROR: 'Proxy error',
  PROXY_HANDLER_ERROR: 'Proxy handler error',
  FORBIDDEN: 'Forbidden',
};

const ALLOWED_DOMAINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((domain) => domain.trim());

// This line increases the default maximum number of event listeners for the EventEmitter to a better number like 20.
// It is necessary to prevent memory leak warnings when multiple listeners are added,
// which can occur in a proxy setup like this where multiple requests are handled concurrently.
EventEmitter.defaultMaxListeners = Number(process.env.PROXY_DEFAULT_MAX_LISTENERS) || 100;

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return false;
  const url = new URL(origin);
  const { hostname } = url;
  return ALLOWED_DOMAINS.includes(hostname);
};

const handleProxyReq = (proxyReq, req, res) => {
  const origin = req.headers.origin || req.headers.referer || '';
  if (origin) {
    if (!isOriginAllowed(origin)) {
      res.status(403).send({ error: ERROR_MESSAGES.FORBIDDEN });
      return;
    }
  } else if (!verifySignature(req, res)) {
    return;
  }

  attachCookies(proxyReq, req);
  attachSignatureHeaders(proxyReq, req);
  fixRequestBody(proxyReq, req);
};

const verifySignature = (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const requestUrl = `${protocol}://${req.headers.host}/api/proxy${req.url}`;
  const timestampHeader = req.headers[X_PROXY_TIMESTAMP] as string;
  const { signature } = generateSignature(
    req,
    requestUrl,
    process.env.PROXY_SIGNATURE_TOKEN as string,
    timestampHeader,
  );

  if (req.headers[X_PROXY_SIGNATURE] !== signature) {
    res.status(403).send({ error: ERROR_MESSAGES.FORBIDDEN });
    return false;
  }
  return true;
};

const attachCookies = (proxyReq, req) => {
  if (req.headers.cookie) {
    proxyReq.setHeader('Cookie', req.headers.cookie);
  }
};

const attachSignatureHeaders = (proxyReq, req) => {
  const requestUrl = `${process.env.API_GATEWAY_URL}${req.url}`;
  const { signature, timestamp } = generateSignature(
    req,
    requestUrl,
    process.env.SIGNATURE_TOKEN as string,
  );

  proxyReq.setHeader(X_AUTH_SIGNATURE, signature);
  proxyReq.setHeader(X_TIMESTAMP, timestamp);
  proxyReq.setHeader(X_INTERNAL_CLIENT, process.env.INTERNAL_CLIENT_ID);
};

const apiProxy = createProxyMiddleware<NextApiRequest, NextApiResponse>({
  target: process.env.API_GATEWAY_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/proxy': '' }, // eslint-disable-line @typescript-eslint/naming-convention
  secure: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production', // Disable SSL verification to avoid UNABLE_TO_VERIFY_LEAF_SIGNATURE error for dev
  logger: console,

  on: {
    proxyReq: handleProxyReq,

    proxyRes: (proxyRes, req, res) => {
      // Set cookies from the proxy response to the original response
      const proxyCookies = proxyRes.headers['set-cookie'];
      if (proxyCookies) {
        res.setHeader('Set-Cookie', proxyCookies);
      }

      // Prevent intermediate proxy caching (Traefik, nginx, etc.)
      // This ensures fresh data flows through from the API Gateway's CF cache
      // Note: This does NOT affect CF caching at the API Gateway level
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    },

    error: (err, req, res) => {
      // BUGFIX: The original code was calling res.end() with a function that returns an object:
      // res.end(() => ({ error: ERROR_MESSAGES.PROXY_ERROR, message: err.message }))
      //
      // This caused a TypeError because res.end() expects a string, Buffer, or ArrayBuffer,
      // not a function. The function was being passed as the response body, which caused:
      // "The 'string' argument must be of type string... Received type function"
      //
      // The fix is to properly send JSON responses based on the response object type:

      // Check if res is a NextApiResponse (has status method) or a Socket
      if ('status' in res && typeof res.status === 'function') {
        res.status(500).json({ error: ERROR_MESSAGES.PROXY_ERROR, message: err.message });
      } else {
        // For Socket or other types, just end the response with a stringified error
        res.end(JSON.stringify({ error: ERROR_MESSAGES.PROXY_ERROR, message: err.message }));
      }
    },
  },
});

// Maximum request body size for API routes, aligned with backend limit for profile picture uploads
const API_BODY_SIZE_LIMIT = process.env.API_BODY_SIZE_LIMIT || '8mb';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: API_BODY_SIZE_LIMIT,
    },
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  apiProxy(req, res, (err) => {
    if (err) {
      res.status(500).json({ error: ERROR_MESSAGES.PROXY_HANDLER_ERROR, message: err.message });
    }
  });
}
