console.log("🔍 Verifying environment variables...")

const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

const missingVars = []
const invalidVars = []

console.log("\n📋 Environment Check:")
requiredVars.forEach((varName) => {
  const value = process.env[varName]
  const exists = !!value

  console.log(`   ${varName}: ${exists ? "✅" : "❌"}`)

  if (!exists) {
    missingVars.push(varName)
  } else if (varName === "NEXT_PUBLIC_SUPABASE_URL" && !value.startsWith("https://")) {
    invalidVars.push(`${varName} must start with https://`)
    console.log(`   ⚠️  ${varName} should start with https://`)
  }
})

console.log("\n🌍 Runtime Environment:")
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "undefined"}`)
console.log(`   VERCEL_ENV: ${process.env.VERCEL_ENV || "undefined"}`)

if (missingVars.length > 0) {
  console.log("\n❌ Missing environment variables:")
  missingVars.forEach((varName) => {
    console.log(`   - ${varName}`)
  })
  console.log("\n📝 To fix:")
  console.log("   1. Add to .env.local for local development")
  console.log("   2. Add to Vercel → Project → Settings → Environment Variables")
  process.exit(1)
}

if (invalidVars.length > 0) {
  console.log("\n⚠️  Invalid environment variables:")
  invalidVars.forEach((issue) => {
    console.log(`   - ${issue}`)
  })
  process.exit(1)
}

console.log("\n✅ All environment variables are properly configured!")
