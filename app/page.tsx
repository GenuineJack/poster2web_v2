"use client"

import { useState, useCallback } from "react"
import { FileCode, Sparkles, ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FileUploadZone } from "@/components/file-upload-zone"
import { LoadingScreen } from "@/components/loading-screen"
import { EditorScreen } from "@/components/editor-screen"
import { InfoModal } from "@/components/info-modal"
import { useAppState } from "@/hooks/use-app-state"
import { processFile } from "@/lib/file-processors"

export default function HomePage() {
  const { toast } = useToast()
  const [showInfo, setShowInfo] = useState(false)
  const { state, actions } = useAppState()

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        actions.setLoading(true, "Processing your file", "Analyzing document structure...")

        const sections = await processFile(file)

        actions.loadProject({
          title: file.name.replace(/\.[^/.]+$/, ""),
          sections,
          logoUrl: null,
        })

        actions.setScreen("editor")
      } catch (error) {
        console.error("File processing error:", error)
        toast({
          title: "Processing Error",
          description: error instanceof Error ? error.message : "Failed to process file",
          variant: "destructive",
        })
      } finally {
        actions.setLoading(false)
      }
    },
    [actions, toast],
  )

  const handleCreateBlank = useCallback(() => {
    actions.resetProject()
    actions.setScreen("editor")
  }, [actions])

  if (!state || !state.ui) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (state.ui.isLoading) {
    return <LoadingScreen />
  }

  if (state.ui.currentScreen === "editor") {
    return <EditorScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowInfo(true)}
          className="bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-accent transition-all duration-200 hover:scale-105"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20 animate-fade-in">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Transform Documents into Websites
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight animate-fade-in-up">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Poster2Web
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Transform documents into beautiful websites in minutes.{" "}
            <span className="text-foreground font-semibold">No coding required.</span>
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in-up animation-delay-300">
            <Badge variant="secondary">PDF Support</Badge>
            <Badge variant="secondary">PowerPoint</Badge>
            <Badge variant="secondary">Text Files</Badge>
            <Badge variant="secondary">Images</Badge>
            <Badge variant="secondary">HTML</Badge>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-16 animate-fade-in-up animation-delay-400">
          <FileUploadZone onFileUpload={handleFileUpload} />

          <div className="text-center mt-6 text-sm text-muted-foreground">
            Drag & drop your files or click to browse • Max 50MB per file
          </div>

          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={handleCreateBlank}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-accent transition-all duration-200 hover:scale-105"
            >
              Start with Blank Template
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-12 animate-fade-in-up animation-delay-500">
          <h2 className="text-3xl font-bold mb-4">Why Choose Poster2Web?</h2>
          <p className="text-muted-foreground mb-12 max-w-lg mx-auto text-lg">
            The fastest way to turn your content into professional websites
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300 group-hover:bg-primary/20">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">Transform documents to websites in under 60 seconds</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300 group-hover:bg-primary/20">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Beautiful Design</h3>
                <p className="text-sm text-muted-foreground">Professional templates with customizable themes</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300 group-hover:bg-primary/20">
                  <FileCode className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Export Ready</h3>
                <p className="text-sm text-muted-foreground">Download as HTML, React, or Next.js projects</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center py-16 animate-fade-in-up animation-delay-600">
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Documents Converted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">99%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">&lt; 60s</div>
              <div className="text-sm text-muted-foreground">Average Processing</div>
            </div>
          </div>
        </div>
      </div>

      <InfoModal open={showInfo} onOpenChange={setShowInfo} />
    </div>
  )
}
