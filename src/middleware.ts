import { NextRequest, NextResponse } from 'next/server';

import {
  CLOUD_FLARE_HEADER,
  COUNTRY_COOKIE_NAME,
  COUNTRY_RESPONSE_HEADER,
} from '@/constants/country';

export default function middleware(req: NextRequest) {
  // If the request is for _next/data, return a 404 response
  // This forces a full page reload when a new deployment is made
  if (req.url.includes('_next/data')) {
    return new NextResponse(null, { status: 404 });
  }

  const country = req.headers.get(CLOUD_FLARE_HEADER) ?? 'unknown';
  const response = NextResponse.next();

  response.cookies.set({
    name: COUNTRY_COOKIE_NAME,
    value: country,
    path: '/',
    sameSite: 'lax',
  });

  response.headers.set(COUNTRY_RESPONSE_HEADER, country);

  return response;
}
