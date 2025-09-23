import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    // Return a basic response to prevent complete failure
    return new Response("Internal Server Error", { status: 500 })
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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
