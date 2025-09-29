"use client"

export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { hasValidSupabaseConfig } from "@/lib/env-validation"
import { Button } from "@/components/ui/button"
import { ProjectList } from "@/components/project-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function DashboardPage() {
  try {
    // Check if Supabase is configured
    if (!hasValidSupabaseConfig()) {
      return (
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <Link href="/" className="text-xl font-bold">
                Poster2Web
              </Link>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>This feature requires authentication to be configured.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Please contact the administrator to set up authentication.
                  </p>
                  <Link href="/">
                    <Button variant="outline" className="w-full bg-transparent">
                      Return Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      )
    }

    const supabase = await createClient()

    if (!supabase) {
      console.error("[v0] Failed to create Supabase client in dashboard")
      redirect("/auth/login")
    }

    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("[v0] Auth error in dashboard:", error)
      redirect("/auth/login")
    }

    if (!data?.user) {
      console.log("[v0] No user found, redirecting to login")
      redirect("/auth/login")
    }

    const isEmailConfirmed = data.user.email_confirmed_at !== null

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold">
                Poster2Web
              </Link>
              <span className="text-sm text-muted-foreground">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Welcome, {data.user.email}</span>
              <form action="/auth/signout" method="post">
                <Button variant="outline" type="submit" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {!isEmailConfirmed && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">Email Confirmation Required</CardTitle>
                <CardDescription className="text-yellow-700">
                  Please check your email and click the confirmation link to fully activate your account and access all
                  features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-600">
                  Didn't receive the email? Check your spam folder or contact support if you need help.
                </p>
              </CardContent>
            </Card>
          )}

          <ProjectList />
        </main>
      </div>
    )
  } catch (error) {
    console.error("[v0] Critical dashboard error:", error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Application Error</CardTitle>
            <CardDescription>A client-side error occurred while loading the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page. If the problem persists, contact support.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} className="flex-1">
                Refresh Page
              </Button>
              <Button variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
