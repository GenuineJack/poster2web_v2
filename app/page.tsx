"use client"

import { useEffect } from "react"

export default function HomePage() {
  useEffect(() => {
    // Redirect to the HTML file or serve it directly
    if (typeof window !== "undefined") {
      // Check if we're in the v0 preview environment
      const isV0Preview = window.location.hostname.includes("v0.app") || window.location.hostname.includes("vercel.app")

      if (!isV0Preview) {
        // In production, redirect to index.html
        window.location.href = "/index.html"
      }
    }
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "600px",
          background: "white",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Poster2Web
        </h1>

        <p
          style={{
            fontSize: "1.25rem",
            color: "#6b7280",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          Transform documents into beautiful websites in minutes.
          <br />
          <strong style={{ color: "#374151" }}>No coding required.</strong>
        </p>

        <div
          style={{
            padding: "2rem",
            background: "#f9fafb",
            borderRadius: "8px",
            border: "2px dashed #d1d5db",
            marginBottom: "2rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>This is a preview of your Poster2Web application.</p>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            The full HTML/JavaScript application with drag-and-drop file upload is available when you download and run
            the project locally.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              background: "#f0fdf4",
              borderRadius: "8px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚀</div>
            <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Lightning Fast</h3>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Transform documents to websites in under 60 seconds
            </p>
          </div>

          <div
            style={{
              padding: "1.5rem",
              background: "#f0fdf4",
              borderRadius: "8px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎨</div>
            <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Beautiful Design</h3>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Professional templates with customizable themes</p>
          </div>
        </div>

        <div
          style={{
            padding: "1rem",
            background: "#eff6ff",
            borderRadius: "8px",
            border: "1px solid #bfdbfe",
            fontSize: "0.875rem",
            color: "#1e40af",
          }}
        >
          <strong>To use the full application:</strong>
          <br />
          1. Download this project
          <br />
          2. Run <code style={{ background: "#e5e7eb", padding: "0.25rem", borderRadius: "4px" }}>npm start</code>
          <br />
          3. Open{" "}
          <code style={{ background: "#e5e7eb", padding: "0.25rem", borderRadius: "4px" }}>http://localhost:3000</code>
        </div>
      </div>
    </div>
  )
}
