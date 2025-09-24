import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: "Poster2Web - Convert Posters to Websites",
  description: "Transform your poster designs into beautiful, responsive websites with AI-powered conversion.",
  keywords: "poster to website, design conversion, AI website builder, responsive design",
  authors: [{ name: "Poster2Web" }],
  creator: "Poster2Web",
  publisher: "Poster2Web",
  robots: "index, follow",
  openGraph: {
    title: "Poster2Web - Convert Posters to Websites",
    description: "Transform your poster designs into beautiful, responsive websites with AI-powered conversion.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poster2Web - Convert Posters to Websites",
    description: "Transform your poster designs into beautiful, responsive websites with AI-powered conversion.",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
