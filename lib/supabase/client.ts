import { createBrowserClient } from "@supabase/ssr"
import { getValidatedEnvVars } from "../env-validation"

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === "undefined") {
    // Server-side: return null or throw error
    console.log("[v0] Supabase client called on server-side, skipping")
    return null as any
  }

  if (clientInstance) {
    return clientInstance
  }

  try {
    const { supabaseUrl, supabaseAnonKey } = getValidatedEnvVars()

    if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
      throw new Error("Supabase URL not configured properly")
    }

    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log("[v0] Supabase client created successfully")
    return clientInstance
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    throw error
  }
}
