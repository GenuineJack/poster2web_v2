"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAppState } from "@/hooks/use-app-state"

interface InfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InfoModal({ open, onOpenChange }: InfoModalProps) {
  const { actions } = useAppState()

  const handleGetStarted = () => {
    onOpenChange(false)
    actions.setScreen("upload")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">About Poster2Web</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            <strong>Poster2Web</strong> turns PDFs, PowerPoints, images, and text into polished, responsive single-page
            websites. Drag, edit, and export to plain HTML, React, or Next.js—no frameworks required.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">🚀 Fast Build</h4>
                <p className="text-sm text-muted-foreground">
                  Upload or start blank, then rearrange sections and content blocks with ease.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">🎨 Design Controls</h4>
                <p className="text-sm text-muted-foreground">Color schemes, logos, type sizing, and layout modes.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">🧰 Exports</h4>
                <p className="text-sm text-muted-foreground">
                  Download clean HTML, a React component, or a Next.js page.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">🧩 Add-ons</h4>
                <p className="text-sm text-muted-foreground">
                  Custom buttons (email, phone, links, downloads), print-optimized mode, and SEO tags.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleGetStarted} className="flex-1">
              Get Started
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
