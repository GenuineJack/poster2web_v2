import type { Section } from "@/hooks/use-app-state"

export interface SectionTemplate {
  id: string
  name: string
  icon: string
  description: string
  category: "content" | "media" | "interactive" | "layout"
  template: Omit<Section, "id">
}

export const sectionTemplates: SectionTemplate[] = [
  // Content Templates
  {
    id: "text-paragraph",
    name: "Text Paragraph",
    icon: "📝",
    description: "Simple text content with paragraph formatting",
    category: "content",
    template: {
      icon: "📝",
      name: "Text Section",
      content: [
        {
          type: "text",
          value:
            "<p>Add your text content here. You can format it with <strong>bold</strong>, <em>italic</em>, and other HTML tags.</p>",
          allowHtml: false,
        },
      ],
    },
  },
  {
    id: "heading-text",
    name: "Heading + Text",
    icon: "📄",
    description: "Section with a heading followed by text content",
    category: "content",
    template: {
      icon: "📄",
      name: "Content Section",
      content: [
        {
          type: "text",
          value:
            "<h2>Section Heading</h2><p>Add your content here. This template includes a heading followed by paragraph text.</p>",
          allowHtml: false,
        },
      ],
    },
  },
  {
    id: "bullet-list",
    name: "Bullet List",
    icon: "📋",
    description: "Bulleted list for key points or features",
    category: "content",
    template: {
      icon: "📋",
      name: "Key Points",
      content: [
        {
          type: "text",
          value:
            "<h3>Key Points</h3><ul><li>First important point</li><li>Second key feature</li><li>Third benefit or detail</li></ul>",
          allowHtml: false,
        },
      ],
    },
  },
  {
    id: "numbered-list",
    name: "Numbered List",
    icon: "🔢",
    description: "Numbered list for steps or ordered information",
    category: "content",
    template: {
      icon: "🔢",
      name: "Steps",
      content: [
        {
          type: "text",
          value:
            "<h3>Steps</h3><ol><li>First step in the process</li><li>Second step to follow</li><li>Final step to complete</li></ol>",
          allowHtml: false,
        },
      ],
    },
  },

  // Media Templates
  {
    id: "image-caption",
    name: "Image with Caption",
    icon: "🖼️",
    description: "Image with descriptive caption below",
    category: "media",
    template: {
      icon: "🖼️",
      name: "Image",
      content: [
        {
          type: "image",
          url: "/placeholder.svg?height=300&width=500&query=sample image",
          caption: "Add a descriptive caption for your image here",
        },
      ],
    },
  },
  {
    id: "image-text",
    name: "Image + Text",
    icon: "🖼️",
    description: "Image with accompanying text content",
    category: "media",
    template: {
      icon: "🖼️",
      name: "Image & Text",
      content: [
        {
          type: "image",
          url: "/placeholder.svg?height=250&width=400&query=content image",
          caption: "Image caption",
        },
        {
          type: "text",
          value:
            "<p>Add text content that relates to or describes the image above. This can be explanatory text, context, or additional information.</p>",
          allowHtml: false,
        },
      ],
    },
  },

  // Interactive Templates
  {
    id: "contact-info",
    name: "Contact Information",
    icon: "📧",
    description: "Contact details with email, phone, and address",
    category: "interactive",
    template: {
      icon: "📧",
      name: "Contact",
      content: [
        {
          type: "text",
          value:
            "<h3>Contact Information</h3><p><strong>Email:</strong> contact@example.com</p><p><strong>Phone:</strong> (555) 123-4567</p><p><strong>Address:</strong> 123 Main Street, City, State 12345</p>",
          allowHtml: false,
        },
      ],
    },
  },
  {
    id: "call-to-action",
    name: "Call to Action",
    icon: "🎯",
    description: "Prominent call-to-action section",
    category: "interactive",
    template: {
      icon: "🎯",
      name: "Call to Action",
      content: [
        {
          type: "text",
          value:
            '<div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px;"><h3>Ready to Get Started?</h3><p>Take the next step and join thousands of satisfied customers.</p><a href="#" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Started Now</a></div>',
          allowHtml: true,
        },
      ],
    },
  },

  // Layout Templates
  {
    id: "two-column",
    name: "Two Column Layout",
    icon: "📊",
    description: "Side-by-side content layout",
    category: "layout",
    template: {
      icon: "📊",
      name: "Two Columns",
      content: [
        {
          type: "html",
          value:
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1rem 0;"><div><h4>Left Column</h4><p>Content for the left side goes here. This could be text, images, or other elements.</p></div><div><h4>Right Column</h4><p>Content for the right side goes here. This layout works well for comparisons or related information.</p></div></div>',
          allowRawHtml: true,
        },
      ],
    },
  },
  {
    id: "quote-testimonial",
    name: "Quote/Testimonial",
    icon: "💬",
    description: "Styled quote or testimonial section",
    category: "content",
    template: {
      icon: "💬",
      name: "Testimonial",
      content: [
        {
          type: "text",
          value:
            '<blockquote style="border-left: 4px solid #007bff; padding-left: 1rem; margin: 1rem 0; font-style: italic;"><p>"This is an example testimonial or quote. It can be used to highlight customer feedback, important quotes, or key messages."</p><footer style="margin-top: 0.5rem; font-size: 0.9em; color: #666;">— Customer Name, Company</footer></blockquote>',
          allowHtml: true,
        },
      ],
    },
  },
]

export function getSectionTemplatesByCategory(category: SectionTemplate["category"]): SectionTemplate[] {
  return sectionTemplates.filter((template) => template.category === category)
}

export function createSectionFromTemplate(templateId: string, customName?: string): Section | null {
  const template = sectionTemplates.find((t) => t.id === templateId)
  if (!template) return null

  return {
    id: `section-${Date.now()}`,
    ...template.template,
    name: customName || template.template.name,
  }
}
