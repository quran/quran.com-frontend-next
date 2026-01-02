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
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      // Allow eval in development for Next.js React Refresh inside iframes.
      ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
    ].join(' ');
    // Set CSP for embed pages:
    // - frame-ancestors *: Allow embedding in any iframe
    // - 'unsafe-inline' for styles: Required for inline @font-face definitions in dangerouslySetInnerHTML
    // - verses.quran.foundation: CDN for QCF fonts (King Fahad, Tajweed)
    // - *.qurancdn.com: Legacy CDN for other assets
    // - data: blob:: Required for font loading via FontFace API
    // Note: 'unsafe-inline' for scripts is required for widget innerHTML injection on external sites.
    // This is safe because all content comes from validated API responses with proper sanitization.
    response.headers.set(
      'Content-Security-Policy',
      `frame-ancestors *; default-src 'self' *.qurancdn.com verses.quran.foundation; style-src 'self' 'unsafe-inline'; script-src ${scriptSrc}; font-src 'self' *.qurancdn.com verses.quran.foundation data: blob:; img-src * data:; connect-src *; media-src 'self' https://download.quranicaudio.com`,
    );
    return response;
  }

  /**
   * For all other pages (non-embed), add X-Frame-Options: SAMEORIGIN to prevent clickjacking attacks.
   * This header ensures that these pages cannot be embedded in iframes on external sites,
   * protecting users from UI redress/clickjacking vulnerabilities.
   * Note: This is intentionally not set for /embed/ pages, which are designed to be embedded.
   */
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  return response;
}
