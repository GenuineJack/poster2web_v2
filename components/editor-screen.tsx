"use client"

import { useState } from "react"
import { ArrowLeft, Eye, Download, Moon, Sun, Save, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppState } from "@/hooks/use-app-state"
import { useProjectSync } from "@/hooks/use-project-sync"
import { ContentTab } from "@/components/editor/content-tab"
import { DesignTab } from "@/components/editor/design-tab"
import { SettingsTab } from "@/components/editor/settings-tab"
import { WebsitePreview } from "@/components/website-preview"
import { ExportDialog } from "@/components/export-dialog"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export function EditorScreen() {
  const { state, actions } = useAppState()
  const [showPreview, setShowPreview] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isGuestMode = pathname.includes("/guest")

  // Get project ID from window (set by EditorWrapper)
  const projectId = (window as any).__currentProjectId
  const { saveProject } = useProjectSync(projectId)

  const handleBack = () => {
    if (isGuestMode) {
      router.push("/upload")
    } else {
      router.push("/dashboard")
    }
  }

  const toggleDarkMode = () => {
    actions.updateSettings({ darkMode: !state.settings.darkMode })
  }

  const handleSave = async () => {
    if (!isGuestMode) {
      await saveProject()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {isGuestMode ? "Back to Upload" : "Back to Dashboard"}
              </Button>
              <div>
                <h1 className="text-xl font-bold">Poster2Web Editor</h1>
                <p className="text-sm text-muted-foreground">
                  {state.currentProject.title}
                  {isGuestMode && " (Guest Mode)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isGuestMode && state.unsavedChanges && (
                <Button variant="outline" onClick={handleSave} className="gap-2 bg-transparent">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              )}

              {isGuestMode && (
                <Link href="/auth/sign-up">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <User className="h-4 w-4" />
                    Save Work
                  </Button>
                </Link>
              )}

              <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button onClick={() => setShowExport(true)} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="icon" onClick={toggleDarkMode}>
                {state.settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
          {/* Left Panel - Editor */}
          <div className="space-y-6">
            <Tabs value={state.ui.activeTab} onValueChange={(tab) => actions.setActiveTab(tab as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content" className="gap-2">
                  📝 Content
                </TabsTrigger>
                <TabsTrigger value="design" className="gap-2">
                  🎨 Design
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  ⚙️ Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
                <ContentTab />
              </TabsContent>

              <TabsContent value="design" className="mt-6">
                <DesignTab />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
            <div className="bg-card/50 border-b border-border/50 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm text-muted-foreground ml-4">https://your-website.com</div>
              {isGuestMode ? (
                <div className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Guest Mode</div>
              ) : (
                state.unsavedChanges && (
                  <div className="ml-auto text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Unsaved changes</div>
                )
              )}
            </div>
            <div className="h-[calc(100%-60px)]">
              <WebsitePreview />
            </div>
          </div>
        </div>
      </div>

      <ExportDialog open={showExport} onOpenChange={setShowExport} />
    </div>
  )
}
