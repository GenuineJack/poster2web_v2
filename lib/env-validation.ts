export function validateEnvironmentVariables() {
  // During build time, environment variables might not be available
  // This is normal and expected behavior
  if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
    console.log("Build-time environment - skipping strict validation")
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
      console.warn("Environment validation issues:", { missingVars, invalidVars })
      return false
    }

    console.log("Environment validation passed")
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

  if (!supabaseUrl || !supabaseAnonKey) {
    return false
  }

  if (!supabaseUrl.startsWith("https://")) {
    return false
  }

  // Basic format validation for Supabase URL
  if (!supabaseUrl.includes(".supabase.co")) {
    return false
  }

  return true
}

export function validateDeploymentEnvironment(): {
  isValid: boolean
  issues: string[]
  warnings: string[]
} {
  const issues: string[] = []
  const warnings: string[] = []

  // Check critical environment variables
  const criticalVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  for (const varName of criticalVars) {
    const value = process.env[varName]
    if (!value) {
      issues.push(`Missing critical environment variable: ${varName}`)
    } else if (varName === "NEXT_PUBLIC_SUPABASE_URL" && !value.startsWith("https://")) {
      issues.push(`${varName} must start with https://`)
    }
  }

  // Check optional but recommended variables
  const optionalVars = ["NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL"]

  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warnings.push(`Optional environment variable not set: ${varName}`)
    }
  }

  // Check runtime environment
  if (!process.env.NODE_ENV) {
    warnings.push("NODE_ENV not set")
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  }
}
