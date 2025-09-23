import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Poster2Web - Convert Documents to Websites",
  description:
    "Transform your PDFs, PowerPoints, and documents into beautiful, responsive websites with our AI-powered conversion tool.",
  keywords: [
    "document conversion",
    "PDF to website",
    "PowerPoint to web",
    "website generator",
    "no-code",
    "responsive design",
  ],
  authors: [{ name: "Poster2Web Team" }],
  creator: "Poster2Web",
  publisher: "Poster2Web",
  robots: "index, follow",
  openGraph: {
    title: "Poster2Web - Convert Documents to Websites",
    description:
      "Transform your PDFs, PowerPoints, and documents into beautiful, responsive websites with our AI-powered conversion tool.",
    type: "website",
    url: "https://poster2web.com",
    siteName: "Poster2Web",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Poster2Web - Document to Website Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Poster2Web - Convert Documents to Websites",
    description:
      "Transform your PDFs, PowerPoints, and documents into beautiful, responsive websites with our AI-powered conversion tool.",
    images: ["/og-image.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <TooltipProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}
