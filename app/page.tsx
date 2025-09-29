"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { hasValidSupabaseConfig } from "../lib/env-validation"

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="font-bold text-primary text-3xl">Poster2Web</h1>
          <div className="flex gap-2">
            {supabaseAvailable ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Authentication unavailable</div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4 text-6xl">
              Poster2Web
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
              Transform documents into beautiful websites in minutes.
              <br />
              <strong className="text-foreground">No coding required.</strong>
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg">Get Started</Button>
              </Link>
              {supabaseAvailable && (
                <Link href="/auth/login">
                  <Button variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Try it free - no account required! Create an account to save your work.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Lightning Fast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Transform documents to websites in under 60 seconds</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎨</span>
                  Beautiful Design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Professional templates with customizable themes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  Responsive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Works perfectly on desktop, tablet, and mobile devices</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
