import { NextRequest, NextResponse } from 'next/server';

export default function middleware(req: NextRequest) {
  // If the request is for _next/data, return a 404 response
  // This forces a full page reload when a new deployment is made
  if (req.url.includes('_next/data')) {
    return new NextResponse(null, { status: 404 });
  }

  // Continue with any other middleware processing
  return NextResponse.next();
}
