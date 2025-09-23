"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only check auth if we have the required environment variables
        if (
          typeof window !== "undefined" &&
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ) {
          const { createClient } = await import("@/lib/supabase/client")
          const supabase = createClient()

          const {
            data: { user },
          } = await supabase.auth.getUser()

          setUser(user)
          setAuthChecked(true)

          // Only redirect if user is authenticated and we haven't already checked
          if (user && !authChecked) {
            router.push("/dashboard")
            return
          }

          // Set up auth state listener with proper cleanup
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("[v0] Auth state change:", event)
            if (event === "SIGNED_IN" && session?.user) {
              setUser(session.user)
              router.push("/dashboard")
            } else if (event === "SIGNED_OUT") {
              setUser(null)
            }
          })

          // Return cleanup function
          return () => {
            console.log("[v0] Cleaning up auth subscription")
            subscription.unsubscribe()
          }
        } else {
          console.log("[v0] Supabase env vars not available")
          setAuthChecked(true)
        }
      } catch (error) {
        console.error("[v0] Auth check failed:", error)
        setUser(null)
        setAuthChecked(true)
      } finally {
        setLoading(false)
      }
    }

    if (!authChecked) {
      const cleanup = checkAuth()
      return () => {
        if (cleanup instanceof Promise) {
          cleanup.then((cleanupFn) => cleanupFn?.())
        }
      }
    }
  }, [router, authChecked])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (user && authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Redirecting to dashboard...</p>
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
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
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
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">⚡ Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Transform documents to websites in under 60 seconds</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🎨 Beautiful Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Professional templates with customizable themes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">📱 Responsive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Works perfectly on desktop, tablet, and mobile devices</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
