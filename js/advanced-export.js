/**
 * SITEWEAVE - ADVANCED EXPORT FORMATS & INTEGRATIONS
 * Extended export functionality with PDF, Markdown, Vue.js, and deployment integrations
 */

// Import JSZip library
import JSZip from "jszip"

// ===================================================
// PDF EXPORT FUNCTIONALITY
// ===================================================

/**
 * Generate PDF export using browser's print functionality
 */
async function generatePDFExport(project, settings) {
  try {
    // Create a temporary HTML document optimized for PDF
    const htmlContent = generatePDFOptimizedHTML(project, settings)

    // Create a new window for PDF generation
    const printWindow = window.open("", "_blank")
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for content to load
    await new Promise((resolve) => {
      printWindow.onload = resolve
      setTimeout(resolve, 1000) // Fallback timeout
    })

    // Trigger print dialog
    printWindow.print()

    // Close the window after a delay
    setTimeout(() => {
      printWindow.close()
    }, 1000)

    return { success: true, message: "PDF print dialog opened" }
  } catch (error) {
    console.error("PDF export error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate HTML optimized for PDF printing
 */
function generatePDFOptimizedHTML(project, settings) {
  const {
    primaryColor = "#16a34a",
    secondaryColor = "#15803d",
    titleSize = "32",
    contentSize = "16",
    fontStyle = "system",
    headerAlignment = "center",
  } = settings

  const fontFamily = window.LWB_Export.getFontFamily(fontStyle)
  const sectionsHtml = generatePDFSectionsHtml(project, settings)

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(project.title || "Document")}</title>
    <style>
        @page {
            margin: 1in;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${fontFamily};
            font-size: ${contentSize}px;
            line-height: 1.6;
            color: #000;
            background: white;
        }
        
        .header {
            text-align: ${headerAlignment};
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${primaryColor};
        }
        
        .logo {
            max-width: 120px;
            max-height: 120px;
            margin-bottom: 20px;
        }
        
        h1 {
            font-size: ${titleSize}px;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 10px;
        }
        
        h2 {
            font-size: ${Math.round(titleSize * 0.75)}px;
            font-weight: 600;
            color: ${primaryColor};
            margin: 30px 0 15px 0;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: ${Math.round(titleSize * 0.6)}px;
            font-weight: 600;
            color: #333;
            margin: 20px 0 10px 0;
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .content-block {
            margin-bottom: 20px;
        }
        
        .content-block p {
            margin-bottom: 12px;
        }
        
        .content-block ul,
        .content-block ol {
            margin-left: 20px;
            margin-bottom: 12px;
        }
        
        .content-block li {
            margin-bottom: 6px;
        }
        
        .content-block blockquote {
            border-left: 4px solid ${primaryColor};
            padding-left: 16px;
            margin: 16px 0;
            font-style: italic;
            color: #555;
        }
        
        .image-block {
            text-align: center;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        
        .image-block img {
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
        }
        
        .image-caption {
            margin-top: 8px;
            font-style: italic;
            color: #666;
            font-size: ${Math.round(contentSize * 0.9)}px;
        }
        
        a {
            color: ${primaryColor};
            text-decoration: underline;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        th {
            background-color: #f5f5f5;
            font-weight: 600;
        }
        
        pre, code {
            font-family: 'Courier New', monospace;
            background-color: #f5f5f5;
            padding: 4px 8px;
            border-radius: 4px;
        }
        
        pre {
            padding: 12px;
            margin: 12px 0;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    ${sectionsHtml}
</body>
</html>`
}

/**
 * Generate sections HTML for PDF
 */
function generatePDFSectionsHtml(project, settings) {
  return project.sections
    .map((section) => {
      if (section.isHeader) {
        return `
        <div class="header">
            ${project.logoUrl ? `<div><img src="${project.logoUrl}" class="logo" alt="Logo"></div>` : ""}
            ${section.content
              .map((content) => {
                if (content.type === "text") {
                  return content.allowHtml ? sanitizeHtmlContent(content.value) : `<div>${content.value}</div>`
                } else if (content.type === "html") {
                  return sanitizeHtmlContent(content.value)
                }
                return ""
              })
              .join("")}
        </div>`
      } else {
        const prefix = section.showIcon === false ? "" : `${section.icon} `
        return `
        <div class="section">
            <h2>${prefix}${escapeHtml(section.name)}</h2>
            ${section.content
              .map((content) => {
                if (content.type === "text") {
                  return `<div class="content-block">${content.value}</div>`
                } else if (content.type === "html") {
                  return `<div class="content-block">${sanitizeHtmlContent(content.value)}</div>`
                } else if (content.type === "image" && content.url) {
                  return `
            <div class="image-block">
                <img src="${content.url}" alt="${escapeHtml(section.name)} image">
                ${content.caption ? `<div class="image-caption">${content.caption}</div>` : ""}
            </div>`
                }
                return ""
              })
              .join("")}
        </div>`
      }
    })
    .join("")
}

// ===================================================
// MARKDOWN EXPORT
// ===================================================

/**
 * Generate Markdown export
 */
function generateMarkdownExport(project, settings) {
  let markdown = ""

  // Add title from header section
  const headerSection = project.sections.find((s) => s.isHeader)
  if (headerSection) {
    const titleContent = headerSection.content.find((c) => c.type === "text" || c.type === "html")
    if (titleContent) {
      const titleText = extractTextFromHTML(titleContent.value)
      const lines = titleText.split("\n").filter((line) => line.trim())
      if (lines.length > 0) {
        markdown += `# ${lines[0]}\n\n`
        if (lines.length > 1) {
          markdown += `${lines.slice(1).join("\n")}\n\n`
        }
      }
    }
  }

  // Add sections
  project.sections.forEach((section) => {
    if (section.isHeader) return // Skip header as it's already processed

    const prefix = section.showIcon === false ? "" : `${section.icon} `
    markdown += `## ${prefix}${section.name}\n\n`

    section.content.forEach((content) => {
      if (content.type === "text" || content.type === "html") {
        const markdownContent = convertHTMLToMarkdown(content.value)
        markdown += `${markdownContent}\n\n`
      } else if (content.type === "image" && content.url) {
        const altText = section.name
        markdown += `![${altText}](${content.url})\n`
        if (content.caption) {
          const captionText = extractTextFromHTML(content.caption)
          markdown += `*${captionText}*\n`
        }
        markdown += "\n"
      }
    })
  })

  return markdown.trim()
}

/**
 * Convert HTML to Markdown
 */
function convertHTMLToMarkdown(html) {
  if (!html) return ""

  // Create a temporary element to parse HTML
  const temp = document.createElement("div")
  temp.innerHTML = html

  const markdown = ""

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase()
      const children = Array.from(node.childNodes).map(processNode).join("")

      switch (tagName) {
        case "h1":
          return `# ${children}\n\n`
        case "h2":
          return `## ${children}\n\n`
        case "h3":
          return `### ${children}\n\n`
        case "h4":
          return `#### ${children}\n\n`
        case "h5":
          return `##### ${children}\n\n`
        case "h6":
          return `###### ${children}\n\n`
        case "p":
          return `${children}\n\n`
        case "strong":
        case "b":
          return `**${children}**`
        case "em":
        case "i":
          return `*${children}*`
        case "u":
          return `<u>${children}</u>`
        case "code":
          return `\`${children}\``
        case "pre":
          return `\`\`\`\n${children}\n\`\`\`\n\n`
        case "blockquote":
          return `> ${children}\n\n`
        case "a":
          const href = node.getAttribute("href")
          return href ? `[${children}](${href})` : children
        case "ul":
          return `${children}\n`
        case "ol":
          return `${children}\n`
        case "li":
          return `- ${children}\n`
        case "br":
          return "\n"
        case "hr":
          return "---\n\n"
        case "table":
          return `${children}\n`
        case "tr":
          return `${children}\n`
        case "th":
        case "td":
          return `| ${children} `
        default:
          return children
      }
    }

    return ""
  }

  return processNode(temp).trim()
}

/**
 * Extract plain text from HTML
 */
function extractTextFromHTML(html) {
  if (!html) return ""
  const temp = document.createElement("div")
  temp.innerHTML = html
  return temp.textContent || temp.innerText || ""
}

// ===================================================
// VUE.JS EXPORT
// ===================================================

/**
 * Generate Vue.js component export
 */
function generateVueExport(project, settings) {
  const {
    primaryColor = "#16a34a",
    secondaryColor = "#15803d",
    headerAlignment = "center",
    logoSize = "120",
    layoutStyle = "single",
    titleSize = "32",
    contentSize = "16",
  } = settings

  const headerTextColor = computeContrastColor(primaryColor)
  const buttons = generateCustomButtons(settings, layoutStyle)

  return `<template>
  <div class="website-container">
    ${layoutStyle === "menu" ? generateVueMenu() : ""}
    
    <div v-for="section in sections" :key="section.id" :id="section.id">
       Header Section 
      <header v-if="section.isHeader" class="header">
        <div v-if="logoUrl">
          <img :src="logoUrl" class="logo" alt="Logo" />
        </div>
        <div 
          v-for="(content, idx) in section.content" 
          :key="idx"
          v-html="content.value"
        ></div>
      </header>
      
       Regular Section 
      <section v-else class="section">
        <h2>
          <span v-if="section.showIcon !== false">{{ section.icon }}</span>
          {{ section.name }}
        </h2>
        <div v-for="(content, idx) in section.content" :key="idx">
          <div v-if="content.type === 'text'" class="content-block" v-html="content.value"></div>
          <div v-else-if="content.type === 'html'" class="content-block" v-html="sanitizeHtml(content.value)"></div>
          <div v-else-if="content.type === 'image' && content.url" class="image-block">
            <img :src="content.url" :alt="section.name" />
            <div v-if="content.caption" class="image-caption" v-html="content.caption"></div>
          </div>
        </div>
      </section>
    </div>
    
     Buttons for single layout 
    <div v-if="layoutStyle === 'single'" class="button-container">
      ${buttons
        .map((btn) => {
          const href = btn.match(/href="([^"]+)"/)?.[1] || "#"
          const text = btn.match(/>([^<]+)</)?.[1] || "Button"
          const isDownload = btn.includes("download=")
          const filename = btn.match(/download="([^"]+)"/)?.[1] || ""

          if (isDownload) {
            return `<a href="${href}" download="${filename}" class="pdf-download">${text}</a>`
          } else {
            return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="pdf-download">${text}</a>`
          }
        })
        .join("\n      ")}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'WebsiteComponent',
  setup() {
    ${layoutStyle === "menu" ? "const menuOpen = ref(false)" : ""}
    
    const sections = ${JSON.stringify(project.sections, null, 4)}
    const logoUrl = ${project.logoUrl ? `'${project.logoUrl}'` : "null"}
    const layoutStyle = '${layoutStyle}'
    
    const sanitizeHtml = (html) => {
      if (!html) return ''
      // Remove script tags and event handlers for security
      return html
        .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '')
        .replace(/ on\\w+="[^"]*"/gi, '')
        .replace(/ on\\w+='[^']*'/gi, '')
    }
    
    ${
      layoutStyle === "menu"
        ? `
    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value
    }`
        : ""
    }
    
    return {
      sections,
      logoUrl,
      layoutStyle,
      sanitizeHtml,
      ${layoutStyle === "menu" ? "menuOpen, toggleMenu" : ""}
    }
  }
}
</script>

<style scoped>
.website-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.header {
  background: ${primaryColor};
  color: ${headerTextColor};
  padding: 60px 40px;
  border-radius: 16px;
  margin-bottom: 30px;
  text-align: ${headerAlignment};
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.logo {
  max-width: ${logoSize}px;
  max-height: ${logoSize}px;
  margin-bottom: 20px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  display: inline-block;
}

.section {
  background: white;
  padding: 40px;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.section h2 {
  color: ${primaryColor};
  margin: 0 0 20px 0;
  font-size: ${Math.round(titleSize * 0.75)}px;
  font-weight: 600;
}

.content-block {
  margin-bottom: 20px;
  font-size: ${contentSize}px;
  line-height: 1.6;
}

.content-block p {
  margin-bottom: 16px;
}

.content-block a {
  color: ${primaryColor};
  text-decoration: underline;
}

.content-block a:hover {
  color: ${secondaryColor};
}

.image-block {
  text-align: center;
  margin: 32px 0;
}

.image-block img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-caption {
  margin-top: 12px;
  font-style: italic;
  color: #6b7280;
  font-size: ${Math.round(contentSize * 0.9)}px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 40px 0;
  flex-wrap: wrap;
}

.pdf-download {
  background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
  color: white;
  padding: 16px 32px;
  border-radius: 50px;
  font-weight: 600;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.pdf-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: white;
}

${layoutStyle === "menu" ? generateVueMenuStyles(primaryColor) : ""}

@media (max-width: 768px) {
  .website-container {
    padding: 12px;
  }
  
  .header {
    padding: 40px 20px;
    border-radius: 12px;
  }
  
  .section {
    padding: 24px;
    border-radius: 8px;
  }
  
  .button-container {
    flex-direction: column;
    align-items: center;
  }
  
  .pdf-download {
    width: 100%;
    max-width: 300px;
    text-align: center;
  }
}
</style>`
}

/**
 * Generate Vue menu template
 */
function generateVueMenu() {
  return `
     Hamburger Menu 
    <div class="hamburger-menu">
      <button @click="toggleMenu" class="menu-button">
        <div class="menu-line"></div>
        <div class="menu-line"></div>
        <div class="menu-line"></div>
      </button>
      <div v-if="menuOpen" class="menu-dropdown">
        <a 
          v-for="section in sections" 
          :key="section.id"
          :href="'#' + section.id"
          @click="toggleMenu"
        >
          <span v-if="section.showIcon !== false">{{ section.icon }}</span>
          {{ section.name }}
        </a>
        <hr />
         Custom buttons would go here 
      </div>
    </div>`
}

/**
 * Generate Vue menu styles
 */
function generateVueMenuStyles(primaryColor) {
  return `
.hamburger-menu {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.menu-button {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.menu-line {
  width: 24px;
  height: 2px;
  background: ${primaryColor};
  margin: 4px 0;
  transition: all 0.3s ease;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-top: 8px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  min-width: 200px;
}

.menu-dropdown a {
  display: block;
  padding: 8px 12px;
  color: ${primaryColor};
  text-decoration: none;
  font-weight: 500;
  border-radius: 8px;
  transition: background 0.2s;
}

.menu-dropdown a:hover {
  background: #f0fdf4;
}

.menu-dropdown hr {
  margin: 12px 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}`
}

// ===================================================
// DEPLOYMENT INTEGRATIONS
// ===================================================

/**
 * Generate deployment-ready package
 */
function generateDeploymentPackage(project, settings, platform = "netlify") {
  const files = {}

  // Generate main HTML file
  files["index.html"] = window.LWB_Export.generateHTMLExport(project, settings)

  // Generate platform-specific configuration
  switch (platform) {
    case "netlify":
      files["_redirects"] = generateNetlifyRedirects()
      files["netlify.toml"] = generateNetlifyConfig(project)
      break
    case "vercel":
      files["vercel.json"] = generateVercelConfig(project)
      break
    case "github-pages":
      files["CNAME"] = "# Add your custom domain here if needed"
      files[".nojekyll"] = "" // Disable Jekyll processing
      break
  }

  // Generate README
  files["README.md"] = generateDeploymentReadme(project, platform)

  return files
}

/**
 * Generate Netlify redirects
 */
function generateNetlifyRedirects() {
  return `# Netlify redirects
/*    /index.html   200`
}

/**
 * Generate Netlify configuration
 */
function generateNetlifyConfig(project) {
  return `[build]
  publish = "."

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"`
}

/**
 * Generate Vercel configuration
 */
function generateVercelConfig(project) {
  return JSON.stringify(
    {
      version: 2,
      name: project.title || "website",
      builds: [
        {
          src: "index.html",
          use: "@vercel/static",
        },
      ],
      routes: [
        {
          src: "/(.*)",
          dest: "/index.html",
        },
      ],
      headers: [
        {
          source: "/(.*)",
          headers: [
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
          ],
        },
      ],
    },
    null,
    2,
  )
}

/**
 * Generate deployment README
 */
function generateDeploymentReadme(project, platform) {
  const title = project.title || "Website"

  const instructions = {
    netlify: `## Deploy to Netlify

1. Drag and drop this folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your Git repository to Netlify for automatic deployments

Your site will be live at a \`.netlify.app\` URL.`,

    vercel: `## Deploy to Vercel

1. Install Vercel CLI: \`npm i -g vercel\`
2. Run \`vercel\` in this directory
3. Or drag and drop to [Vercel](https://vercel.com/new)

Your site will be live at a \`.vercel.app\` URL.`,

    "github-pages": `## Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Upload these files to the repository
3. Go to Settings > Pages
4. Select "Deploy from a branch" and choose "main"

Your site will be live at \`https://username.github.io/repository-name\`.`,
  }

  return `# ${title}

This website was generated using Poster2Web.

## Files

- \`index.html\` - Main website file
- \`README.md\` - This file
${platform === "netlify" ? "- `_redirects` - Netlify redirect rules\n- `netlify.toml` - Netlify configuration" : ""}
${platform === "vercel" ? "- `vercel.json` - Vercel configuration" : ""}
${platform === "github-pages" ? "- `.nojekyll` - Disable Jekyll processing" : ""}

${instructions[platform] || "## Deployment\n\nUpload the `index.html` file to any web hosting service."}

## Customization

You can edit the \`index.html\` file directly or re-import your content into Poster2Web for further modifications.

## Support

For questions about Poster2Web, visit our documentation or contact support.`
}

/**
 * Create and download deployment package as ZIP
 */
async function downloadDeploymentPackage(project, settings, platform) {
  const files = generateDeploymentPackage(project, settings, platform)
  const zip = new JSZip()

  // Add files to ZIP
  Object.entries(files).forEach(([filename, content]) => {
    zip.file(filename, content)
  })

  // Generate ZIP file
  const blob = await zip.generateAsync({ type: "blob" })

  // Download
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${sanitizeFilename(project.title || "website")}-${platform}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)

  return { success: true, filename: a.download }
}

// ===================================================
// HELPER FUNCTIONS
// ===================================================

/**
 * Sanitize HTML content for safe embedding
 */
function sanitizeHtmlContent(html) {
  if (!html) return ""
  let safe = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  safe = safe.replace(/ on\w+="[^"]*"/gi, "")
  safe = safe.replace(/ on\w+='[^']*'/gi, "")
  return safe
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

/**
 * Compute contrasting text color
 */
function computeContrastColor(hex) {
  let clean = hex.replace("#", "")
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((ch) => ch + ch)
      .join("")
  }
  const r = Number.parseInt(clean.substring(0, 2), 16) / 255
  const g = Number.parseInt(clean.substring(2, 4), 16) / 255
  const b = Number.parseInt(clean.substring(4, 6), 16) / 255
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  return L > 0.5 ? "#111111" : "#ffffff"
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase()
}

/**
 * Generate custom buttons (reused from export.js)
 */
function generateCustomButtons(settings, layoutStyle) {
  const result = []
  const btns = Array.isArray(settings.buttons) ? settings.buttons : []
  btns.forEach((btn) => {
    const label = btn.label || (btn.type === "file" ? "Download" : btn.type === "email" ? "Email us" : "Visit site")
    if (btn.type === "file" && btn.file && btn.file.dataUrl) {
      result.push(
        `<a href="${btn.file.dataUrl}" download="${btn.file.name}" class="pdf-download">📄 ${escapeHtml(label)}</a>`,
      )
    } else if (btn.type === "email" && btn.email) {
      result.push(`<a href="mailto:${btn.email}" class="pdf-download">📧 ${escapeHtml(label)}</a>`)
    } else if (btn.type === "link" && btn.href) {
      const href = btn.href.startsWith("http") ? btn.href : `https://${btn.href}`
      result.push(`<a href="${href}" target="_blank" rel="noopener" class="pdf-download">🔗 ${escapeHtml(label)}</a>`)
    }
  })
  return result
}

// ===================================================
// EXPORTS
// ===================================================

// Make functions available globally
window.LWB_AdvancedExport = {
  // PDF Export
  generatePDFExport,
  generatePDFOptimizedHTML,

  // Markdown Export
  generateMarkdownExport,
  convertHTMLToMarkdown,
  extractTextFromHTML,

  // Vue.js Export
  generateVueExport,

  // Deployment
  generateDeploymentPackage,
  downloadDeploymentPackage,

  // Utilities
  sanitizeHtmlContent,
  escapeHtml,
  computeContrastColor,
  sanitizeFilename,
}

console.log("[v0] Advanced export formats loaded")
