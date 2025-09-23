"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Section } from "@/hooks/use-app-state"
import { createSectionFromTemplate, getSectionTemplatesByCategory } from "@/lib/section-templates"

interface AddSectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSection: (section: Section) => void
}

export function AddSectionDialog({ open, onOpenChange, onAddSection }: AddSectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"content" | "media" | "interactive" | "layout">("content")

  const filteredTemplates = getSectionTemplatesByCategory(selectedCategory).filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddTemplate = (templateId: string) => {
    const section = createSectionFromTemplate(templateId)
    if (section) {
      onAddSection(section)
    }
  }

  const handleAddBlank = () => {
    const blankSection: Section = {
      id: `section-${Date.now()}`,
      icon: "📝",
      name: "New Section",
      content: [
        {
          type: "text",
          value: "<p>Add your content here...</p>",
          allowHtml: false,
        },
      ],
    }
    onAddSection(blankSection)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button onClick={handleAddBlank} variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Blank Section
            </Button>
          </div>

          {/* Templates */}
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="interactive">Interactive</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{template.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                          <Button size="sm" onClick={() => handleAddTemplate(template.id)} className="gap-2">
                            <Plus className="h-3 w-3" />
                            Add Section
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No templates found matching your search.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
