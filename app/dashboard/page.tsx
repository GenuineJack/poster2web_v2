export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ProjectList } from "@/components/project-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
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
              <h1 className="text-xl font-bold">Poster2Web</h1>
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
    console.error("Dashboard error:", error)
    redirect("/auth/login")
  }
}
