export function validateEnvironmentVariables() {
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
    const errorMessage = [
      missingVars.length > 0 ? `Missing environment variables: ${missingVars.join(", ")}` : "",
      invalidVars.length > 0 ? `Invalid environment variables: ${invalidVars.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    throw new Error(`Environment validation failed:\n${errorMessage}`)
  }

  return true
}

export function getValidatedEnvVars() {
  validateEnvironmentVariables()
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }
}
