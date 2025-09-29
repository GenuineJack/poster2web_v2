"use client"

import type React from "react"

import { useAppState } from "@/hooks/use-app-state"
import { SecurityUtils } from "@/lib/security-utils"
import { cn } from "@/lib/utils"

export function WebsitePreview() {
  const { state } = useAppState()

  const getPreviewStyles = () => {
    return {
      "--primary-color": state.settings.primaryColor,
      "--secondary-color": state.settings.secondaryColor,
      "--title-size": `${state.settings.titleSize}px`,
      "--content-size": `${state.settings.contentSize}px`,
      "--logo-size": `${state.settings.logoSize}px`,
    } as React.CSSProperties
  }

  const getFontClass = () => {
    switch (state.settings.fontStyle) {
      case "serif":
        return "font-serif"
      case "mono":
        return "font-mono"
      default:
        return "font-sans"
    }
  }

  const getAlignmentClass = () => {
    switch (state.settings.headerAlignment) {
      case "left":
        return "text-left"
      case "right":
        return "text-right"
      default:
        return "text-center"
    }
  }

  return (
    <div
      className={cn("h-full overflow-auto bg-background text-foreground", getFontClass())}
      style={getPreviewStyles()}
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Logo */}
        {state.currentProject.logoUrl && (
          <div className={cn("mb-8", getAlignmentClass())}>
            <img
              src={state.currentProject.logoUrl || "/placeholder.svg"}
              alt="Logo"
              className="inline-block"
              style={{ height: `var(--logo-size)` }}
            />
          </div>
        )}

        {/* Sections */}
        {state.currentProject.sections.map((section, index) => (
          <section key={section.id} className={cn("mb-12", section.isHeader && getAlignmentClass())}>
            {/* Section Content */}
            <div className="space-y-6">
              {section.content.map((content, contentIndex) => (
                <div key={contentIndex}>
                   {content.type === "text" && (
                     <div
                       className="prose prose-lg max-w-none"
                       style={{
                         fontSize: section.isHeader ? "var(--title-size)" : "var(--content-size)",
                         color: "var(--primary-color)",
                       }}
                       // Sanitize user-provided HTML to prevent XSS.
                       dangerouslySetInnerHTML={{ __html: SecurityUtils.sanitizeHTML(content.value || "") }}
                     />
                   )}

                  {content.type === "image" && (
                    <figure className="text-center">
                      <img
                        src={content.url || "/placeholder.svg"}
                        alt={content.caption || ""}
                        className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      />
                      {content.caption && (
                        <figcaption className="mt-2 text-sm text-muted-foreground">{content.caption}</figcaption>
                      )}
                    </figure>
                  )}

                   {content.type === "html" && (
                     <div
                       className="prose prose-lg max-w-none"
                       // Sanitize user-provided raw HTML as a safeguard.
                       dangerouslySetInnerHTML={{ __html: SecurityUtils.sanitizeHTML(content.value || "") }}
                     />
                   )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Action Buttons */}
        {state.settings.buttons.length > 0 && (
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-4">
              {state.settings.buttons.map((button) => (
                <a
                  key={button.id}
                  href={button.type === "email" ? `mailto:${button.value}` : button.value}
                  target={button.type === "link" ? "_blank" : undefined}
                  rel={button.type === "link" ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                  }}
                >
                  {button.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {state.currentProject.sections.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No content yet</h3>
            <p className="text-muted-foreground">Add sections to see your website preview here</p>
          </div>
        )}
      </div>
    </div>
  )
}
