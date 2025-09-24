const { execSync } = require("child_process")

console.log("🚀 Testing deployment locally...")

try {
  console.log("1. Building the application...")
  execSync("npm run build", { stdio: "inherit" })

  console.log("2. Starting production server...")
  console.log("   Visit http://localhost:3000 to test")
  console.log("   Check browser console and network tab for errors")
  console.log("   Test all main pages: /, /upload, /editor, auth flows")

  execSync("npm start", { stdio: "inherit" })
} catch (error) {
  console.error("❌ Local production test failed:", error.message)
  process.exit(1)
}
