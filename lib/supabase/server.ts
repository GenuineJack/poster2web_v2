import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getValidatedEnvVars, hasValidSupabaseConfig } from "../env-validation"

export async function createClient() {
  // Check if we have valid config before proceeding
  if (!hasValidSupabaseConfig()) {
    console.warn("Supabase not configured for server client")
    return null as any
  }

  try {
    const { supabaseUrl, supabaseAnonKey } = getValidatedEnvVars()
    const cookieStore = await cookies()

    const client = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            console.warn("Failed to set cookies in server component - this is expected in some contexts")
          }
        },
      },
    })

    return client
  } catch (error) {
    console.error("Failed to create Supabase server client:", error)
    return null as any
  }
}
