import { createBrowserClient } from "@supabase/ssr"
import { getValidatedEnvVars } from "../env-validation"

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getValidatedEnvVars()

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
