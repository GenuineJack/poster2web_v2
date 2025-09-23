"use client"

import { useState } from "react"
import { Download, Code, FileText, Smartphone, Copy, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAppState } from "@/hooks/use-app-state"
import { exportToHTML } from "@/lib/exporters/html-exporter"
import { exportToReact } from "@/lib/exporters/react-exporter"
import { exportToNextJS } from "@/lib/exporters/nextjs-exporter"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { state } = useAppState()
  const [activeTab, setActiveTab] = useState("html")
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const handleCopy = async (content: string, key: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedStates({ ...copiedStates, [key]: true })
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleDownload = (content: string, filename: string, mimeType = "text/plain") => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const htmlContent = exportToHTML(state.currentProject, state.settings)
  const reactContent = exportToReact(state.currentProject, state.settings)
  const nextjsContent = exportToNextJS(state.currentProject, state.settings)

  const exports = [
    {
      id: "html",
      title: "HTML",
      description: "Complete HTML file with embedded CSS",
      icon: <FileText className="h-5 w-5" />,
      content: htmlContent,
      filename: `${state.currentProject.title.toLowerCase().replace(/\s+/g, "-")}.html`,
      language: "html",
    },
    {
      id: "react",
      title: "React Component",
      description: "React component with inline styles",
      icon: <Code className="h-5 w-5" />,
      content: reactContent,
      filename: `${state.currentProject.title.replace(/\s+/g, "")}.jsx`,
      language: "javascript",
    },
    {
      id: "nextjs-page",
      title: "Next.js Page",
      description: "Next.js page component with metadata",
      icon: <Smartphone className="h-5 w-5" />,
      content: nextjsContent.page,
      filename: `page.tsx`,
      language: "typescript",
    },
    {
      id: "nextjs-metadata",
      title: "Next.js Metadata",
      description: "Metadata configuration for SEO",
      icon: <Code className="h-5 w-5" />,
      content: nextjsContent.metadata,
      filename: `metadata.ts`,
      language: "typescript",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Website
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="html" className="gap-2">
              <FileText className="h-4 w-4" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="react" className="gap-2">
              <Code className="h-4 w-4" />
              React
            </TabsTrigger>
            <TabsTrigger value="nextjs-page" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Next.js Page
            </TabsTrigger>
            <TabsTrigger value="nextjs-metadata" className="gap-2">
              <Code className="h-4 w-4" />
              Metadata
            </TabsTrigger>
          </TabsList>

          {exports.map((exportItem) => (
            <TabsContent key={exportItem.id} value={exportItem.id} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {exportItem.icon}
                    {exportItem.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{exportItem.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={() => handleDownload(exportItem.content, exportItem.filename)} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download {exportItem.filename}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(exportItem.content, exportItem.id)}
                      className="gap-2 bg-transparent"
                    >
                      {copiedStates[exportItem.id] ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="relative">
                    <Textarea
                      value={exportItem.content}
                      readOnly
                      className="font-mono text-xs h-96 resize-none"
                      placeholder="Generated code will appear here..."
                    />
                  </div>

                  {exportItem.id === "html" && (
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>Usage:</strong> Save as an HTML file and open in any web browser. No additional setup
                        required.
                      </p>
                    </div>
                  )}

                  {exportItem.id === "react" && (
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>Usage:</strong> Copy this component into your React project. Make sure you have React
                        installed.
                      </p>
                    </div>
                  )}

                  {exportItem.id === "nextjs-page" && (
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>Usage:</strong> Save as <code>page.tsx</code> in your Next.js app directory. Requires
                        Next.js 13+ with App Router.
                      </p>
                    </div>
                  )}

                  {exportItem.id === "nextjs-metadata" && (
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>Usage:</strong> Add this metadata to your Next.js page for better SEO. Include in your
                        page component or layout.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
