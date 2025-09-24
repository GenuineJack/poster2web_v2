import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Simple pass-through middleware with comprehensive error handling
  try {
    // Allow all requests to pass through
    return NextResponse.next()
  } catch (error) {
    // Log error but don't let it crash the application
    console.error("[v0] Middleware error (non-fatal):", error)

    // Always return a valid response
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
