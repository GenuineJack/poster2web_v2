import { createBrowserClient } from "@supabase/ssr"
import { getValidatedEnvVars, hasValidSupabaseConfig } from "../env-validation"

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Server-side: return null to prevent SSR issues
  if (typeof window === "undefined") {
    return null as any
  }

  // Return existing instance to prevent multiple clients
  if (clientInstance) {
    return clientInstance
  }

  // Check if we have valid config before creating client
  if (!hasValidSupabaseConfig()) {
    console.warn("Supabase not configured - client unavailable")
    return null as any
  }

  try {
    const { supabaseUrl, supabaseAnonKey } = getValidatedEnvVars()

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration")
      return null as any
    }

    if (!supabaseUrl.startsWith("https://")) {
      console.error("Invalid Supabase URL format")
      return null as any
    }

    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log("Supabase client created successfully")
    return clientInstance
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null as any
  }
}

export function resetClient() {
  clientInstance = null
}
