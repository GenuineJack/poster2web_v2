import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { hasValidSupabaseConfig } from "@/lib/env-validation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { DashboardClient } from "@/components/dashboard-client"

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
      console.error("Failed to create Supabase client in dashboard")
      redirect("/auth/login")
    }

    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Auth error in dashboard:", error)
      redirect("/auth/login")
    }

    if (!data?.user) {
      console.log("No user found, redirecting to login")
      redirect("/auth/login")
    }

    const isEmailConfirmed = data.user.email_confirmed_at !== null

    return <DashboardClient user={data.user} isEmailConfirmed={isEmailConfirmed} />
  } catch (error) {
    console.error("Critical dashboard error:", error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Application Error</CardTitle>
            <CardDescription>A server-side error occurred while loading the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page. If the problem persists, contact support.
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/dashboard">Refresh</Link>
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
