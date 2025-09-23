"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false) // Start with loading false to show page immediately
  const [supabaseAvailable, setSupabaseAvailable] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if Supabase environment variables are available
        if (
          typeof window !== "undefined" &&
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ) {
          // Try to import and use Supabase, but don't let it block the page
          const { createClient } = await import("@/lib/supabase/client")
          const supabase = createClient()

          setSupabaseAvailable(true)

          const {
            data: { user: authUser },
          } = await supabase.auth.getUser()

          if (authUser) {
            setUser(authUser)
            router.push("/dashboard")
          }
        }
      } catch (error) {
        console.error("[v0] Supabase not available:", error)
        // Continue without auth - this is fine for the landing page
        setSupabaseAvailable(false)
      }
    }

    // Don't block the page load - run auth check in background
    checkAuth()
  }, [router])

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
