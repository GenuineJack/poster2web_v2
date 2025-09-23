import { createClient } from "@/lib/supabase/client"
import type { Section, Project, Settings } from "@/hooks/use-app-state"

export interface DatabaseProject {
  id: string
  user_id: string
  title: string
  description: string | null
  original_filename: string | null
  file_type: string | null
  status: "draft" | "published" | "archived"
  theme_settings: Settings
  created_at: string
  updated_at: string
}

export interface DatabaseSection {
  id: string
  project_id: string
  section_type: "header" | "content" | "image" | "list" | "footer"
  title: string
  content: Section["content"]
  icon: string
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseAsset {
  id: string
  project_id: string
  asset_type: "original_file" | "image" | "export" | "thumbnail"
  filename: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  metadata: Record<string, any>
  created_at: string
}

// Client-side database functions
export const database = {
  // Projects
  async getProjects(): Promise<DatabaseProject[]> {
    const supabase = createClient()
    const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getProject(id: string): Promise<DatabaseProject | null> {
    const supabase = createClient()
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw error
    }
    return data
  },

  async createProject(project: {
    title: string
    description?: string
    original_filename?: string
    file_type?: string
    theme_settings?: Settings
  }): Promise<DatabaseProject> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        title: project.title,
        description: project.description || null,
        original_filename: project.original_filename || null,
        file_type: project.file_type || null,
        theme_settings: project.theme_settings || {},
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProject(
    id: string,
    updates: {
      title?: string
      description?: string
      status?: "draft" | "published" | "archived"
      theme_settings?: Settings
    },
  ): Promise<DatabaseProject> {
    const supabase = createClient()
    const { data, error } = await supabase.from("projects").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async deleteProject(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) throw error
  },

  // Project Sections
  async getProjectSections(projectId: string): Promise<DatabaseSection[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("project_sections")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order")

    if (error) throw error
    return data || []
  },

  async createSection(section: {
    project_id: string
    section_type: DatabaseSection["section_type"]
    title: string
    content: Section["content"]
    icon?: string
    sort_order?: number
  }): Promise<DatabaseSection> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("project_sections")
      .insert({
        project_id: section.project_id,
        section_type: section.section_type,
        title: section.title,
        content: section.content,
        icon: section.icon || "📄",
        sort_order: section.sort_order || 0,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateSection(
    id: string,
    updates: {
      title?: string
      content?: Section["content"]
      icon?: string
      sort_order?: number
      is_visible?: boolean
    },
  ): Promise<DatabaseSection> {
    const supabase = createClient()
    const { data, error } = await supabase.from("project_sections").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async deleteSection(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("project_sections").delete().eq("id", id)

    if (error) throw error
  },

  // Project Assets
  async getProjectAssets(projectId: string): Promise<DatabaseAsset[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("project_assets")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createAsset(asset: {
    project_id: string
    asset_type: DatabaseAsset["asset_type"]
    filename: string
    file_path: string
    file_size?: number
    mime_type?: string
    metadata?: Record<string, any>
  }): Promise<DatabaseAsset> {
    const supabase = createClient()
    const { data, error } = await supabase.from("project_assets").insert(asset).select().single()

    if (error) throw error
    return data
  },

  async deleteAsset(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("project_assets").delete().eq("id", id)

    if (error) throw error
  },
}

// Utility functions to convert between database and app state formats
export function databaseProjectToAppProject(dbProject: DatabaseProject, dbSections: DatabaseSection[]): Project {
  return {
    title: dbProject.title,
    logoUrl: null, // TODO: Handle logo from assets
    sections: dbSections.map((section) => ({
      id: section.id,
      icon: section.icon,
      name: section.title,
      isHeader: section.section_type === "header",
      content: section.content,
    })),
  }
}

export function appProjectToDatabaseProject(
  appProject: Project,
  settings: Settings,
): {
  project: Omit<DatabaseProject, "id" | "user_id" | "created_at" | "updated_at">
  sections: Omit<DatabaseSection, "id" | "project_id" | "created_at" | "updated_at">[]
} {
  return {
    project: {
      title: appProject.title,
      description: null,
      original_filename: null,
      file_type: null,
      status: "draft",
      theme_settings: settings,
    },
    sections: appProject.sections.map((section, index) => ({
      section_type: section.isHeader ? "header" : "content",
      title: section.name,
      content: section.content,
      icon: section.icon,
      sort_order: index,
      is_visible: true,
    })),
  }
}
