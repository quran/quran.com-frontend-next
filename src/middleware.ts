import { NextRequest, NextResponse } from 'next/server';

export default function middleware(req: NextRequest) {
  // If the request is for _next/data, return a 404 response
  // This forces a full page reload when a new deployment is made
  if (req.url.includes('_next/data')) {
    return new NextResponse(null, { status: 404 });
  }

  // Check for ramadan2026 and ramadanchallenge (case-insensitive)
  const { pathname } = req.nextUrl;
  const lowerPathname = pathname.toLowerCase();

  const caseInsensitiveRoutes = ['/ramadan2026', '/ramadanchallenge'];
  const isMatch = caseInsensitiveRoutes.some((route) => lowerPathname.includes(route));

  // If the path contains the target routes (case-insensitive) but is not already fully lowercase
  if (isMatch && pathname !== lowerPathname) {
    const url = req.nextUrl.clone();
    url.pathname = lowerPathname;
    return NextResponse.redirect(url);
  }

  // Continue with any other middleware processing
  return NextResponse.next();
}
