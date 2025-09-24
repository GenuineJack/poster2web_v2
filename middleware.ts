import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    console.log("[v0] Middleware executing for:", request.nextUrl.pathname)

    // Allow all requests to pass through - no authentication required
    // This enables guest users to access the upload and editor screens

    console.log("[v0] Middleware completed successfully")
    return NextResponse.next()
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    console.error("[v0] Request URL:", request.nextUrl.href)
    console.error("[v0] Request method:", request.method)
    console.error("[v0] Environment variables check:")
    console.error("[v0] - NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.error("[v0] - NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    // Return a proper response instead of letting the error bubble up
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
