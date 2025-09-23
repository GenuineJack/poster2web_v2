"use client"

import type { Section } from "@/hooks/use-app-state"
import { ErrorHandler } from "./error-handler"

export async function processFile(file: File): Promise<Section[]> {
  const fileExtension = file.name.split(".").pop()?.toLowerCase()

  try {
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 50MB limit")
    }

    switch (fileExtension) {
      case "pdf":
        return await processPDF(file)
      case "pptx":
        return await processPPTX(file)
      case "docx":
        return await processDOCX(file)
      case "txt":
        return await processText(file)
      case "md":
        return await processMarkdown(file)
      case "html":
      case "htm":
        return await processHTML(file)
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
      case "svg":
      case "tiff":
        return await processImage(file)
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`)
    }
  } catch (error) {
    const appError = ErrorHandler.handleFileProcessingError(error, file.name)
    ErrorHandler.logError(appError)
    console.error("File processing error:", error)
    // Fallback to basic sections
    return createBasicSections(file.name)
  }
}

async function processPDF(file: File): Promise<Section[]> {
  // For now, create basic sections - full PDF processing would require pdf.js
  const fileName = file.name.replace(/\.[^/.]+$/, "")

  return [
    {
      id: "header",
      icon: "📄",
      name: "Header",
      isHeader: true,
      content: [
        {
          type: "text",
          value: `<h1>${fileName}</h1>`,
          allowHtml: false,
        },
      ],
    },
    {
      id: "content",
      icon: "📝",
      name: "Content",
      content: [
        {
          type: "text",
          value:
            "<p>PDF processing is being implemented. For now, you can add your content manually using the editor below.</p><p>Features coming soon:</p><ul><li>Text extraction from PDF pages</li><li>Image extraction</li><li>Automatic section detection</li><li>OCR for scanned documents</li></ul>",
          allowHtml: false,
        },
      ],
    },
  ]
}

async function processPPTX(file: File): Promise<Section[]> {
  // Basic PPTX processing - full implementation would require JSZip
  const fileName = file.name.replace(/\.[^/.]+$/, "")

  return [
    {
      id: "header",
      icon: "📊",
      name: "Header",
      isHeader: true,
      content: [
        {
          type: "text",
          value: `<h1>${fileName}</h1>`,
          allowHtml: false,
        },
      ],
    },
    {
      id: "content",
      icon: "📝",
      name: "Content",
      content: [
        {
          type: "text",
          value:
            "<p>PowerPoint processing is being implemented. For now, you can add your content manually using the editor below.</p><p>Features coming soon:</p><ul><li>Slide text extraction</li><li>Speaker notes extraction</li><li>Image extraction from slides</li><li>Automatic slide-to-section conversion</li></ul>",
          allowHtml: false,
        },
      ],
    },
  ]
}

async function processDOCX(file: File): Promise<Section[]> {
  const fileName = file.name.replace(/\.[^/.]+$/, "")

  return [
    {
      id: "header",
      icon: "📝",
      name: "Header",
      isHeader: true,
      content: [
        {
          type: "text",
          value: `<h1>${fileName}</h1>`,
          allowHtml: false,
        },
      ],
    },
    {
      id: "content",
      icon: "📄",
      name: "Document Content",
      content: [
        {
          type: "text",
          value:
            "<p>Word document processing is coming soon!</p><p>For now, you can:</p><ul><li>Save your document as PDF and upload it</li><li>Copy and paste your content into a text file</li><li>Use the editor below to manually add your content</li></ul>",
          allowHtml: false,
        },
      ],
    },
  ]
}

async function processText(file: File): Promise<Section[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    const timeout = setTimeout(() => {
      reader.abort()
      reject(new Error("File processing timeout"))
    }, 30000) // 30 second timeout

    reader.onload = (e) => {
      clearTimeout(timeout)
      try {
        const text = e.target?.result as string
        const sections = parseTextIntoSections(text, file.name)
        resolve(sections)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      clearTimeout(timeout)
      reject(new Error("Failed to read text file"))
    }

    reader.onabort = () => {
      clearTimeout(timeout)
      reject(new Error("File reading was aborted"))
    }

    reader.readAsText(file)
  })
}

async function processMarkdown(file: File): Promise<Section[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    const timeout = setTimeout(() => {
      reader.abort()
      reject(new Error("File processing timeout"))
    }, 30000) // 30 second timeout

    reader.onload = (e) => {
      clearTimeout(timeout)
      try {
        const markdown = e.target?.result as string
        const sections = parseMarkdownIntoSections(markdown, file.name)
        resolve(sections)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      clearTimeout(timeout)
      reject(new Error("Failed to read Markdown file"))
    }

    reader.onabort = () => {
      clearTimeout(timeout)
      reject(new Error("File reading was aborted"))
    }

    reader.readAsText(file)
  })
}

async function processHTML(file: File): Promise<Section[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    const timeout = setTimeout(() => {
      reader.abort()
      reject(new Error("File processing timeout"))
    }, 30000) // 30 second timeout

    reader.onload = (e) => {
      clearTimeout(timeout)
      try {
        const html = e.target?.result as string
        const sections = parseHTMLIntoSections(html, file.name)
        resolve(sections)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      clearTimeout(timeout)
      reject(new Error("Failed to read HTML file"))
    }

    reader.onabort = () => {
      clearTimeout(timeout)
      reject(new Error("File reading was aborted"))
    }

    reader.readAsText(file)
  })
}

async function processImage(file: File): Promise<Section[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    const timeout = setTimeout(() => {
      reader.abort()
      reject(new Error("Image processing timeout"))
    }, 30000) // 30 second timeout

    reader.onload = (e) => {
      clearTimeout(timeout)
      try {
        const dataUrl = e.target?.result as string
        const sections = createImageSections(dataUrl, file.name)
        resolve(sections)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      clearTimeout(timeout)
      reject(new Error("Failed to read image file"))
    }

    reader.onabort = () => {
      clearTimeout(timeout)
      reject(new Error("Image reading was aborted"))
    }

    reader.readAsDataURL(file)
  })
}

function parseTextIntoSections(text: string, fileName: string): Section[] {
  const sections: Section[] = []
  const cleanFileName = fileName.replace(/\.[^/.]+$/, "")

  // Create header section
  sections.push({
    id: "header",
    icon: "📄",
    name: "Header",
    isHeader: true,
    content: [
      {
        type: "text",
        value: `<h1>${cleanFileName}</h1>`,
        allowHtml: false,
      },
    ],
  })

  // Common section headers to look for
  const sectionHeaders = [
    "abstract",
    "introduction",
    "background",
    "methods",
    "methodology",
    "results",
    "discussion",
    "conclusion",
    "references",
    "acknowledgments",
    "summary",
    "objectives",
    "materials",
    "analysis",
    "findings",
    "recommendations",
    "future work",
    "limitations",
    "appendix",
  ]

  // Split text into lines
  const lines = text.split(/\r?\n/).filter((line) => line.trim())

  let currentSection: Section | null = null
  let currentContent: string[] = []

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim()

    // Check if this line is a section header
    const matchedHeader = sectionHeaders.find(
      (header) => lowerLine.startsWith(header) || lowerLine === header || lowerLine.includes(header + ":"),
    )

    if (matchedHeader) {
      // Save previous section if exists
      if (currentSection && currentContent.length > 0) {
        currentSection.content.push({
          type: "text",
          value: "<p>" + currentContent.join("</p><p>") + "</p>",
          allowHtml: false,
        })
        sections.push(currentSection)
      }

      // Start new section
      currentSection = {
        id: matchedHeader.replace(/\s+/g, "-"),
        icon: detectSectionIcon(matchedHeader),
        name: matchedHeader.charAt(0).toUpperCase() + matchedHeader.slice(1),
        content: [],
      }
      currentContent = []
    } else if (line.trim()) {
      // Add line to current content
      currentContent.push(line.trim())
    }
  }

  // Save last section
  if (currentSection && currentContent.length > 0) {
    currentSection.content.push({
      type: "text",
      value: "<p>" + currentContent.join("</p><p>") + "</p>",
      allowHtml: false,
    })
    sections.push(currentSection)
  }

  // If no sections were detected, put all content in one section
  if (sections.length === 1) {
    const allContent = lines.join("</p><p>")
    sections.push({
      id: "content",
      icon: "📄",
      name: "Content",
      content: [
        {
          type: "text",
          value: "<p>" + allContent + "</p>",
          allowHtml: false,
        },
      ],
    })
  }

  return sections
}

function parseMarkdownIntoSections(markdown: string, fileName: string): Section[] {
  const sections: Section[] = []
  const cleanFileName = fileName.replace(/\.[^/.]+$/, "")

  // Split by headers
  const parts = markdown.split(/^#{1,3}\s+(.+)$/gm)

  // Create header section
  sections.push({
    id: "header",
    icon: "📝",
    name: "Header",
    isHeader: true,
    content: [
      {
        type: "text",
        value: `<h1>${parts[1] || cleanFileName}</h1>`,
        allowHtml: false,
      },
    ],
  })

  // Process remaining content
  for (let i = 2; i < parts.length; i += 2) {
    const heading = parts[i - 1]
    const content = parts[i]

    if (heading && content) {
      sections.push({
        id: `section-${i}`,
        icon: detectSectionIcon(heading.toLowerCase()),
        name: heading.substring(0, 30),
        content: [
          {
            type: "text",
            value: convertMarkdownToHtml(content),
            allowHtml: false,
          },
        ],
      })
    }
  }

  // If no sections found, put all content in one section
  if (sections.length === 1) {
    sections.push({
      id: "content",
      icon: "📄",
      name: "Content",
      content: [
        {
          type: "text",
          value: convertMarkdownToHtml(markdown),
          allowHtml: false,
        },
      ],
    })
  }

  return sections
}

function parseHTMLIntoSections(htmlContent: string, fileName: string): Section[] {
  const sections: Section[] = []
  const cleanFileName = fileName.replace(/\.[^/.]+$/, "")

  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, "text/html")

  // Extract title from HTML
  let pageTitle = cleanFileName
  const titleElement = doc.querySelector("title")
  if (titleElement && titleElement.textContent?.trim()) {
    pageTitle = titleElement.textContent.trim()
  }

  // Look for main heading (h1)
  const h1Element = doc.querySelector("h1")
  if (h1Element && h1Element.textContent?.trim()) {
    pageTitle = h1Element.textContent.trim()
  }

  // Create header section
  sections.push({
    id: "header",
    icon: "🌐",
    name: "Header",
    isHeader: true,
    content: [
      {
        type: "text",
        value: `<h1>${pageTitle}</h1>`,
        allowHtml: false,
      },
    ],
  })

  // Find semantic sections and content blocks
  const semanticSelectors = ["header", "main", "section", "article", "aside", "nav", "footer"]
  const contentElements: Array<{
    element: Element
    type: string
    tagName: string
    content?: Element[]
    index?: number
  }> = []

  // First, try to find semantic HTML5 elements
  semanticSelectors.forEach((selector) => {
    const elements = doc.querySelectorAll(selector)
    elements.forEach((element) => {
      if (element.textContent?.trim()) {
        contentElements.push({
          element: element,
          type: "semantic",
          tagName: selector,
        })
      }
    })
  })

  // If no semantic elements found, look for headings and their content
  if (contentElements.length === 0) {
    const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6")
    headings.forEach((heading, index) => {
      if (heading.textContent?.trim()) {
        // Find content following this heading
        const content = extractContentAfterHeading(heading)
        contentElements.push({
          element: heading,
          type: "heading",
          tagName: heading.tagName.toLowerCase(),
          content: content,
          index: index,
        })
      }
    })
  }

  // If still no structured content, extract from body
  if (contentElements.length === 0) {
    const bodyContent = doc.body || doc.documentElement
    if (bodyContent && bodyContent.textContent?.trim()) {
      contentElements.push({
        element: bodyContent,
        type: "body",
        tagName: "body",
      })
    }
  }

  // Convert elements to sections
  contentElements.forEach((item, index) => {
    const sectionContent = extractElementContent(item.element, item.content)

    if (sectionContent.trim()) {
      let sectionName = "Content"
      let sectionIcon = "📄"

      // Determine section name and icon based on element type
      if (item.type === "semantic") {
        sectionName = capitalizeFirst(item.tagName)
        sectionIcon = getSemanticIcon(item.tagName)
      } else if (item.type === "heading") {
        const headingText = item.element.textContent?.trim() || ""
        sectionName = headingText.length > 30 ? headingText.substring(0, 30) + "..." : headingText
        sectionIcon = detectSectionIcon(headingText.toLowerCase())
      } else {
        sectionName = `Section ${index + 1}`
      }

      // Skip if this would duplicate the header
      if (item.element.tagName === "H1" && index === 0) {
        return
      }

      sections.push({
        id: `html-section-${index}`,
        icon: sectionIcon,
        name: sectionName,
        content: [
          {
            type: "html",
            value: sectionContent,
            allowRawHtml: true,
          },
        ],
      })
    }
  })

  // If no sections were created, create a default content section
  if (sections.length === 1) {
    const bodyText = doc.body ? doc.body.innerHTML : htmlContent
    sections.push({
      id: "content",
      icon: "📄",
      name: "Content",
      content: [
        {
          type: "html",
          value: sanitizeHTMLContent(bodyText),
          allowRawHtml: true,
        },
      ],
    })
  }

  return sections
}

function createImageSections(dataUrl: string, fileName: string): Section[] {
  const cleanFileName = fileName.replace(/\.[^/.]+$/, "")

  return [
    {
      id: "header",
      icon: "🖼️",
      name: "Header",
      isHeader: true,
      content: [
        {
          type: "text",
          value: `<h1>${cleanFileName}</h1>`,
          allowHtml: false,
        },
      ],
    },
    {
      id: "image-section",
      icon: "📷",
      name: "Image",
      content: [
        {
          type: "image",
          url: dataUrl,
          caption: "Click to edit or replace this image",
        },
      ],
    },
    {
      id: "description",
      icon: "📝",
      name: "Description",
      content: [
        {
          type: "text",
          value:
            "<p>Add a description of your image here. You can edit this text or add more sections using the editor.</p>",
          allowHtml: false,
        },
      ],
    },
  ]
}

function createBasicSections(fileName: string): Section[] {
  const cleanFileName = fileName.replace(/\.[^/.]+$/, "")

  return [
    {
      id: "header",
      icon: "📄",
      name: "Header",
      isHeader: true,
      content: [
        {
          type: "text",
          value: `<h1>${cleanFileName}</h1>`,
          allowHtml: false,
        },
      ],
    },
    {
      id: "content",
      icon: "📝",
      name: "Content",
      content: [
        {
          type: "text",
          value:
            "<p>We couldn't extract text from your file automatically, but you can still use the editor to add your content!</p><p>Use the tools below to:</p><ul><li>Add text sections</li><li>Upload images</li><li>Format your content</li><li>Customize the design</li></ul>",
          allowHtml: false,
        },
      ],
    },
  ]
}

// Helper functions
function detectSectionIcon(text: string): string {
  const iconMap: Record<string, string> = {
    introduction: "📖",
    overview: "📖",
    objective: "🎯",
    goal: "🎯",
    method: "🔬",
    result: "📊",
    finding: "📊",
    conclusion: "✅",
    summary: "✅",
    question: "❓",
    "q&a": "❓",
    thank: "🙏",
    reference: "📚",
    bibliography: "📚",
    contact: "📧",
    background: "📚",
    discussion: "💬",
    analysis: "📈",
    data: "📊",
    recommendation: "💡",
    future: "🔮",
    challenge: "⚠️",
    solution: "💡",
  }

  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (text.includes(keyword)) {
      return icon
    }
  }

  return "📄"
}

function convertMarkdownToHtml(markdown: string): string {
  let html = markdown
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Links
    .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" target="_blank">$1</a>')
    // Line breaks
    .replace(/\n\n/g, "</p><p>")
    // Lists
    .replace(/^\* (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")

  // Wrap in paragraph tags
  if (!html.startsWith("<")) {
    html = "<p>" + html + "</p>"
  }

  // Wrap list items in ul/ol tags
  html = html.replace(/(<li>.*<\/li>)+/g, "<ul>$&</ul>")

  return html
}

function extractContentAfterHeading(heading: Element): Element[] {
  const content: Element[] = []
  let nextElement = heading.nextElementSibling

  while (nextElement) {
    // Stop if we hit another heading of the same or higher level
    if (nextElement.tagName && nextElement.tagName.match(/^H[1-6]$/)) {
      const currentLevel = Number.parseInt(heading.tagName.charAt(1))
      const nextLevel = Number.parseInt(nextElement.tagName.charAt(1))
      if (nextLevel <= currentLevel) {
        break
      }
    }

    content.push(nextElement)
    nextElement = nextElement.nextElementSibling
  }

  return content
}

function extractElementContent(element: Element, additionalContent: Element[] = []): string {
  let content = ""

  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as Element

  // Remove script tags and event handlers for security
  const scripts = clone.querySelectorAll("script")
  scripts.forEach((script) => script.remove())

  // Remove event handler attributes
  const allElements = clone.querySelectorAll("*")
  allElements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith("on")) {
        el.removeAttribute(attr.name)
      }
    })
  })

  // Get the cleaned HTML
  content = clone.innerHTML || clone.textContent || ""

  // Add additional content if provided (for heading-based sections)
  if (additionalContent && additionalContent.length > 0) {
    const additionalHTML = additionalContent
      .map((el) => {
        const cleanEl = el.cloneNode(true) as Element
        // Remove scripts and event handlers from additional content too
        const scripts = cleanEl.querySelectorAll("script")
        scripts.forEach((script) => script.remove())

        const allElements = cleanEl.querySelectorAll("*")
        allElements.forEach((element) => {
          Array.from(element.attributes).forEach((attr) => {
            if (attr.name.startsWith("on")) {
              element.removeAttribute(attr.name)
            }
          })
        })

        return cleanEl.outerHTML
      })
      .join("")

    content += additionalHTML
  }

  return content
}

function getSemanticIcon(tagName: string): string {
  const iconMap: Record<string, string> = {
    header: "🏠",
    main: "📄",
    section: "📝",
    article: "📰",
    aside: "📌",
    nav: "🧭",
    footer: "📧",
  }

  return iconMap[tagName] || "📄"
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function sanitizeHTMLContent(html: string): string {
  if (!html) return ""

  // Create a temporary element to parse and clean HTML
  const temp = document.createElement("div")
  temp.innerHTML = html

  // Remove dangerous elements
  const dangerousElements = temp.querySelectorAll("script, object, embed, iframe, form, input, button")
  dangerousElements.forEach((el) => el.remove())

  // Remove dangerous attributes
  const allElements = temp.querySelectorAll("*")
  allElements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith("on") || (attr.name === "href" && attr.value.startsWith("javascript:"))) {
        el.removeAttribute(attr.name)
      }
    })
  })

  return temp.innerHTML
}
