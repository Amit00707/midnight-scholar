import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('ms_access_token')?.value;
  const { pathname } = req.nextUrl;

  // 1. Unauthenticated users cannot access main routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/library') || pathname.startsWith('/read')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Teacher specific route guard
  if (pathname.startsWith('/teacher')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
  }

  // 3. Admin specific route guard
  if (pathname.startsWith('/admin')) {
    if (pathname !== '/admin/login' && !token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // 4. Prevent authenticated users from seeing auth pages
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/library/:path*', '/read/:path*', '/teacher/:path*', '/admin/:path*', '/login', '/signup'],
};
