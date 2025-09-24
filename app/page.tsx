"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { hasValidSupabaseConfig } from "../lib/env-validation"

// Simple inline button component
function SimpleButton({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: {
  children: React.ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "lg"
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50"

  const variantClasses = {
    default: "bg-blue-600 text-white shadow hover:bg-blue-700",
    outline: "border border-gray-300 bg-white shadow hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
  }

  const sizeClasses = {
    default: "h-9 px-4 py-2",
    lg: "h-10 px-8",
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// Simple inline card components
function SimpleCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 py-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

function SimpleCardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 ${className}`}>{children}</div>
  )
}

function SimpleCardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`leading-none font-semibold ${className}`}>{children}</div>
}

function SimpleCardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 ${className}`}>{children}</div>
}

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [supabaseAvailable, setSupabaseAvailable] = useState(false)

  useEffect(() => {
    setSupabaseAvailable(hasValidSupabaseConfig())
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Poster2Web</h1>
          <div className="flex gap-2">
            {supabaseAvailable ? (
              <>
                <Link href="/auth/login">
                  <SimpleButton variant="ghost">Login</SimpleButton>
                </Link>
                <Link href="/auth/sign-up">
                  <SimpleButton>Sign Up</SimpleButton>
                </Link>
              </>
            ) : (
              <div className="text-sm text-gray-500">Authentication unavailable</div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Poster2Web
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform documents into beautiful websites in minutes.
              <br />
              <strong>No coding required.</strong>
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/upload">
                <SimpleButton size="lg">Get Started</SimpleButton>
              </Link>
              {supabaseAvailable && (
                <Link href="/auth/login">
                  <SimpleButton variant="outline" size="lg">
                    Login
                  </SimpleButton>
                </Link>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Try it free - no account required! Create an account to save your work.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <SimpleCard>
              <SimpleCardHeader>
                <SimpleCardTitle className="flex items-center gap-2">⚡ Lightning Fast</SimpleCardTitle>
              </SimpleCardHeader>
              <SimpleCardContent>
                <p className="text-gray-600">Transform documents to websites in under 60 seconds</p>
              </SimpleCardContent>
            </SimpleCard>

            <SimpleCard>
              <SimpleCardHeader>
                <SimpleCardTitle className="flex items-center gap-2">🎨 Beautiful Design</SimpleCardTitle>
              </SimpleCardHeader>
              <SimpleCardContent>
                <p className="text-gray-600">Professional templates with customizable themes</p>
              </SimpleCardContent>
            </SimpleCard>

            <SimpleCard>
              <SimpleCardHeader>
                <SimpleCardTitle className="flex items-center gap-2">📱 Responsive</SimpleCardTitle>
              </SimpleCardHeader>
              <SimpleCardContent>
                <p className="text-gray-600">Works perfectly on desktop, tablet, and mobile devices</p>
              </SimpleCardContent>
            </SimpleCard>
          </div>
        </div>
      </main>
    </div>
  )
}
