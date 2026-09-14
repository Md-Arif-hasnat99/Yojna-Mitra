import { NextResponse, type NextRequest } from 'next/server'

const LANG_COOKIE = 'ym_lang'

// Routes that require an authenticated user
const APP_ROUTES = ['/dashboard', '/profile', '/eligibility', '/results', '/saved']
// Routes that require admin
const ADMIN_ROUTES = ['/admin']
// Routes that should redirect logged-in users away (auth pages)
const AUTH_ROUTES = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Language cookie ──────────────────────────────────────────────────────────
  // If no language cookie is set, default to 'en'.
  // The LanguageContext reads this on the client and writes it back when toggled.
  const response = NextResponse.next()
  if (!request.cookies.has(LANG_COOKIE)) {
    response.cookies.set(LANG_COOKIE, 'en', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })
  }

  // ── Route protection ─────────────────────────────────────────────────────────
  // We rely on supabase session cookies (`sb-*`) being present for auth state.
  // Fine-grained user/admin checks happen inside the layout server components.
  // Middleware only handles the coarse redirect to keep things fast at the edge.
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith('sb-'))

  const isAppRoute = APP_ROUTES.some((r) => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r)

  // Unauthenticated user trying to access protected route → login
  if ((isAppRoute || isAdminRoute) && !hasSession) {
    const loginUrl = isAdminRoute
      ? new URL('/admin/login', request.url)
      : new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user trying to access auth pages → dashboard
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
