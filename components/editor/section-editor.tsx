"use client"

import { useState } from "react"
import { Save, X, Plus, Trash2, ImageIcon, Type, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Section } from "@/hooks/use-app-state"

interface SectionEditorProps {
  section: Section
  onSave: (updates: Partial<Section>) => void
  onCancel: () => void
}

export function SectionEditor({ section, onSave, onCancel }: SectionEditorProps) {
  const [editedSection, setEditedSection] = useState<Section>({ ...section })

  const handleSave = () => {
    onSave(editedSection)
  }

  const handleAddContent = (type: "text" | "image" | "html") => {
    const newContent = {
      type,
      ...(type === "text" && { value: "<p>New text content</p>", allowHtml: false }),
      ...(type === "image" && { url: "/abstract-geometric-sculpture.png", caption: "Image caption" }),
      ...(type === "html" && { value: "<div>Custom HTML content</div>", allowRawHtml: true }),
    }

    setEditedSection({
      ...editedSection,
      content: [...editedSection.content, newContent],
    })
  }

  const handleUpdateContent = (index: number, updates: any) => {
    const newContent = [...editedSection.content]
    newContent[index] = { ...newContent[index], ...updates }
    setEditedSection({ ...editedSection, content: newContent })
  }

  const handleDeleteContent = (index: number) => {
    const newContent = editedSection.content.filter((_, i) => i !== index)
    setEditedSection({ ...editedSection, content: newContent })
  }

  return (
    <div className="space-y-4">
      {/* Section Settings */}
      <Card>
        <CardHeader className="pb-3">
          <h4 className="font-medium">Section Settings</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="section-name">Section Name</Label>
              <Input
                id="section-name"
                value={editedSection.name}
                onChange={(e) => setEditedSection({ ...editedSection, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="section-icon">Icon</Label>
              <Input
                id="section-icon"
                value={editedSection.icon}
                onChange={(e) => setEditedSection({ ...editedSection, icon: e.target.value })}
                placeholder="📝"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Content Items</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleAddContent("text")} className="gap-2">
              <Type className="h-3 w-3" />
              Text
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddContent("image")} className="gap-2">
              <ImageIcon className="h-3 w-3" />
              Image
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddContent("html")} className="gap-2">
              <Code className="h-3 w-3" />
              HTML
            </Button>
          </div>
        </div>

        {editedSection.content.map((content, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground uppercase">{content.type}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteContent(index)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {content.type === "text" && (
                <div className="space-y-3">
                  <Textarea
                    value={content.value || ""}
                    onChange={(e) => handleUpdateContent(index, { value: e.target.value })}
                    placeholder="Enter your text content..."
                    rows={4}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`allow-html-${index}`}
                      checked={content.allowHtml || false}
                      onChange={(e) => handleUpdateContent(index, { allowHtml: e.target.checked })}
                    />
                    <Label htmlFor={`allow-html-${index}`} className="text-sm">
                      Allow HTML formatting
                    </Label>
                  </div>
                </div>
              )}

              {content.type === "image" && (
                <div className="space-y-3">
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={content.url || ""}
                      onChange={(e) => handleUpdateContent(index, { url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label>Caption</Label>
                    <Input
                      value={content.caption || ""}
                      onChange={(e) => handleUpdateContent(index, { caption: e.target.value })}
                      placeholder="Image caption..."
                    />
                  </div>
                  {content.url && (
                    <img
                      src={content.url || "/placeholder.svg"}
                      alt={content.caption || ""}
                      className="max-w-full h-auto rounded border"
                    />
                  )}
                </div>
              )}

              {content.type === "html" && (
                <div className="space-y-3">
                  <Textarea
                    value={content.value || ""}
                    onChange={(e) => handleUpdateContent(index, { value: e.target.value })}
                    placeholder="Enter your HTML content..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`allow-raw-html-${index}`}
                      checked={content.allowRawHtml || false}
                      onChange={(e) => handleUpdateContent(index, { allowRawHtml: e.target.checked })}
                    />
                    <Label htmlFor={`allow-raw-html-${index}`} className="text-sm">
                      Allow raw HTML (use with caution)
                    </Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {editedSection.content.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-3">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">No content items yet</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAddContent("text")} className="gap-2">
                  <Type className="h-3 w-3" />
                  Add Text
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddContent("image")} className="gap-2">
                  <ImageIcon className="h-3 w-3" />
                  Add Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} className="gap-2 bg-transparent">
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
