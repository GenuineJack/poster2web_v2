"use client"

import { useEffect, memo } from "react"
import { useAppState, type Project, type Settings } from "@/hooks/use-app-state"
import { EditorScreen } from "@/components/editor-screen"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EditorWrapperProps {
  initialProject: Project
  projectId: string
  settings: Settings
}

function EditorWrapperContent({ initialProject, projectId, settings }: EditorWrapperProps) {
  const { actions } = useAppState()

  useEffect(() => {
    try {
      // Load the project data into the app state
      actions.loadProject(initialProject)
      actions.updateSettings(settings)
      actions.setScreen("editor")

      // Store project ID for saving
      ;(window as any).__currentProjectId = projectId
    } catch (error) {
      console.error("Error initializing editor:", error)
    }
  }, [initialProject, projectId, settings, actions])

  return <EditorScreen />
}

function EditorErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Editor Error</CardTitle>
          <CardDescription>
            An error occurred while loading the editor. This might be due to corrupted project data or a temporary
            issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Try refreshing the page or return to your dashboard to access your projects.
          </p>
          <div className="flex gap-2">
            <Button onClick={retry} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const EditorWrapper = memo(function EditorWrapper(props: EditorWrapperProps) {
  return (
    <ErrorBoundary fallback={EditorErrorFallback}>
      <EditorWrapperContent {...props} />
    </ErrorBoundary>
  )
})
