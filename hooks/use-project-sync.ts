"use client"

import { useEffect, useCallback, useRef } from "react"
import { useAppState } from "@/hooks/use-app-state"
import { database, appProjectToDatabaseProject } from "@/lib/database"
import { toast } from "@/hooks/use-toast"

function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay],
  ) as T
}

export function useProjectSync(projectId: string | null) {
  const { currentProject, settings, unsavedChanges, actions } = useAppState()
  const saveInProgressRef = useRef(false)

  const saveProject = useCallback(async () => {
    if (!projectId || !unsavedChanges || saveInProgressRef.current) return

    saveInProgressRef.current = true

    try {
      const { project: dbProject, sections: dbSections } = appProjectToDatabaseProject(currentProject, settings)

      // Update project
      await database.updateProject(projectId, {
        title: dbProject.title,
        theme_settings: dbProject.theme_settings,
      })

      // Get existing sections
      const existingSections = await database.getProjectSections(projectId)

      // Delete removed sections
      const currentSectionIds = currentProject.sections.map((s) => s.id).filter(Boolean)
      for (const existing of existingSections) {
        if (!currentSectionIds.includes(existing.id)) {
          await database.deleteSection(existing.id)
        }
      }

      // Update or create sections
      for (let i = 0; i < currentProject.sections.length; i++) {
        const section = currentProject.sections[i]
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

      actions.loadProject(currentProject) // This will clear unsavedChanges
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
    } finally {
      saveInProgressRef.current = false
    }
  }, [currentProject, settings, unsavedChanges, projectId, actions])

  const debouncedSave = useDebounce(saveProject, 2000)

  // Auto-save with debouncing when changes occur
  useEffect(() => {
    if (!unsavedChanges || !projectId) return

    debouncedSave()
  }, [unsavedChanges, projectId, debouncedSave])

  useEffect(() => {
    if (!unsavedChanges || !projectId) return

    const interval = setInterval(() => {
      if (!saveInProgressRef.current) {
        saveProject()
      }
    }, 60000) // Increased to 60 seconds since we have debounced saves

    return () => clearInterval(interval)
  }, [unsavedChanges, saveProject, projectId])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges && !saveInProgressRef.current) {
        e.preventDefault()
        e.returnValue = ""
        saveProject()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [unsavedChanges, saveProject])

  return { saveProject }
}
