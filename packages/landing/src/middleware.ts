import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['kk', 'ru', 'en'];
const DEFAULT_LOCALE = 'kk';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a valid locale
  const pathnameLocale = LOCALES.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) return NextResponse.next();

  // Redirect to default locale
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|fonts|robots.txt|api).*)'],
};
