"use client"

import { useState } from "react"
import { Settings, Plus, Trash2, Link, Mail, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAppState } from "@/hooks/use-app-state"

export function SettingsTab() {
  const { currentProject, settings, actions } = useAppState()
  const [newButton, setNewButton] = useState({
    type: "link" as "file" | "link" | "email",
    label: "",
    value: "",
  })

  const handleAddButton = () => {
    if (newButton.label && newButton.value) {
      const button = {
        id: `button-${Date.now()}`,
        ...newButton,
      }
      actions.updateSettings({
        buttons: [...settings.buttons, button],
      })
      setNewButton({ type: "link", label: "", value: "" })
    }
  }

  const handleDeleteButton = (buttonId: string) => {
    actions.updateSettings({
      buttons: settings.buttons.filter((b) => b.id !== buttonId),
    })
  }

  const handleSettingChange = (key: string, value: any) => {
    actions.updateSettings({ [key]: value })
  }

  const getButtonIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "file":
        return <Download className="h-4 w-4" />
      default:
        return <Link className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Project Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-title">Project Title</Label>
            <Input
              id="project-title"
              value={currentProject.title}
              onChange={(e) => actions.updateProject({ title: e.target.value })}
              placeholder="My Website"
            />
          </div>

          <div>
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input
              id="logo-url"
              value={currentProject.logoUrl || ""}
              onChange={(e) => actions.updateProject({ logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
            />
            <Label htmlFor="dark-mode">Dark Mode</Label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Action Buttons</CardTitle>
          <p className="text-sm text-muted-foreground">Add buttons for downloads, links, or contact actions</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Buttons */}
          {settings.buttons.length > 0 && (
            <div className="space-y-2">
              {settings.buttons.map((button) => (
                <div key={button.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  {getButtonIcon(button.type)}
                  <div className="flex-1">
                    <div className="font-medium">{button.label}</div>
                    <div className="text-sm text-muted-foreground">{button.value}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteButton(button.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Button */}
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium">Add New Button</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Button Type</Label>
                <Select
                  value={newButton.type}
                  onValueChange={(value) => setNewButton({ ...newButton, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="file">File Download</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Button Label</Label>
                <Input
                  value={newButton.label}
                  onChange={(e) => setNewButton({ ...newButton, label: e.target.value })}
                  placeholder="Contact Us"
                />
              </div>
            </div>
            <div>
              <Label>
                {newButton.type === "email" ? "Email Address" : newButton.type === "file" ? "File URL" : "Link URL"}
              </Label>
              <Input
                value={newButton.value}
                onChange={(e) => setNewButton({ ...newButton, value: e.target.value })}
                placeholder={
                  newButton.type === "email"
                    ? "contact@example.com"
                    : newButton.type === "file"
                      ? "https://example.com/file.pdf"
                      : "https://example.com"
                }
              />
            </div>
            <Button onClick={handleAddButton} className="gap-2" disabled={!newButton.label || !newButton.value}>
              <Plus className="h-4 w-4" />
              Add Button
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <p className="text-sm text-muted-foreground">Add Google Analytics or other tracking code</p>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="analytics-code">Analytics Code</Label>
            <Textarea
              id="analytics-code"
              value={settings.analyticsCode}
              onChange={(e) => handleSettingChange("analyticsCode", e.target.value)}
              placeholder=" Google Analytics or other tracking code "
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
