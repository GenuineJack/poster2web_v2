"use client"

import { useEffect, useCallback } from "react"
import { useAppState } from "@/hooks/use-app-state"
import { database, appProjectToDatabaseProject } from "@/lib/database"
import { toast } from "@/hooks/use-toast"

export function useProjectSync(projectId: string) {
  const { state, actions } = useAppState()

  const saveProject = useCallback(async () => {
    if (!state.unsavedChanges) return

    try {
      const { project: dbProject, sections: dbSections } = appProjectToDatabaseProject(
        state.currentProject,
        state.settings,
      )

      // Update project
      await database.updateProject(projectId, {
        title: dbProject.title,
        theme_settings: dbProject.theme_settings,
      })

      // Get existing sections
      const existingSections = await database.getProjectSections(projectId)

      // Delete removed sections
      const currentSectionIds = state.currentProject.sections.map((s) => s.id).filter(Boolean)
      for (const existing of existingSections) {
        if (!currentSectionIds.includes(existing.id)) {
          await database.deleteSection(existing.id)
        }
      }

      // Update or create sections
      for (let i = 0; i < state.currentProject.sections.length; i++) {
        const section = state.currentProject.sections[i]
        const dbSection = dbSections[i]

        if (section.id && existingSections.find((s) => s.id === section.id)) {
          // Update existing section
          await database.updateSection(section.id, {
            title: dbSection.title,
            content: dbSection.content,
            icon: dbSection.icon,
            sort_order: dbSection.sort_order,
          })
        } else {
          // Create new section
          const newSection = await database.createSection({
            project_id: projectId,
            section_type: dbSection.section_type,
            title: dbSection.title,
            content: dbSection.content,
            icon: dbSection.icon,
            sort_order: dbSection.sort_order,
          })

          // Update the section ID in the app state
          actions.updateSection(i, { id: newSection.id })
        }
      }

      actions.loadProject(state.currentProject) // This will clear unsavedChanges
      toast({
        title: "Saved",
        description: "Project saved successfully",
      })
    } catch (error) {
      console.error("Error saving project:", error)
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      })
    }
  }, [state.currentProject, state.settings, state.unsavedChanges, projectId, actions])

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!state.unsavedChanges) return

    const interval = setInterval(() => {
      saveProject()
    }, 30000)

    return () => clearInterval(interval)
  }, [state.unsavedChanges, saveProject])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.unsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
        saveProject()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [state.unsavedChanges, saveProject])

  return { saveProject }
}
