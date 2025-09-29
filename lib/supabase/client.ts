import { createBrowserClient } from "@supabase/ssr"
import { getValidatedEnvVars, hasValidSupabaseConfig } from "../env-validation"

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Server-side: return null
  if (typeof window === "undefined") {
    return null as any
  }

  // Return existing instance
  if (clientInstance) {
    return clientInstance
  }

  // Check if we have valid config
  if (!hasValidSupabaseConfig()) {
    console.warn("[v0] Supabase not configured - returning mock client")
    return null as any
  }

  try {
    const { supabaseUrl, supabaseAnonKey } = getValidatedEnvVars()

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[v0] Missing Supabase configuration")
      return null as any
    }

    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log("[v0] Supabase client created successfully")
    return clientInstance
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    return null as any
  }
}
