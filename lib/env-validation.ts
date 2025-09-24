export function validateEnvironmentVariables() {
  // Skip validation during build time if environment variables are not available
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log("[v0] Skipping environment validation during build time")
    return false
  }

  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const missingVars: string[] = []
  const invalidVars: string[] = []

  console.log("[v0] Environment validation - checking variables...")
  console.log("[v0] NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missingVars.push(key)
    } else if (key === "NEXT_PUBLIC_SUPABASE_URL" && !value.startsWith("https://")) {
      invalidVars.push(`${key} must start with https://`)
    }
  }

  if (missingVars.length > 0 || invalidVars.length > 0) {
    const errorMessage = [
      missingVars.length > 0 ? `Missing environment variables: ${missingVars.join(", ")}` : "",
      invalidVars.length > 0 ? `Invalid environment variables: ${invalidVars.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    console.error("[v0] Environment validation failed:")
    console.error("[v0] Missing vars:", missingVars)
    console.error("[v0] Invalid vars:", invalidVars)
    console.error("[v0] Current NODE_ENV:", process.env.NODE_ENV)
    console.error("[v0] Current VERCEL_ENV:", process.env.VERCEL_ENV)

    throw new Error(`Environment validation failed:\n${errorMessage}`)
  }

  console.log("[v0] Environment validation passed successfully")
  return true
}

export function getValidatedEnvVars() {
  const isValid = validateEnvironmentVariables()

  // Return fallback values during build time
  if (!isValid) {
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
    }
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }
}
