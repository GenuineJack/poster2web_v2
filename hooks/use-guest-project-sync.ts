"use client"

import { useCallback } from "react"
import { useAppState } from "@/hooks/use-app-state"

export function useGuestProjectSync() {
  const { currentProject, settings } = useAppState()

  const exportProject = useCallback(() => {
    const projectData = {
      project: currentProject,
      settings: settings,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${currentProject.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_project.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [currentProject, settings])

  const saveToLocalStorage = useCallback(() => {
    const projectData = {
      project: currentProject,
      settings: settings,
      savedAt: new Date().toISOString(),
    }

    localStorage.setItem("poster2web_guest_project", JSON.stringify(projectData))
  }, [currentProject, settings])

  const loadFromLocalStorage = useCallback(() => {
    const saved = localStorage.getItem("poster2web_guest_project")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error("Failed to parse saved project:", error)
        return null
      }
    }
    return null
  }, [])

  return {
    exportProject,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
}
