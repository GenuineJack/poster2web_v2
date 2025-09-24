import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // For now, just pass through all requests without Supabase auth checks
  // This allows the app to load and deploy successfully

  // You can add basic redirects here if needed
  // For example, redirect /dashboard to /auth/login if no session cookie exists

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
