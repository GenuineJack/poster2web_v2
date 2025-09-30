import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { serverDatabase } from "@/lib/server-database"
import { databaseProjectToAppProject } from "@/lib/database"
import { EditorWrapper } from "@/components/editor-wrapper"

// This page uses server-side Supabase functions, which rely on Node.js APIs.
// Set the runtime to 'nodejs' so that Vercel deploys this route on the Node runtime
// instead of the default Edge runtime. Without this, the build may warn about
// unsupported Node APIs in the Edge environment.
export const runtime = 'nodejs';

interface EditorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  try {
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
  } catch (error) {
    redirect("/dashboard")
  }
}
