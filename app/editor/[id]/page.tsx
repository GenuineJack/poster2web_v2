import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { serverDatabase } from "@/lib/server-database"
import { databaseProjectToAppProject } from "@/lib/database"
import { EditorWrapper } from "@/components/editor-wrapper"

interface EditorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Load project and sections from database
  const project = await serverDatabase.getProject(id)
  if (!project) {
    redirect("/dashboard")
  }

  const sections = await serverDatabase.getProjectSections(id)
  const appProject = databaseProjectToAppProject(project, sections)

  return <EditorWrapper initialProject={appProject} projectId={id} settings={project.theme_settings} />
}
