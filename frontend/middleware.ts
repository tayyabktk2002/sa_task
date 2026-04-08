import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/signup', '/invite-signup', '/invitesignup'];

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('token');
  const url = request.nextUrl.clone();
  const { pathname, searchParams } = request.nextUrl;

  const inviteToken = searchParams.get('invite_token');

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  const isTokenExpired = (tokenValue: string) => {
    try {
      const parts = tokenValue.split('.');
      if (parts.length < 2) return true;
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad) base64 += '='.repeat(4 - pad);
      const payload = JSON.parse(atob(base64));
      if (!payload?.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  const tokenValue = tokenCookie?.value;
  const tokenValid = !!tokenValue && !isTokenExpired(tokenValue);

  if (!tokenValid && !isPublicRoute) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    if (tokenValue) res.cookies.delete('token');
    return res;
  }

  if (!tokenValid && tokenValue) {
    const res = NextResponse.next();
    res.cookies.delete('token');
    return res;
  }

  if (tokenValid && isPublicRoute) {
    if (!pathname.startsWith('/invite-signup') && !pathname.startsWith('/invitesignup')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
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
