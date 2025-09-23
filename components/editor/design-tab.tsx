"use client"

import { useState } from "react"
import { Palette, Type, Layout, Smartphone, Monitor, Tablet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useAppState } from "@/hooks/use-app-state"

const colorSchemes = [
  { id: "growth-green", name: "Growth Green", primary: "#16a34a", secondary: "#15803d" },
  { id: "trust-blue", name: "Trust Blue", primary: "#2563eb", secondary: "#1d4ed8" },
  { id: "premium-purple", name: "Premium Purple", primary: "#9333ea", secondary: "#7c3aed" },
  { id: "bold-red", name: "Bold Red", primary: "#dc2626", secondary: "#b91c1c" },
  { id: "modern-teal", name: "Modern Teal", primary: "#0d9488", secondary: "#0f766e" },
  { id: "sunset-orange", name: "Sunset Orange", primary: "#ea580c", secondary: "#c2410c" },
  { id: "energy-yellow", name: "Energy Yellow", primary: "#ca8a04", secondary: "#a16207" },
  { id: "professional-grey", name: "Professional Grey", primary: "#374151", secondary: "#1f2937" },
]

export function DesignTab() {
  const { state, actions } = useAppState()
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("desktop")

  const handleColorSchemeChange = (schemeId: string) => {
    actions.updateColorScheme(schemeId)
  }

  const handleSettingChange = (key: string, value: any) => {
    actions.updateSettings({ [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Preview Device Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Preview Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={previewDevice === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewDevice("mobile")}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </Button>
            <Button
              variant={previewDevice === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewDevice("tablet")}
              className="gap-2"
            >
              <Tablet className="h-4 w-4" />
              Tablet
            </Button>
            <Button
              variant={previewDevice === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewDevice("desktop")}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Scheme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {colorSchemes.map((scheme) => (
              <Button
                key={scheme.id}
                variant="outline"
                className="h-auto p-3 justify-start bg-transparent"
                onClick={() => handleColorSchemeChange(scheme.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.secondary }} />
                  </div>
                  <span className="text-sm">{scheme.name}</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={state.settings.primaryColor}
                  onChange={(e) => handleSettingChange("primaryColor", e.target.value)}
                  className="w-8 h-8 rounded border"
                />
                <span className="text-sm font-mono">{state.settings.primaryColor}</span>
              </div>
            </div>
            <div>
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={state.settings.secondaryColor}
                  onChange={(e) => handleSettingChange("secondaryColor", e.target.value)}
                  className="w-8 h-8 rounded border"
                />
                <span className="text-sm font-mono">{state.settings.secondaryColor}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Font Style</Label>
            <Select value={state.settings.fontStyle} onValueChange={(value) => handleSettingChange("fontStyle", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System Font</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="mono">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title Size: {state.settings.titleSize}px</Label>
            <Slider
              value={[Number.parseInt(state.settings.titleSize)]}
              onValueChange={([value]) => handleSettingChange("titleSize", value.toString())}
              min={24}
              max={72}
              step={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Content Size: {state.settings.contentSize}px</Label>
            <Slider
              value={[Number.parseInt(state.settings.contentSize)]}
              onValueChange={([value]) => handleSettingChange("contentSize", value.toString())}
              min={12}
              max={24}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Layout Style</Label>
            <Select
              value={state.settings.layoutStyle}
              onValueChange={(value) => handleSettingChange("layoutStyle", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Page</SelectItem>
                <SelectItem value="sections">Sectioned</SelectItem>
                <SelectItem value="menu">With Menu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Header Alignment</Label>
            <Select
              value={state.settings.headerAlignment}
              onValueChange={(value) => handleSettingChange("headerAlignment", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Logo Size: {state.settings.logoSize}px</Label>
            <Slider
              value={[Number.parseInt(state.settings.logoSize)]}
              onValueChange={([value]) => handleSettingChange("logoSize", value.toString())}
              min={60}
              max={200}
              step={10}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
