import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
  const region = req.headers.get('x-vercel-ip-country-region') || 'Unknown';
  const city = req.headers.get('x-vercel-ip-city') || 'Unknown';
  const ip = req.headers.get('x-real-ip') || 'Unknown';

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-custom-country', country);
  requestHeaders.set('x-custom-region', region);
  requestHeaders.set('x-custom-city', city);
  requestHeaders.set('x-custom-ip', ip);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// Run middleware on all requests
export const config = {
  matcher: '/:path*',
};
