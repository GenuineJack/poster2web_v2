export function validateEnvironmentVariables() {
  // During build time, environment variables might not be available
  // This is normal and expected behavior
  if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
    console.log("[v0] Build-time environment - skipping strict validation")
    return false
  }

  // Only validate in browser or development
  if (typeof window !== "undefined" || process.env.NODE_ENV === "development") {
    const requiredEnvVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    const missingVars: string[] = []
    const invalidVars: string[] = []

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        missingVars.push(key)
      } else if (key === "NEXT_PUBLIC_SUPABASE_URL" && !value.startsWith("https://")) {
        invalidVars.push(`${key} must start with https://`)
      }
    }

    if (missingVars.length > 0 || invalidVars.length > 0) {
      console.warn("[v0] Environment validation issues:", { missingVars, invalidVars })
      return false
    }

    console.log("[v0] Environment validation passed")
    return true
  }

  return false
}

export function getValidatedEnvVars() {
  // Always return environment variables without throwing errors
  // Let the calling code handle missing values gracefully
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  }
}

export function hasValidSupabaseConfig(): boolean {
  const { supabaseUrl, supabaseAnonKey } = getValidatedEnvVars()
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("https://"))
}
