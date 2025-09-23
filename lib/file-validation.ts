export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateFile(file: File): FileValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!file) {
    errors.push("No file selected")
    return { isValid: false, errors, warnings }
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    errors.push("File too large. Maximum size is 50MB.")
  }

  // Check file type
  const allowedTypes = [
    "pdf",
    "pptx",
    "docx",
    "txt",
    "md",
    "html",
    "htm",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "svg",
    "tiff",
  ]

  const extension = file.name.split(".").pop()?.toLowerCase()
  if (!extension || !allowedTypes.includes(extension)) {
    errors.push(`Unsupported file type: .${extension}. Please use PDF, PowerPoint, Text, HTML, or Image files.`)
  }

  // Check file name
  if (file.name.length > 255) {
    errors.push("File name too long")
  }

  // Warnings for large files
  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    warnings.push("Large file detected. Processing may take longer.")
  }

  // Warnings for certain file types
  if (extension === "docx") {
    warnings.push("DOCX support is limited. Consider converting to PDF for better results.")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function getFileTypeInfo(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase()

  const typeMap: Record<string, { name: string; icon: string; description: string }> = {
    pdf: { name: "PDF Document", icon: "📄", description: "Portable Document Format" },
    pptx: { name: "PowerPoint", icon: "📊", description: "Microsoft PowerPoint Presentation" },
    docx: { name: "Word Document", icon: "📝", description: "Microsoft Word Document" },
    txt: { name: "Text File", icon: "📄", description: "Plain Text Document" },
    md: { name: "Markdown", icon: "📝", description: "Markdown Document" },
    html: { name: "HTML File", icon: "🌐", description: "HyperText Markup Language" },
    htm: { name: "HTML File", icon: "🌐", description: "HyperText Markup Language" },
    png: { name: "PNG Image", icon: "🖼️", description: "Portable Network Graphics" },
    jpg: { name: "JPEG Image", icon: "🖼️", description: "Joint Photographic Experts Group" },
    jpeg: { name: "JPEG Image", icon: "🖼️", description: "Joint Photographic Experts Group" },
    gif: { name: "GIF Image", icon: "🖼️", description: "Graphics Interchange Format" },
    webp: { name: "WebP Image", icon: "🖼️", description: "Web Picture Format" },
    svg: { name: "SVG Image", icon: "🖼️", description: "Scalable Vector Graphics" },
    tiff: { name: "TIFF Image", icon: "🖼️", description: "Tagged Image File Format" },
  }

  return typeMap[extension || ""] || { name: "Unknown", icon: "❓", description: "Unknown file type" }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
