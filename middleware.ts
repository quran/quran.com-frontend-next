// middleware.ts
import geoip from 'geoip-lite';
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Get the user's IP address from various headers
  // In production, you might want to use X-Forwarded-For or similar
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || '';

  // Get the user's location based on IP
  const geo = geoip.lookup(ip);

  // Create a response object
  const response = NextResponse.next();

  // Add geo information to request headers that will be available in the page
  if (geo) {
    response.headers.set('x-user-country', geo.country || '');
    response.headers.set('x-user-region', geo.region || '');
    response.headers.set('x-user-city', geo.city || '');
    response.headers.set('x-user-timezone', geo.timezone || '');
  } else {
    // For debugging - set a fallback or log that geo lookup failed
    // eslint-disable-next-line no-console
    console.log('Geo lookup failed for IP:', ip);
    response.headers.set('x-geo-lookup-failed', 'true');
    response.headers.set('x-client-ip', ip);
  }

  return response;
}

// Apply middleware to specific paths
export const config = {
  matcher: '/country-example',
};
