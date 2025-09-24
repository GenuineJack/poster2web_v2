import { createBrowserClient } from "@supabase/ssr"
import { getValidatedEnvVars } from "../env-validation"

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (clientInstance) {
    return clientInstance
  }

  try {
    const { supabaseUrl, supabaseAnonKey } = getValidatedEnvVars()
    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
    return clientInstance
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    throw error
  }
}
