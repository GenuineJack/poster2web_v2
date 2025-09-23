// Simple HTTP server for development
const http = require("http")
const fs = require("fs")
const path = require("path")

const port = process.env.PORT || 3000

// MIME types for different file extensions
const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".woff": "application/font-woff",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
  ".wasm": "application/wasm",
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`)

  // Parse URL and remove query parameters
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
  let pathname = parsedUrl.pathname

  // Default to index.html for root path
  if (pathname === "/") {
    pathname = "/index.html"
  }

  // Build file path
  const filePath = path.join(__dirname, pathname)

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      res.statusCode = 404
      res.setHeader("Content-Type", "text/plain")
      res.end("File not found")
      return
    }

    // Get file extension and set content type
    const ext = path.parse(filePath).ext
    const contentType = mimeTypes[ext] || "text/plain"

    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500
        res.setHeader("Content-Type", "text/plain")
        res.end("Internal server error")
        return
      }

      res.statusCode = 200
      res.setHeader("Content-Type", contentType)
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
      res.end(data)
    })
  })
})

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
  console.log(`Open http://localhost:${port}/ in your browser`)
})
