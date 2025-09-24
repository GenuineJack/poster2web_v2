export const runtime = 'nodejs';

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create ONE response and keep using it
  const response = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn’t configured, let the request pass through
  if (!supabaseUrl || !supabaseKey) {
    console.error('[v0] Missing Supabase env vars in middleware');
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();      // ✅ read from request
        },
        setAll(cookiesToSet) {
          // ✅ write ONLY to the RESPONSE
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Do NOT run extra code between client creation and getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users away from protected routes
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    if (
      user &&
      (request.nextUrl.pathname.startsWith('/auth/login') ||
        request.nextUrl.pathname.startsWith('/auth/sign-up'))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return response;
  } catch (err) {
    console.error('[v0] Middleware error:', err);
    return response; // fail open rather than 500
  }
}

export const config = {
  matcher: [
    // You can keep your current matcher; this one is equivalent
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
