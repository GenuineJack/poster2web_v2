export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Auth check timeout")), 5000))

    const {
      data: { user },
    } = (await Promise.race([authPromise, timeoutPromise])) as any

    if (user) {
      const signOutPromise = supabase.auth.signOut()
      const signOutTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Sign out timeout")), 5000),
      )

      await Promise.race([signOutPromise, signOutTimeoutPromise])
    }

    return NextResponse.redirect(new URL("/", request.url), {
      status: 302,
    })
  } catch (error) {
    console.error("[SignOut] Error during sign out:", error)

    // Even if signout fails, redirect to home page
    // This prevents users from getting stuck on error pages
    return NextResponse.redirect(new URL("/", request.url), {
      status: 302,
    })
  }
}
