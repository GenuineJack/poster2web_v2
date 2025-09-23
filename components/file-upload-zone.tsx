"use client"

import type React from "react"
import { useCallback, useState, useEffect, memo } from "react"
import { Upload, FileText, ImageIcon, FileCode, Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { validateFile, getFileTypeInfo, formatFileSize } from "@/lib/file-validation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void
}

export const FileUploadZone = memo(function FileUploadZone({ onFileUpload }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateFile> | null>(null)
  const [uploadTimeoutRef, setUploadTimeoutRef] = useState<NodeJS.Timeout | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }, [])

  const handleFileSelection = useCallback(
    (file: File) => {
      if (uploadTimeoutRef) {
        clearTimeout(uploadTimeoutRef)
        setUploadTimeoutRef(null)
      }

      setSelectedFile(file)
      const validation = validateFile(file)
      setValidationResult(validation)

      if (validation.isValid) {
        const timeoutId = setTimeout(() => {
          onFileUpload(file)
          setUploadTimeoutRef(null)
        }, 500)
        setUploadTimeoutRef(timeoutId)
      }
    },
    [onFileUpload, uploadTimeoutRef],
  )

  const handleClick = useCallback(() => {
    const input = document.getElementById("file-input") as HTMLInputElement
    input?.click()
  }, [])

  const handleUploadAnyway = useCallback(() => {
    if (selectedFile) {
      onFileUpload(selectedFile)
    }
  }, [selectedFile, onFileUpload])

  useEffect(() => {
    return () => {
      if (uploadTimeoutRef) {
        clearTimeout(uploadTimeoutRef)
      }
    }
  }, [uploadTimeoutRef])

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer group",
          "bg-card/30 backdrop-blur-sm",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border/50 hover:border-primary/50 hover:bg-card/50",
          selectedFile && validationResult?.isValid && "border-green-500/50 bg-green-500/5",
          selectedFile && !validationResult?.isValid && "border-red-500/50 bg-red-500/5",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.pptx,.docx,.txt,.md,.html,.htm,.png,.jpg,.jpeg,.gif,.webp,.svg,.tiff"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              {selectedFile && validationResult?.isValid ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : selectedFile && !validationResult?.isValid ? (
                <AlertCircle className="h-8 w-8 text-red-500" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>

            {/* Floating file type icons */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-background border border-border rounded-lg flex items-center justify-center">
              <FileText className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-background border border-border rounded-lg flex items-center justify-center">
              <ImageIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-background border border-border rounded-lg flex items-center justify-center">
              <FileCode className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        {selectedFile ? (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{validationResult?.isValid ? "File Ready!" : "File Selected"}</h3>
            <div className="text-sm text-muted-foreground">
              <div className="font-medium">{selectedFile.name}</div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span>{getFileTypeInfo(selectedFile).name}</span>
                <span>•</span>
                <span>{formatFileSize(selectedFile.size)}</span>
              </div>
            </div>
            {validationResult?.isValid && <p className="text-sm text-green-600">Processing automatically...</p>}
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-2">Drop your content here</h3>
            <p className="text-muted-foreground mb-6">or click anywhere to browse your files</p>

            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
              <Sparkles className="h-4 w-4" />
              Start Weaving
            </div>
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {validationResult && (
        <div className="space-y-2">
          {validationResult.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
                {selectedFile && (
                  <button onClick={handleUploadAnyway} className="mt-2 text-sm underline hover:no-underline">
                    Upload anyway
                  </button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {validationResult.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index}>{warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
})
