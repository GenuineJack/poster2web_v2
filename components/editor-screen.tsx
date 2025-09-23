"use client"

import { useState } from "react"
import { ArrowLeft, Eye, Download, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppState } from "@/hooks/use-app-state"
import { ContentTab } from "@/components/editor/content-tab"
import { DesignTab } from "@/components/editor/design-tab"
import { SettingsTab } from "@/components/editor/settings-tab"
import { WebsitePreview } from "@/components/website-preview"
import { ExportDialog } from "@/components/export-dialog"

export function EditorScreen() {
  const { state, actions } = useAppState()
  const [showPreview, setShowPreview] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const handleBack = () => {
    actions.setScreen("upload")
  }

  const toggleDarkMode = () => {
    actions.updateSettings({ darkMode: !state.settings.darkMode })
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
                Back to Upload
              </Button>
              <div>
                <h1 className="text-xl font-bold">Poster2Web Editor</h1>
                <p className="text-sm text-muted-foreground">{state.currentProject.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
