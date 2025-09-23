"use client"

import { useEffect } from "react"
import { useAppState, type Project, type Settings } from "@/hooks/use-app-state"
import { EditorScreen } from "@/components/editor-screen"

interface EditorWrapperProps {
  initialProject: Project
  projectId: string
  settings: Settings
}

export function EditorWrapper({ initialProject, projectId, settings }: EditorWrapperProps) {
  const { actions } = useAppState()

  useEffect(() => {
    // Load the project data into the app state
    actions.loadProject(initialProject)
    actions.updateSettings(settings)
    actions.setScreen("editor")

    // Store project ID for saving
    ;(window as any).__currentProjectId = projectId
  }, [initialProject, projectId, settings, actions])

  return <EditorScreen />
}
