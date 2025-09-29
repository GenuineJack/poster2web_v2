"use client"

import { Button } from "@/components/ui/button"
import { ProjectList } from "@/components/project-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

interface DashboardClientProps {
  user: User
  isEmailConfirmed: boolean
}

export function DashboardClient({ user, isEmailConfirmed }: DashboardClientProps) {
  const handleSignOut = async () => {
    try {
      // Create a form and submit it to handle sign out
      const form = document.createElement("form")
      form.method = "post"
      form.action = "/auth/signout"
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error("[v0] Sign out error:", error)
      // Fallback to client-side redirect
      window.location.href = "/auth/login"
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

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
            <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            <Button variant="outline" onClick={handleSignOut} size="sm">
              Sign Out
            </Button>
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
}
