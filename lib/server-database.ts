import { createClient as createServerClient } from "@/lib/supabase/server"
import type { DatabaseProject, DatabaseSection } from "@/lib/database"

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Database operation timeout")), timeoutMs),
  )

  return Promise.race([promise, timeoutPromise])
}

// Server-side database functions
export const serverDatabase = {
  async getProject(id: string): Promise<DatabaseProject | null> {
    try {
      const supabase = await createServerClient()

      const operation = supabase.from("projects").select("*").eq("id", id).single()
      const { data, error } = await withTimeout(operation)

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        console.error("[ServerDB] Error fetching project:", error)
        throw error
      }
      return data
    } catch (error) {
      console.error("[ServerDB] Failed to get project:", error)
      return null // Graceful degradation
    }
  },

  async getProjectSections(projectId: string): Promise<DatabaseSection[]> {
    try {
      const supabase = await createServerClient()

      const operation = supabase.from("project_sections").select("*").eq("project_id", projectId).order("sort_order")

      const { data, error } = await withTimeout(operation)

      if (error) {
        console.error("[ServerDB] Error fetching project sections:", error)
        throw error
      }
      return data || []
    } catch (error) {
      console.error("[ServerDB] Failed to get project sections:", error)
      return [] // Graceful degradation
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const supabase = await createServerClient()
      const { error } = await withTimeout(supabase.from("projects").select("id").limit(1), 5000)

      return !error
    } catch (error) {
      console.error("[ServerDB] Health check failed:", error)
      return false
    }
  },
}
