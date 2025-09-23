import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("[v0] Missing Supabase environment variables")
    throw new Error("Supabase configuration is missing. Please check your environment variables.")
  }

  if (!client) {
    try {
      client = createBrowserClient(supabaseUrl, supabaseKey)
    } catch (error) {
      console.error("[v0] Failed to create Supabase client:", error)
      throw new Error("Failed to initialize Supabase client")
    }
  }
  return client
}
