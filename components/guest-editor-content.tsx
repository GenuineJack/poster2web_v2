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

  useEffect(() => {
    actions.setScreen("editor")

    // Show save prompt after 2 minutes of editing
    const timer = setTimeout(() => {
      setShowSavePrompt(true)
    }, 120000)

    return () => clearTimeout(timer)
  }, [actions])

  // Redirect if no project loaded
  useEffect(() => {
    if (!currentProject || !currentProject.sections || currentProject.sections.length === 0) {
      // Only redirect if we're sure there's no content
      const hasContent = currentProject?.sections?.some((section) => section.content && section.content.length > 0)

      if (!hasContent) {
        router.push("/upload")
      }
    }
  }, [currentProject, router])

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
