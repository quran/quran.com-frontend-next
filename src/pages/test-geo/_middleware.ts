/* eslint-disable import/prefer-default-export */
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { geo } = req;

  return new Response(JSON.stringify({ message: 'hello world!', geo }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
