import { createClient as createServerClient } from "@/lib/supabase/server"
import type { DatabaseProject, DatabaseSection } from "@/lib/database"

// Server-side database functions
export const serverDatabase = {
  async getProject(id: string): Promise<DatabaseProject | null> {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw error
    }
    return data
  },

  async getProjectSections(projectId: string): Promise<DatabaseSection[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("project_sections")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order")

    if (error) throw error
    return data || []
  },
}
