"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EditorScreen } from "@/components/editor-screen"
import { useAppState } from "@/hooks/use-app-state"
import { Button } from "@/components/ui/button"
import { Save, User } from "lucide-react"

export default function GuestEditorContent() {
  const router = useRouter()
  const { currentProject, actions } = useAppState()
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    try {
      actions.setScreen("editor")

      // Show save prompt after 2 minutes of editing
      const timer = setTimeout(() => {
        setShowSavePrompt(true)
      }, 120000)

      return () => clearTimeout(timer)
    } catch (error) {
      console.error("[v0] Error in guest editor setup:", error)
      setHasError(true)
    }
  }, [actions])

  // Redirect if no project loaded
  useEffect(() => {
    try {
      if (!currentProject || !currentProject.sections || currentProject.sections.length === 0) {
        // Only redirect if we're sure there's no content
        const hasContent = currentProject?.sections?.some((section) => section.content && section.content.length > 0)

        if (!hasContent) {
          router.push("/upload")
        }
      }
    } catch (error) {
      console.error("[v0] Error checking project content:", error)
      setHasError(true)
    }
  }, [currentProject, router])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Editor Error</h2>
          <p className="text-gray-600">Something went wrong with the editor. Please try refreshing the page.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            <Button variant="outline" asChild>
              <Link href="/upload">Start Over</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Save Reminder Banner */}
      {showSavePrompt && (
        <div className="bg-blue-600 text-white p-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span className="text-sm">Love your work? Create an account to save it permanently!</span>
            </div>
            <div className="flex gap-2">
              <Link href="/auth/sign-up">
                <Button size="sm" variant="secondary">
                  Sign Up Free
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-blue-700"
                onClick={() => setShowSavePrompt(false)}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              Poster2Web
            </Link>
            <span className="text-sm text-gray-500">Guest Editor</span>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Work
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <EditorScreen />
      </main>
    </div>
  )
}
