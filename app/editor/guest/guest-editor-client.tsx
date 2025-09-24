"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamic import with SSR disabled for the guest editor content
const GuestEditorContent = dynamic(() => import("../../../components/guest-editor-content"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  ),
})

export default function GuestEditorClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      }
    >
      <GuestEditorContent />
    </Suspense>
  )
}
