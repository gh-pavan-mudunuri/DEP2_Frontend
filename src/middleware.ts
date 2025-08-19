import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Store in lowercase for matching
const PUBLIC_PATHS = ['/', '/Login', '/Signup', "reset-password", "/verify-email",'/about', '/contact', '/privacy-policy', '/terms-of-service', '/upcoming-events', '/trending-events'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  const lowerPath = pathname

  const isProtectedPath =
    lowerPath.startsWith('/dashboard') ||
    lowerPath.startsWith('/event') ||
    lowerPath.startsWith('/payment') ||
    lowerPath.startsWith('/send-email');

  // ✅ Allow exact match OR subpath for public pages
  const isPublicPath =
    PUBLIC_PATHS.some(p => lowerPath === p || lowerPath.startsWith(`${p}/`));

  // 🔄 Redirect logged-in users away from public pages to dashboard, except for /upcoming-events and /trending-events
  if (isPublicPath && token &&
    lowerPath !== '/upcoming-events' && !lowerPath.startsWith('/upcoming-events/') &&
    lowerPath !== '/trending-events' && !lowerPath.startsWith('/trending-events/')) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  // Admin dashboard access control
  const isAdminDashboard = lowerPath.startsWith('/admin');
  if (isAdminDashboard) {
    if (!token) {
      // Not logged in, redirect to login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/Login';
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== '1') {
      // Not admin, redirect to dashboard
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // 🔒 Require login for protected routes
  if (isProtectedPath && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/Login'; // Keep capitalized version for your actual page
    return NextResponse.redirect(loginUrl);
  }

  // 🚫 Redirect unknown paths to home
  const isKnownPath =
    isPublicPath ||
    isProtectedPath ||
    isAdminDashboard ||
    lowerPath.startsWith('/_next') ||
    lowerPath.startsWith('/api') ||
    lowerPath.startsWith('/icon') ||
    lowerPath.startsWith('/images') ||
    lowerPath.startsWith('/favicon.ico') ||
    lowerPath.startsWith('/robots.txt') ||
    lowerPath.startsWith('/sitemap.xml') ||
    lowerPath.startsWith('/uploads');

  if (!isKnownPath) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|robots.txt|sitemap.xml|api|static|images|fonts).*)',
  ],
};
