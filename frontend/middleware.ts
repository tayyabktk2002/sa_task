import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const url = request.nextUrl.clone();
  const { pathname, searchParams } = request.nextUrl;

  const inviteToken = searchParams.get('invite_token');

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (inviteToken && pathname === '/') {
    url.pathname = '/signup';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)',],
};