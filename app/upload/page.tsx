"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FileUploadZoneWithSuspense } from "@/components/lazy-components"
import { useAppState } from "@/hooks/use-app-state"
import { processFile } from "@/lib/file-processors"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"
export const runtime = 'nodejs';

export default function UploadPage() {
  const router = useRouter()
  const { actions } = useAppState()
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        actions.setLoading(true, "Processing your file...", "This may take a moment")

        if (!file) {
          throw new Error("No file selected")
        }

        if (file.size > 50 * 1024 * 1024) {
          // 50MB limit
          throw new Error("File size exceeds 50MB limit")
        }

        const result = await processFile(file)

        if (!result || result.length === 0) {
          throw new Error("Failed to process file - no content extracted")
        }

        actions.loadProject({
          title: file.name.replace(/\.[^/.]+$/, "") || "My Website",
          sections: result,
        })

        actions.setLoading(false)

        // Navigate to editor
        router.push("/editor/guest")
      } catch (error) {
        console.error("File processing error:", error)
        actions.setLoading(false)

        const errorMessage = error instanceof Error ? error.message : "Failed to process file"

        toast({
          title: "Upload Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    },
    [actions, router],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            Poster2Web
          </Link>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Upload Your Document</h1>
            <p className="text-gray-600 mb-6">
              Drop your file below to get started. We support PDF, PowerPoint, Word, and image files.
            </p>
          </div>

          {/* Guest Access Notice */}
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                Guest Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-amber-700">
                You're using Poster2Web as a guest. Your work won't be saved automatically.{" "}
                <Link href="/auth/sign-up" className="underline font-medium">
                  Create a free account
                </Link>{" "}
                to save your projects and access them later.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Upload Zone */}
          <Card>
            <CardContent className="p-8">
              <FileUploadZoneWithSuspense onFileUpload={handleFileUpload} />
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚡ Instant Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your documents are processed instantly in your browser - no server uploads required.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎨 Beautiful Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get professional-looking websites with customizable themes and responsive design.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💾 Save Your Work</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  <Link href="/auth/sign-up" className="text-blue-600 underline">
                    Create an account
                  </Link>{" "}
                  to save projects and access them from anywhere.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
