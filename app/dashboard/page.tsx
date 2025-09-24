export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { hasValidSupabaseConfig } from "@/lib/env-validation"
import { Button } from "@/components/ui/button"
import { ProjectList } from "@/components/project-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
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

  try {
    const supabase = await createClient()

    if (!supabase) {
      redirect("/auth/login")
    }

    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
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
              <Link href="/upload">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </Link>
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
    console.error("Dashboard error:", error)
    redirect("/auth/login")
  }
}
