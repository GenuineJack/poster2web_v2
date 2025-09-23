import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("[v0] Missing Supabase environment variables on server")
    throw new Error("Supabase configuration is missing on server")
  }

  try {
    const cookieStore = await cookies()

    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn("[v0] Cookie setting failed in server component:", error)
          }
        },
      },
    })
  } catch (error) {
    console.error("[v0] Failed to create server Supabase client:", error)
    throw new Error("Failed to initialize server Supabase client")
  }
}

export async function getUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("[v0] Error getting user:", error)
    return null
  }
}
