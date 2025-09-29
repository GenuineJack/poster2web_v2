const { validateDeploymentEnvironment } = require("../lib/env-validation.ts")

console.log("🔍 Validating deployment configuration...")

try {
  // Environment validation
  console.log("\n📋 Environment Variables:")
  const envValidation = validateDeploymentEnvironment()

  if (envValidation.issues.length > 0) {
    console.error("❌ Critical Issues:")
    envValidation.issues.forEach((issue) => console.error(`   - ${issue}`))
  }

  if (envValidation.warnings.length > 0) {
    console.warn("⚠️  Warnings:")
    envValidation.warnings.forEach((warning) => console.warn(`   - ${warning}`))
  }

  if (envValidation.isValid) {
    console.log("✅ Environment configuration is valid")
  }

  // Check Node.js version
  console.log("\n🔧 Runtime Environment:")
  const nodeVersion = process.version
  const majorVersion = Number.parseInt(nodeVersion.slice(1).split(".")[0])

  if (majorVersion < 18) {
    console.error(`❌ Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`)
    process.exit(1)
  } else {
    console.log(`✅ Node.js version: ${nodeVersion}`)
  }

  // Check package.json
  console.log("\n📦 Package Configuration:")
  const packageJson = require("../package.json")

  if (!packageJson.scripts.build) {
    console.error("❌ Missing build script in package.json")
    process.exit(1)
  }

  if (!packageJson.scripts.start) {
    console.error("❌ Missing start script in package.json")
    process.exit(1)
  }

  console.log("✅ Package scripts configured correctly")

  // Final validation
  if (!envValidation.isValid) {
    console.error("\n❌ Deployment validation failed due to environment issues")
    console.log("\n🔧 To fix:")
    console.log("   1. Set all required environment variables")
    console.log("   2. Verify Supabase configuration")
    console.log("   3. Check Vercel project settings")
    process.exit(1)
  }

  console.log("\n✅ Deployment validation passed!")
  console.log("🚀 Ready for deployment")
} catch (error) {
  console.error("❌ Deployment validation failed:", error.message)
  process.exit(1)
}
