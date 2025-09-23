/**
 * SITEWEAVE - EXPORT
 * Website generation and export functionality for HTML, React, and Next.js
 */

// ===================================================
// EXPORT ORCHESTRATOR
// ===================================================

/**
 * Main export function that handles different formats
 */
function exportWebsite(project, settings, format = "html") {
  try {
    let content = ""
    let filename = ""
    let mimeType = "text/plain"

    switch (format) {
      case "html":
        content = generateHTMLExport(project, settings)
        filename = `${sanitizeFilename(project.title || "website")}.html`
        mimeType = "text/html"
        break
      case "react":
        content = generateReactExport(project, settings)
        filename = "WebsiteComponent.jsx"
        mimeType = "text/javascript"
        break
      case "nextjs":
        content = generateNextJSExport(project, settings)
        filename = "page.js"
        mimeType = "text/javascript"
        break
      case "vue":
        content = window.LWB_AdvancedExport.generateVueExport(project, settings)
        filename = "WebsiteComponent.vue"
        mimeType = "text/javascript"
        break
      case "markdown":
        content = window.LWB_AdvancedExport.generateMarkdownExport(project, settings)
        filename = `${sanitizeFilename(project.title || "document")}.md`
        mimeType = "text/markdown"
        break
      case "pdf":
        return window.LWB_AdvancedExport.generatePDFExport(project, settings)
      case "netlify":
        return window.LWB_AdvancedExport.downloadDeploymentPackage(project, settings, "netlify")
      case "vercel":
        return window.LWB_AdvancedExport.downloadDeploymentPackage(project, settings, "vercel")
      case "github-pages":
        return window.LWB_AdvancedExport.downloadDeploymentPackage(project, settings, "github-pages")
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }

    // Download the file
    downloadFile(content, filename, mimeType)

    return { success: true, filename }
  } catch (error) {
    console.error("Export error:", error)
    return { success: false, error: error.message }
  }
}

// ===================================================
// HTML EXPORT
// ===================================================

/**
 * Generate standalone HTML export
 */
function generateHTMLExport(project, settings) {
  const {
    primaryColor = "#16a34a",
    secondaryColor = "#15803d",
    layoutStyle = "single",
    titleSize = "32",
    contentSize = "16",
    fontStyle = "system",
    headerAlignment = "center",
    logoSize = "120",
    enableDarkModeToggle = false,
    analyticsCode = "",
  } = settings

  const fontFamily = getFontFamily(fontStyle)
  const navHtml = generateNavigationHtml(project, settings)
  const sectionsHtml = generateSectionsHtml(project, settings)
  const darkModeCSS = enableDarkModeToggle ? generateDarkModeCSS(settings) : ""
  const darkModeToggle = enableDarkModeToggle ? generateDarkModeToggle(settings) : ""
  const darkModeJS = enableDarkModeToggle ? generateDarkModeJS(settings) : ""
  // Always include print CSS since users can no longer disable it via settings
  const printCSS = generatePrintCSS()

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(project.title || "Website")}</title>
    ${generateSEOTags(project, settings)}
    <style>
        ${generateHTMLStyles(settings)}
        ${darkModeCSS}
        ${printCSS}
    </style>
    ${
      analyticsCode
        ? `<!-- Analytics Code -->
    ${analyticsCode}`
        : ""
    }
</head>
<body>
    ${darkModeToggle}
    ${navHtml}
    
    <div class="container">
        ${sectionsHtml}
    </div>
    
    ${generateFooter(settings)}
    
    ${generateJavaScript(layoutStyle)}
    ${darkModeJS}
</body>
</html>`
}

/**
 * Generate CSS styles for HTML export
 */
function generateHTMLStyles(settings) {
  const {
    primaryColor = "#16a34a",
    secondaryColor = "#15803d",
    layoutStyle = "single",
    titleSize = "32",
    contentSize = "16",
    fontStyle = "system",
    headerAlignment = "center",
    logoSize = "120",
  } = settings

  const fontFamily = getFontFamily(fontStyle)

  return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${fontFamily};
            margin: 0;
            padding: 0;
            background: #f8fafc;
            color: #1a1a1a;
            font-size: ${contentSize}px;
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        /* Determine readable text color based on primary color */
        ${(() => {
          // Inline JS executed when generating styles; compute contrast color
          function getContrastColor(hex) {
            let clean = hex.replace("#", "")
            if (clean.length === 3)
              clean = clean
                .split("")
                .map((ch) => ch + ch)
                .join("")
            const r = Number.parseInt(clean.substring(0, 2), 16) / 255
            const g = Number.parseInt(clean.substring(2, 4), 16) / 255
            const b = Number.parseInt(clean.substring(4, 6), 16) / 255
            const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
            const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
            return L > 0.5 ? "#111111" : "#ffffff"
          }
          const textColor = getContrastColor(primaryColor)
          return `.header {\n            background: ${primaryColor};\n            color: ${textColor};\n            padding: 60px 40px;\n            border-radius: 16px;\n            margin-bottom: 30px;\n            text-align: ${headerAlignment};\n            position: relative;\n            box-shadow: 0 4px 20px rgba(0,0,0,0.1);\n        }`
        })()}
        
        .logo {
            max-width: ${logoSize}px;
            max-height: ${logoSize}px;
            margin-bottom: 20px;
            background: white;
            padding: 12px;
            border-radius: 12px;
            display: inline-block;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 { 
            margin: 0 0 10px 0; 
            font-size: ${titleSize}px;
            font-weight: 700;
        }
        
        h2 {
            color: ${primaryColor};
            margin: 0 0 20px 0;
            font-size: ${Math.round(titleSize * 0.75)}px;
            font-weight: 600;
        }
        
        h3 {
            margin: 20px 0 12px 0;
            font-size: ${Math.round(titleSize * 0.6)}px;
            color: #374151;
        }
        
        .section {
            background: white;
            padding: 40px;
            margin-bottom: 24px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            scroll-margin-top: ${layoutStyle === "sections" ? "80px" : "20px"};
        }
        
        .content-block {
            margin-bottom: 24px;
        }
        
        .content-block p {
            margin-bottom: 16px;
        }
        
        .content-block ul,
        .content-block ol {
            margin-left: 24px;
            margin-bottom: 16px;
        }
        
        .content-block li {
            margin-bottom: 8px;
        }
        
        .content-block blockquote {
            border-left: 4px solid ${primaryColor};
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: #4b5563;
        }
        
        .content-block a {
            color: ${primaryColor};
            text-decoration: underline;
            transition: color 0.2s ease;
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .image-caption {
            margin-top: 12px;
            font-style: italic;
            color: #6b7280;
            font-size: ${Math.round(contentSize * 0.9)}px;
        }
        
        ${generateNavigationStyles(settings)}
        ${generateButtonStyles(settings)}
        ${generateResponsiveStyles()}
    `
}

/**
 * Generate navigation styles
 */
function generateNavigationStyles(settings) {
  const { layoutStyle, primaryColor, secondaryColor } = settings

  if (layoutStyle === "sections") {
    return `
        nav {
            position: sticky;
            top: 0;
            background: white;
            border-bottom: 1px solid #e5e7eb;
            padding: 16px;
            z-index: 100;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        nav .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            gap: 20px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        nav a {
            color: ${primaryColor};
            text-decoration: none;
            font-weight: 500;
            padding: 8px 12px;
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        
        nav a:hover {
            background: #f0fdf4;
        }`
  } else if (layoutStyle === "menu") {
    return `
        #hamburgerMenu {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
        
        #hamburgerMenu button {
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
        
        #menuDropdown {
            display: none;
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
        
        #menuDropdown.show {
            display: block;
        }
        
        #menuDropdown a {
            display: block;
            padding: 8px 12px;
            color: ${primaryColor};
            text-decoration: none;
            font-weight: 500;
            border-radius: 8px;
            transition: background 0.2s;
        }
        
        #menuDropdown a:hover {
            background: #f0fdf4;
        }
        
        #menuDropdown hr {
            margin: 12px 0;
            border: none;
            border-top: 1px solid #e5e7eb;
        }
        
        /* Custom button styles in hamburger menu */
        #menuDropdown .pdf-download {
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white !important;
            display: block;
            text-align: center;
            padding: 12px 16px;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            margin-top: 8px;
            width: 100%;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        #menuDropdown .pdf-download:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }`
  }

  return ""
}

/**
 * Generate button styles
 */
function generateButtonStyles(settings) {
  const { primaryColor, secondaryColor } = settings

  return `
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        
        .pdf-download {
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white;
            padding: 16px 32px;
            border-radius: 50px;
            font-weight: 600;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            border: none;
            cursor: pointer;
            font-size: 16px;
            display: inline-block;
            margin: 10px;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        
        .pdf-download:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            color: white;
        }
        
        .pdf-download-container {
            text-align: center;
            padding: 20px;
            background: white;
            margin-top: 40px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .footer {
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 40px 20px;
            margin-top: 60px;
            text-align: center;
            color: #6b7280;
        }
    `
}

/**
 * Generate responsive styles
 */
function generateResponsiveStyles() {
  return `
        @media (max-width: 768px) {
            .container {
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
            
            h1 {
                font-size: 28px;
            }
            
            h2 {
                font-size: 24px;
            }
            
            nav .nav-container {
                flex-direction: column;
                align-items: stretch;
            }
            
            nav a {
                display: block;
                text-align: center;
            }
            
            .pdf-download {
                display: block;
                width: 100%;
                margin: 8px 0;
            }
        }
    `
}

/**
 * Generate custom buttons based on settings
 */
function generateCustomButtons(settings, layoutStyle) {
  const result = []
  const btns = Array.isArray(settings.buttons) ? settings.buttons : []
  btns.forEach((btn) => {
    const label = btn.label || (btn.type === "file" ? "Download" : btn.type === "email" ? "Email us" : "Visit site")
    if (btn.type === "file" && btn.file && btn.file.dataUrl) {
      result.push(`
            <a href="${btn.file.dataUrl}" 
               download="${btn.file.name}"
               class="pdf-download">
                📄 ${escapeHtml(label)}
            </a>`)
    } else if (btn.type === "email" && btn.email) {
      // Use mailto
      result.push(`
            <a href="mailto:${btn.email}" class="pdf-download">
                📧 ${escapeHtml(label)}
            </a>`)
    } else if (btn.type === "link" && btn.href) {
      // Normalize href: prefix http if missing
      const href = btn.href.startsWith("http") ? btn.href : `https://${btn.href}`
      result.push(`
            <a href="${href}" target="_blank" rel="noopener" class="pdf-download">
                🔗 ${escapeHtml(label)}
            </a>`)
    }
  })
  return result
}

/**
 * Generate navigation HTML
 */
function generateNavigationHtml(project, settings) {
  const { layoutStyle } = settings
  const buttons = generateCustomButtons(settings, layoutStyle)
  // Helper to build label with optional icon
  const buildLabel = (section) => {
    const prefix = section.showIcon === false ? "" : `${section.icon} `
    return `${prefix}${escapeHtml(section.name)}`
  }
  if (layoutStyle === "sections") {
    const links = project.sections.map((section) => `<a href="#${section.id}">${buildLabel(section)}</a>`).join("")
    return `
    <nav>
        <div class="nav-container">
            ${links}
            <div style="margin-left: auto; display: flex; gap: 12px; align-items: center;">
                ${buttons.join("")}
            </div>
        </div>
    </nav>`
  } else if (layoutStyle === "menu") {
    return `
    <div id="hamburgerMenu">
        <button onclick="toggleMenu()">
            <div class="menu-line"></div>
            <div class="menu-line"></div>
            <div class="menu-line"></div>
        </button>
        <div id="menuDropdown">
            ${project.sections
              .map((section) => `<a href="#${section.id}" onclick="toggleMenu()">${buildLabel(section)}</a>`)
              .join("")}
            <hr>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${buttons.join("")}
            </div>
        </div>
    </div>`
  }
  return ""
}

/**
 * Generate sections HTML
 */
function generateSectionsHtml(project, settings) {
  return project.sections
    .map((section) => {
      if (section.isHeader) {
        // Header does not display the section name or icon; show logo and rich text content
        return `
        <div class="header" id="${section.id}">
            ${project.logoUrl ? `<div><img src="${project.logoUrl}" class="logo" alt="Logo"></div>` : ""}
            ${section.content
              .map((content) => {
                if (content.type === "text") {
                  // Allow raw HTML only if explicitly flagged; otherwise wrap in a div
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
        <div class="section" id="${section.id}">
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

/**
 * Generate footer HTML
 */
function generateFooter(settings) {
  const { layoutStyle } = settings
  const buttons = generateCustomButtons(settings, layoutStyle)
  // Only render a button container for single-page layouts; no attribution text
  if (layoutStyle === "single" && buttons.length > 0) {
    return `
    <div class="pdf-download-container">
        ${buttons.join("")}
    </div>`
  }
  // For other layouts, no footer content is necessary
  return ""
}

// ===================================================
// REACT EXPORT
// ===================================================

/**
 * Generate React component export
 */
function generateReactExport(project, settings) {
  const {
    primaryColor = "#16a34a",
    secondaryColor = "#15803d",
    headerAlignment = "center",
    logoSize = "120",
    layoutStyle = "single",
    titleSize = "32",
    contentSize = "16",
  } = settings
  // Determine a readable text colour for the header based on the primary colour
  const headerTextColor = computeContrastColor(primaryColor)

  const buttons = generateCustomButtons(settings, layoutStyle)
  const buttonsJSX = buttons
    .map((btn) => {
      // Parse button HTML to extract props
      const isDownload = btn.includes("download=")
      const href = btn.match(/href="([^"]+)"/)?.[1] || "#"
      const text = btn.match(/>([^<]+)</)?.[1] || "Button"

      if (isDownload) {
        return `<a href="${href}" download className="pdf-download">${text}</a>`
      } else {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" className="pdf-download">${text}</a>`
      }
    })
    .join("\n            ")

  return `// React Component - Copy this code into your React project
// Note: You'll need to install styled-components: npm install styled-components

const React = window.React || require('react');
const styled = window.styled || require('styled-components');
const { useState } = React;

// Styled Components
const Container = styled.div\`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
\`;

const Header = styled.header\`
  background: ${primaryColor};
  color: ${headerTextColor};
  padding: 60px 40px;
  border-radius: 16px;
  margin-bottom: 30px;
  text-align: ${headerAlignment};
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
\`;

const Logo = styled.img\`
  max-width: ${logoSize}px;
  max-height: ${logoSize}px;
  margin-bottom: 20px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  display: inline-block;
\`;

const Title = styled.h1\`
  margin: 0 0 10px 0;
  font-size: ${titleSize}px;
  font-weight: 700;
\`;

const Section = styled.section\`
  background: white;
  padding: 40px;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  h2 {
    color: ${primaryColor};
    margin: 0 0 20px 0;
    font-size: ${Math.round(titleSize * 0.75)}px;
  }
  
  p {
    margin-bottom: 16px;
    font-size: ${contentSize}px;
    line-height: 1.6;
  }
  
  a {
    color: ${primaryColor};
    text-decoration: underline;
    
    &:hover {
      color: ${secondaryColor};
    }
  }
\`;

const ImageBlock = styled.div\`
  text-align: center;
  margin: 32px 0;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
\`;

const ImageCaption = styled.div\`
  margin-top: 12px;
  font-style: italic;
  color: #6b7280;
  font-size: ${Math.round(contentSize * 0.9)}px;
\`;

const ButtonContainer = styled.div\`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 40px 0;
  flex-wrap: wrap;
  
  .pdf-download {
    background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
    color: white;
    padding: 16px 32px;
    border-radius: 50px;
    font-weight: 600;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
  }
\`;

${
  layoutStyle === "menu"
    ? `
const HamburgerMenu = styled.div\`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
\`;

const MenuButton = styled.button\`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
\`;

const MenuDropdown = styled.div\`
  display: \${props => props.open ? 'block' : 'none'};
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
  
  a {
    display: block;
    padding: 8px 12px;
    color: ${primaryColor};
    text-decoration: none;
    font-weight: 500;
    border-radius: 8px;
    transition: background 0.2s;
    
    &:hover {
      background: #f0fdf4;
    }
  }
\`;`
    : ""
}

// Main Component
const WebsiteComponent = () => {
  ${layoutStyle === "menu" ? "const [menuOpen, setMenuOpen] = useState(false);" : ""}
  
  const sections = ${JSON.stringify(project.sections, null, 2)};
  const logoUrl = ${project.logoUrl ? `"${project.logoUrl}"` : "null"};
  
  return (
    <Container>
      ${
        layoutStyle === "menu"
          ? `
      <HamburgerMenu>
        <MenuButton onClick={() => setMenuOpen(!menuOpen)}>
          <div style={{ width: '24px', height: '2px', background: '${primaryColor}', margin: '4px 0' }} />
          <div style={{ width: '24px', height: '2px', background: '${primaryColor}', margin: '4px 0' }} />
          <div style={{ width: '24px', height: '2px', background: '${primaryColor}', margin: '4px 0' }} />
        </MenuButton>
        <MenuDropdown open={menuOpen}>
          {sections.map((section) => (
            <a key={section.id} href={\`#\${section.id}\`} onClick={() => setMenuOpen(false)}>
              {section.showIcon === false ? '' : section.icon} {section.name}
            </a>
          ))}
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
          ${buttonsJSX}
        </MenuDropdown>
      </HamburgerMenu>`
          : ""
      }
      
      {sections.map((section) => {
        if (section.isHeader) {
          return (
            <Header key={section.id} id={section.id}>
              {logoUrl && <div><Logo src={logoUrl} alt="Logo" /></div>}
              {section.content.map((content, idx) => (
                <div key={idx} dangerouslySetInnerHTML={{ __html: content.value }} />
              ))}
            </Header>
          );
        }
        
        return (
          <Section key={section.id} id={section.id}>
            <h2>{section.showIcon === false ? '' : section.icon} {section.name}</h2>
            {section.content.map((content, idx) => {
              if (content.type === 'text') {
                return <div key={idx} dangerouslySetInnerHTML={{ __html: content.value }} />;
              }
              if (content.type === 'image' && content.url) {
                return (
                  <ImageBlock key={idx}>
                    <img src={content.url || "/placeholder.svg"} alt={section.name} />
                    {content.caption && (
                      <ImageCaption dangerouslySetInnerHTML={{ __html: content.caption }} />
                    )}
                  </ImageBlock>
                );
              }
              return null;
            })}
          </Section>
        );
      })}
      
      ${
        layoutStyle === "single"
          ? `
      <ButtonContainer>
        ${buttonsJSX}
      </ButtonContainer>`
          : ""
      }
    </Container>
  );
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebsiteComponent;
} else if (typeof window !== 'undefined') {
  window.WebsiteComponent = WebsiteComponent;
}

// For React projects, use: export default WebsiteComponent;`
}

// ===================================================
// NEXT.JS EXPORT
// ===================================================

/**
 * Generate Next.js page export
 */
function generateNextJSExport(project, settings) {
  const {
    primaryColor = "#16a34a",
    secondaryColor = "#15803d",
    headerAlignment = "center",
    logoSize = "120",
    layoutStyle = "single",
    titleSize = "32",
    contentSize = "16",
  } = settings

  // Determine a readable text colour for the header based on the primary colour
  const headerTextColor = computeContrastColor(primaryColor)

  const buttons = generateCustomButtons(settings, layoutStyle)

  return `'use client';

// Note: This is a Next.js component. Make sure you have React installed.
const { useState } = require('react');

export default function Page() {
  ${layoutStyle === "menu" ? "const [menuOpen, setMenuOpen] = useState(false);" : ""}
  
  const sections = ${JSON.stringify(project.sections, null, 2)};
  const logoUrl = ${project.logoUrl ? `"${project.logoUrl}"` : "null"};
  
  return (
    <>
      <style jsx global>{\`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0;
          padding: 0;
          background: #f8fafc;
        }
        .pdf-download {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          color: white;
          padding: 16px 32px;
          border-radius: 50px;
          font-weight: 600;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          text-decoration: none;
          display: inline-block;
          margin: 10px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .pdf-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
      \`}</style>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', minHeight: '100vh' }}>
        ${layoutStyle === "menu" ? generateNextJSMenu(settings, buttons) : ""}
        
        {sections.map((section) => {
          if (section.isHeader) {
            return (
              <header
                key={section.id}
                id={section.id}
                style={{
                  background: '${primaryColor}',
                  color: '${headerTextColor}',
                  padding: '60px 40px',
                  borderRadius: '16px',
                  marginBottom: '30px',
                  textAlign: '${headerAlignment}',
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                {logoUrl && (
                  <div>
                    <img
                      src={logoUrl || "/placeholder.svg"}
                      alt="Logo"
                      style={{
                        maxWidth: '${logoSize}px',
                        maxHeight: '${logoSize}px',
                        marginBottom: '20px',
                        background: 'white',
                        padding: '12px',
                        borderRadius: '12px',
                        display: 'inline-block'
                      }}
                    />
                  </div>
                )}
                {section.content.map((content, idx) => (
                  <div key={idx} dangerouslySetInnerHTML={{ __html: content.value }} />
                ))}
              </header>
            );
          }
          
          return (
            <section
              key={section.id}
              id={section.id}
              style={{
                background: 'white',
                padding: '40px',
                marginBottom: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <h2 style={{ color: '${primaryColor}', marginTop: 0, fontSize: '${Math.round(titleSize * 0.75)}px' }}>
                {section.showIcon === false ? '' : section.icon} {section.name}
              </h2>
              {section.content.map((content, idx) => {
                if (content.type === 'text') {
                  return (
                    <div 
                      key={idx} 
                      style={{ fontSize: '${contentSize}px', lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: content.value }} 
                    />
                  );
                }
                if (content.type === 'image' && content.url) {
                  return (
                    <div key={idx} style={{ textAlign: 'center', margin: '32px 0' }}>
                      <img 
                        src={content.url || "/placeholder.svg"} 
                        alt={section.name} 
                        style={{ 
                          maxWidth: '100%', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} 
                      />
                      {content.caption && (
                        <div 
                          style={{ 
                            fontStyle: 'italic', 
                            marginTop: '12px',
                            color: '#6b7280',
                            fontSize: '${Math.round(contentSize * 0.9)}px'
                          }} 
                          dangerouslySetInnerHTML={{ __html: content.caption }} 
                        />
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </section>
          );
        })}
        
        ${
          layoutStyle === "single"
            ? `
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          ${buttons
            .map((btn) => {
              const href = btn.match(/href="([^"]+)"/)?.[1] || "#"
              const text = btn.match(/>([^<]+)</)?.[1] || "Button"
              const isDownload = btn.includes("download=")
              const filename = btn.match(/download="([^"]+)"/)?.[1] || ""

              if (isDownload) {
                return `<a href="${href}" download="${filename}" className="pdf-download">${text}</a>`
              } else {
                return `<a href="${href}" target="_blank" rel="noopener noreferrer" className="pdf-download">${text}</a>`
              }
            })
            .join("\n          ")}</div>`
            : ""
        }
      </div>
    </>
  );
}`
}

/**
 * Generate Next.js menu code
 */
function generateNextJSMenu(settings, buttons) {
  const { primaryColor } = settings

  return `
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ width: '24px', height: '2px', background: '${primaryColor}', margin: '4px 0' }} />
            <div style={{ width: '24px', height: '2px', background: '${primaryColor}', margin: '4px 0' }} />
            <div style={{ width: '24px', height: '2px', background: '${primaryColor}', margin: '4px 0' }} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              marginTop: '8px',
              padding: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              minWidth: '200px'
            }}>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={\`#\${section.id}\`}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    color: '${primaryColor}',
                    textDecoration: 'none',
                    fontWeight: 500,
                    borderRadius: '8px'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#f0fdf4'}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                  {section.showIcon === false ? '' : section.icon} {section.name}
                </a>
              ))}
              <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                ${buttons
                  .map((btn) => {
                    const href = btn.match(/href="([^"]+)"/)?.[1] || "#"
                    const text = btn.match(/>([^<]+)</)?.[1] || "Button"
                    return `<a href="${href}" className="pdf-download" style={{ textAlign: 'center' }}>${text}</a>`
                  })
                  .join("\n                ")}
              </div>
            </div>
          )}
        </div>`
}

// ===================================================
// HELPER FUNCTIONS
// ===================================================

/**
 * Get font family CSS value
 */
function getFontFamily(fontStyle) {
  switch (fontStyle) {
    case "serif":
      return 'Georgia, "Times New Roman", serif'
    case "mono":
      return '"Courier New", Courier, monospace'
    default:
      return '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
  }
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
 * Sanitize HTML content for safe embedding in exports and previews.
 * This function strips out potentially dangerous tags such as
 * <script> and event handler attributes. It does not escape all
 * markup; instead it removes scripts while preserving markup
 * structure. Use this when injecting user‑provided HTML into the
 * exported site.
 *
 * @param {string} html Raw HTML string
 * @returns {string} Sanitised HTML
 */
function sanitizeHtmlContent(html) {
  if (!html) return ""
  // Remove <script> tags and their content
  let safe = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  // Remove inline event handlers (onmouseover, onclick, etc.)
  safe = safe.replace(/ on\w+="[^"]*"/gi, "")
  safe = safe.replace(/ on\w+='[^']*'/gi, "")
  return safe
}

/**
 * Compute a contrasting text color (black or white) given a background hex color.
 * Uses relative luminance to determine readability.
 * @param {string} hex Hex color string (e.g., '#16a34a')
 * @returns {string} '#ffffff' or '#111111'
 */
function computeContrastColor(hex) {
  let clean = hex.replace("#", "")
  // Expand shorthand form (e.g. #abc) to full form (#aabbcc)
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
 * Generate SEO tags
 */
function generateSEOTags(project, settings) {
  const title = escapeHtml(project.title || "Website")
  // Use a generic description without referencing SiteWeave
  const description = "Professional website"

  return `
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">`
}

/**
 * Generate print CSS
 */
function generatePrintCSS() {
  return `
    @media print {
        nav, #hamburgerMenu, .pdf-download-container, .footer, button {
            display: none !important;
        }
        
        body {
            background: white;
        }
        
        .container {
            max-width: 100%;
        }
        
        .section {
            page-break-inside: avoid;
            box-shadow: none;
            border: 1px solid #e5e7eb;
        }
        
        .header {
            box-shadow: none;
        }
    }`
}

/**
 * Generate dark mode CSS
 */
function generateDarkModeCSS(settings) {
  const { primaryColor, secondaryColor } = settings

  return `
    [data-theme="dark"] {
        background: #1a1a1a;
        color: #ffffff;
    }
    
    [data-theme="dark"] .container {
        background: #1a1a1a;
    }
    
    [data-theme="dark"] .section {
        background: #2d2d2d;
        color: #ffffff;
    }
    
    [data-theme="dark"] .section h2,
    [data-theme="dark"] .section h3 {
        color: ${primaryColor};
    }
    
    [data-theme="dark"] nav {
        background: #2d2d2d;
        border-bottom-color: #404040;
    }
    
    [data-theme="dark"] #menuDropdown {
        background: #2d2d2d;
        border-color: #404040;
    }
    
    .dark-mode-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 25px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
        color: inherit;
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .dark-mode-toggle:hover {
        background: rgba(255, 255, 255, 0.2);
    }`
}

/**
 * Generate dark mode toggle HTML
 */
function generateDarkModeToggle() {
  return `
    <button class="dark-mode-toggle" onclick="toggleDarkMode()" id="darkModeToggle">
        🌙 Dark
    </button>`
}

/**
 * Generate dark mode JavaScript
 */
function generateDarkModeJS() {
  return `
    <script>
        function toggleDarkMode() {
            const html = document.documentElement;
            const toggle = document.getElementById('darkModeToggle');
            const isDark = html.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                html.removeAttribute('data-theme');
                toggle.textContent = '🌙 Dark';
                localStorage.setItem('theme', 'light');
            } else {
                html.setAttribute('data-theme', 'dark');
                toggle.textContent = '☀️ Light';
                localStorage.setItem('theme', 'dark');
            }
        }
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (document.getElementById('darkModeToggle')) {
                document.getElementById('darkModeToggle').textContent = '☀️ Light';
            }
        }
    </script>`
}

/**
 * Generate JavaScript for interactive elements
 */
function generateJavaScript(layoutStyle) {
  let js = ""

  if (layoutStyle === "menu") {
    js += `
    <script>
        function toggleMenu() {
            const dropdown = document.getElementById('menuDropdown');
            dropdown.classList.toggle('show');
        }
        
        document.addEventListener('click', function(event) {
            const menu = document.getElementById('hamburgerMenu');
            if (menu && !menu.contains(event.target)) {
                const dropdown = document.getElementById('menuDropdown');
                if (dropdown) dropdown.classList.remove('show');
            }
        });
    </script>`
  }
  return js
}

/**
 * Download file with given content
 */
function downloadFile(content, filename, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// ===================================================
// EXPORTS
// ===================================================

// Make functions available globally for the modular system
window.LWB_Export = {
  exportWebsite,
  generateHTMLExport,
  generateReactExport,
  generateNextJSExport,
  getFontFamily,
  escapeHtml,
  sanitizeFilename,
}
