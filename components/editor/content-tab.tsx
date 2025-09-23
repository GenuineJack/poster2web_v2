"use client"

import { useState } from "react"
import { Plus, GripVertical, Edit3, Trash2, Copy, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppState } from "@/hooks/use-app-state"
import { SectionEditor } from "./section-editor"
import { AddSectionDialog } from "./add-section-dialog"
import { cn } from "@/lib/utils"

export function ContentTab() {
  const { state, actions } = useAppState()
  const [editingSection, setEditingSection] = useState<number | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleEditSection = (index: number) => {
    setEditingSection(index)
  }

  const handleSaveSection = (index: number, updates: any) => {
    actions.updateSection(index, updates)
    setEditingSection(null)
  }

  const handleDeleteSection = (index: number) => {
    actions.deleteSection(index)
    if (editingSection === index) {
      setEditingSection(null)
    }
  }

  const handleDuplicateSection = (index: number) => {
    const section = state.currentProject.sections[index]
    const duplicated = {
      ...section,
      id: `${section.id}-copy-${Date.now()}`,
      name: `${section.name} (Copy)`,
    }
    actions.addSection(duplicated)
  }

  const handleToggleExpanded = (sectionId: string) => {
    actions.toggleSectionExpanded(sectionId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Sections</h3>
          <p className="text-sm text-muted-foreground">Manage and edit your website content sections</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      {/* Sections List */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-3">
          {state.currentProject.sections.map((section, index) => {
            const isExpanded = state.ui.expandedSections.has(section.id)
            const isEditing = editingSection === index

            return (
              <Card key={section.id} className={cn("transition-all duration-200", isEditing && "ring-2 ring-primary")}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleExpanded(section.id)}
                      className="p-0 h-auto"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>

                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{section.icon}</span>
                      <div>
                        <h4 className="font-medium">{section.name}</h4>
                        {section.isHeader && (
                          <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded">
                            Header
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSection(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateSection(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(index)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    {isEditing ? (
                      <SectionEditor
                        section={section}
                        onSave={(updates) => handleSaveSection(index, updates)}
                        onCancel={() => setEditingSection(null)}
                      />
                    ) : (
                      <div className="space-y-2">
                        {section.content.map((content, contentIndex) => (
                          <div key={contentIndex} className="p-3 bg-muted/30 rounded-lg text-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-muted-foreground uppercase">
                                {content.type}
                              </span>
                            </div>
                            {content.type === "text" && (
                              <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: content.value || "" }}
                              />
                            )}
                            {content.type === "image" && (
                              <div className="space-y-2">
                                <img
                                  src={content.url || "/placeholder.svg"}
                                  alt={content.caption || ""}
                                  className="max-w-full h-auto rounded"
                                />
                                {content.caption && <p className="text-xs text-muted-foreground">{content.caption}</p>}
                              </div>
                            )}
                            {content.type === "html" && (
                              <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: content.value || "" }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}

          {state.currentProject.sections.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium mb-2">No sections yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first section to start building your website
                </p>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      <AddSectionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddSection={(section) => {
          actions.addSection(section)
          setShowAddDialog(false)
        }}
      />
    </div>
  )
}
