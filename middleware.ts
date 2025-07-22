import { NextRequest, NextResponse } from 'next/server';

// Define routes that do NOT require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/api',
  '/_next',
  '/public',
  '/favicon.ico',
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((publicPath) =>
    pathname === publicPath || pathname.startsWith(publicPath + '/')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const jwt = request.cookies.get('appwrite_jwt')?.value;
  if (!jwt) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|public|favicon.ico).*)',
  ],
}; 