const { execSync } = require("child_process")

console.log("🚀 Testing deployment locally...")

const tests = [
  {
    name: "Environment Variables Check",
    test: () => {
      const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

      const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])
      if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(", ")}`)
      }
      console.log("✅ All required environment variables are set")
    },
  },
  {
    name: "TypeScript Check",
    test: () => {
      console.log("🔍 Running TypeScript check...")
      execSync("npx tsc --noEmit", { stdio: "inherit" })
      console.log("✅ TypeScript check passed")
    },
  },
  {
    name: "Build Process",
    test: () => {
      console.log("🏗️ Building the application...")
      execSync("npm run build", { stdio: "inherit" })
      console.log("✅ Build completed successfully")
    },
  },
]

try {
  // Run all tests
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`)
    test.test()
  }

  console.log("\n🎉 All deployment tests passed!")
  console.log("\n🚀 Starting production server...")
  console.log("   Visit http://localhost:3000 to test")
  console.log("   Check browser console and network tab for errors")
  console.log("   Test all main pages: /, /upload, /editor, auth flows")
  console.log("   Test both guest and authenticated user flows")

  execSync("npm start", { stdio: "inherit" })
} catch (error) {
  console.error("❌ Deployment test failed:", error.message)
  console.error("\n🔧 Troubleshooting tips:")
  console.error("   1. Check that all environment variables are set")
  console.error("   2. Ensure Supabase integration is properly configured")
  console.error("   3. Verify all dependencies are installed")
  console.error("   4. Check for TypeScript errors")
  process.exit(1)
}
