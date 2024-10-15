import { NextRequest, NextResponse } from 'next/server';

const middleware = async (request: NextRequest) => {
  const country = request.geo?.country || 'US';
  request.nextUrl.searchParams.set('country', country);
  return NextResponse.rewrite(request.nextUrl);
};

export default middleware;
