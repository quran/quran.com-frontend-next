// middleware.ts
import geoip from 'geoip-lite';
import { NextRequest, NextResponse } from 'next/server';
import requestIp from 'request-ip';

export function middleware(req: NextRequest) {
  // Get the user's IP address
  const clientIp = requestIp.getClientIp(req) || '';

  // Get the user's location based on IP
  const geo = geoip.lookup(clientIp);

  // Create a response object
  const response = NextResponse.next();

  // Add geo information to request headers that will be available in the page
  if (geo) {
    response.headers.set('x-user-country', geo.country || '');
    response.headers.set('x-user-region', geo.region || '');
    response.headers.set('x-user-city', geo.city || '');
    response.headers.set('x-user-timezone', geo.timezone || '');
  }

  return response;
}

// Apply middleware to specific paths
export const config = {
  matcher: '/country-example',
};
