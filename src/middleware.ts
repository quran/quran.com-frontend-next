import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle various request processing needs.
 *
 * @param {NextRequest} req - The incoming request
 * @returns {NextResponse} The response or continuation
 */
export default function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // If the request is for _next/data, return a 404 response
  // This forces a full page reload when a new deployment is made
  if (req.url.includes('_next/data')) {
    return new NextResponse(null, { status: 404 });
  }

  // Handle embed pages - allow them to be embedded in iframes
  if (pathname.startsWith('/embed/')) {
    const response = NextResponse.next();
    // Remove X-Frame-Options to allow embedding
    response.headers.delete('X-Frame-Options');
    // Set permissive CSP for embed pages to allow:
    // - frame-ancestors *: Allow embedding in any iframe
    // - 'unsafe-inline': Required for inline styles (font-family) and scripts
    // - *.qurancdn.com: Allow loading fonts and assets from CDN
    // - data: blob:: Required for font loading via FontFace API
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors *; default-src 'self' *.qurancdn.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; font-src 'self' *.qurancdn.com data: blob:; img-src * data:; connect-src *",
    );
    return response;
  }

  // For all other pages, add X-Frame-Options to prevent clickjacking
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  return response;
}
