"use client"

import { useState, useEffect } from "react"
import { Plus, FileText, Calendar, MoreHorizontal, Trash2, Edit, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { database, type DatabaseProject } from "@/lib/database"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export function ProjectList() {
  const [projects, setProjects] = useState<DatabaseProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await database.getProjects()
      setProjects(data)
      setError(null)
    } catch (error) {
      console.error("Error loading projects:", error)
      if (error instanceof Error && error.message.includes("JWT")) {
        setError("Please confirm your email address to access your projects.")
      } else {
        setError("Failed to load projects. Please try refreshing the page.")
      }
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    try {
      const project = await database.createProject({
        title: "New Project",
        description: "A new website project",
      })
      router.push(`/editor/${project.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
      if (error instanceof Error && error.message.includes("JWT")) {
        toast({
          title: "Email Confirmation Required",
          description: "Please confirm your email address before creating projects.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create project",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      await database.deleteProject(id)
      setProjects(projects.filter((p) => p.id !== id))
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const handleDuplicateProject = async (project: DatabaseProject) => {
    try {
      const newProject = await database.createProject({
        title: `${project.title} (Copy)`,
        description: project.description || undefined,
        theme_settings: project.theme_settings,
      })

      const sections = await database.getProjectSections(project.id)
      for (const section of sections) {
        await database.createSection({
          project_id: newProject.id,
          section_type: section.section_type,
          title: section.title,
          content: section.content,
          icon: section.icon,
          sort_order: section.sort_order,
        })
      }

      await loadProjects()
      toast({
        title: "Success",
        description: "Project duplicated successfully",
      })
    } catch (error) {
      console.error("Error duplicating project:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate project",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">My Projects</h2>
            <p className="text-muted-foreground">Manage your website projects</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-800">Unable to Load Projects</h3>
            <p className="text-red-600 text-center mb-4">{error}</p>
            <Button onClick={loadProjects} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Projects</h2>
          <p className="text-muted-foreground">Manage your website projects</p>
        </div>
        <Button onClick={handleCreateProject} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/editor/${project.id}`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateProject(project)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent onClick={() => router.push(`/editor/${project.id}`)}>
              <div className="space-y-2">
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  {project.file_type || "Website"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first project to start building beautiful websites from your documents.
              </p>
              <Button onClick={handleCreateProject} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
