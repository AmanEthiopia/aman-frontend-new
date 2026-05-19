import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/lib/contexts/app-context"
import { AuthProvider } from "@/contexts/auth-context"
import { TestBanner } from "@/components/ui/test-banner"

const inter = Inter({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AMAN | Trust-First Ethiopian Travel & Hospitality Platform",
  description:
    "Discover verified hotels, restaurants, transport, and experiences across Ethiopia. AMAN provides trusted stays and local intelligence for travelers.",
  keywords: [
    "Ethiopia hotels",
    "Ethiopia travel",
    "Addis Ababa hotels",
    "Ethiopian restaurants",
    "Ethiopia tours",
    "verified hotels Ethiopia",
    "safe travel Ethiopia",
    "Ethiopian experiences",
  ],
  authors: [{ name: "AMAN" }],
  openGraph: {
    title: "AMAN | Trust-First Ethiopian Travel & Hospitality Platform",
    description: "Discover verified hotels, restaurants, transport, and experiences across Ethiopia.",
    type: "website",
    locale: "en_US",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f5132" },
    { media: "(prefers-color-scheme: dark)", color: "#198754" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProvider>
          <AuthProvider>
            <TestBanner />
            {children}
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  )
}
