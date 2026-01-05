/* eslint-disable react-func/max-lines-per-function */
import { NextApiRequest, NextApiResponse } from 'next';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import handler from './revalidate';

type MockResponse = NextApiResponse & {
  statusCode: number;
  jsonPayload: unknown;
  headers: Record<string, string>;
  revalidate: (path: string) => Promise<void>;
};

const createMockResponse = (): MockResponse => {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    jsonPayload: undefined as unknown,
  } as MockResponse;

  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };

  res.json = (payload: unknown) => {
    res.jsonPayload = payload;
    return res;
  };

  res.setHeader = (name: string, value: string) => {
    res.headers[name] = value;
  };

  res.revalidate = vi.fn(async () => undefined);

  return res;
};

const createMockRequest = (overrides: Partial<NextApiRequest> = {}): NextApiRequest =>
  ({
    method: 'GET',
    query: {},
    headers: {},
    ...overrides,
  } as NextApiRequest);

const ORIGINAL_REVALIDATION_TOKEN = process.env.REVALIDATION_TOKEN;

beforeEach(() => {
  process.env.REVALIDATION_TOKEN = 'test-token';
});

afterEach(() => {
  if (ORIGINAL_REVALIDATION_TOKEN === undefined) {
    delete process.env.REVALIDATION_TOKEN;
  } else {
    process.env.REVALIDATION_TOKEN = ORIGINAL_REVALIDATION_TOKEN;
  }
});

describe('revalidate API route', () => {
  it('rejects non-GET requests', async () => {
    const req = createMockRequest({ method: 'POST' });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('GET');
  });

  it('rejects requests with invalid token', async () => {
    const req = createMockRequest({
      query: { token: 'wrong-token', path: '/test' },
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
  });

  it('rejects requests with missing path', async () => {
    const req = createMockRequest({
      query: { token: 'test-token' },
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
  });

  it('revalidates when token and path are valid', async () => {
    const req = createMockRequest({
      query: { token: 'test-token', path: '/test' },
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.revalidate).toHaveBeenCalledWith('/test');
    expect((res.jsonPayload as { revalidated?: boolean }).revalidated).toBe(true);
  });
});
