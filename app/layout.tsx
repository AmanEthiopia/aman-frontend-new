import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { GoogleAnalytics } from "@next/third-parties/google"
import "./globals.css"
import { AppProvider } from "@/lib/contexts/app-context"
import { AuthProvider } from "@/contexts/auth-context"
import { TestBanner } from "@/components/ui/test-banner"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

// GA4 Measurement ID. Defaults to the Algalle property; override with
// NEXT_PUBLIC_GA_MEASUREMENT_ID per environment. Measurement IDs are public.
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-ET6HXMVMQ8"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.algalle.com"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: "Algalle | Trust-First Ethiopian Travel & Local Intelligence",
  description:
    "Discover verified hotels, restaurants, transport, and experiences across Ethiopia. Algalle — a Yichalal Family Initiative — provides trusted stays and local intelligence for travelers.",
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
  authors: [{ name: "Algalle" }],
  openGraph: {
    title: "Algalle | Trust-First Ethiopian Travel & Local Intelligence",
    description: "Discover verified hotels, restaurants, transport, and experiences across Ethiopia.",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: [{ url: "/brand/icon.svg", type: "image/svg+xml" }],
    shortcut: "/brand/icon.svg",
    apple: "/brand/icon.svg",
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
        {/* Hidden Google Translate widget — reads googtrans cookie on load */}
        <div id="google_translate_element" style={{ display: "none" }} />
        <Script id="google-translate-init" strategy="afterInteractive">{`
          window.googleTranslateElementInit = function() {
            new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'am,en',
              autoDisplay: false
            }, 'google_translate_element');
          };
        `}</Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>
            <AuthProvider>
              <TestBanner />
              {children}
            </AuthProvider>
          </AppProvider>
          <Toaster />
        </ThemeProvider>
      </body>
      {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
    </html>
  )
}
