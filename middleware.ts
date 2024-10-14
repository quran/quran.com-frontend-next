import { NextRequest, NextResponse } from 'next/server';

// run only on homepage
export const config = {
  matcher: '/',
};

const middleware = async (req: NextRequest) => {
  const { nextUrl: url, geo } = req;
  const country = geo.country || 'US';

  url.searchParams.set('country', country);

  return NextResponse.rewrite(url);
};

export default middleware;
