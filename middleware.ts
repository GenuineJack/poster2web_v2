export const runtime = 'nodejs';

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',                // Home
  '/auth/login',
  '/auth/sign-up',
  '/auth/sign-up-success',
  '/auth/error',
  '/_not-found'
];

// Any route that starts with these prefixes will be treated as public.
const PUBLIC_PREFIXES = ['/auth/', '/api/public/'];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

export async function middleware(request: NextRequest) {
  // 1) Create exactly ONE response object
  const response = NextResponse.next();

  // 2) Fail open if env vars are missing (don’t 500 the whole site)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('[middleware] Missing Supabase env vars');
    return response;
  }

  // 3) Only hit Supabase on routes that actually need auth
  const { pathname } = request.nextUrl;
  const needsAuthCheck = !isPublicPath(pathname);

  let userId: string | null = null;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),                // ✅ read from request
        setAll: (cookies) => {                                 // ✅ write to response
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    if (needsAuthCheck) {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('[middleware] getUser error:', error.message);
      }
      userId = data?.user?.id ?? null;
    }
  } catch (err) {
    console.error('[middleware] Unexpected error:', err);
    return response; // fail open rather than throwing in middleware
  }

  // 4) Redirect unauthenticated users away from protected areas
  if (needsAuthCheck && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname); // optional: post-login return
    return NextResponse.redirect(url);
  }

  // 5) Redirect authenticated users away from auth pages
  if (userId && isPublicPath(pathname) && pathname.startsWith('/auth/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // 6) Otherwise continue
  return response;
}

// 7) Matcher: skip _next assets, images, and common static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
