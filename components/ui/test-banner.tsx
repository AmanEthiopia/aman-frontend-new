"use client"

import { useState } from "react"
import { X } from "lucide-react"

// Set to false to completely hide the banner
const SHOW_TEST_BANNER = true
const BANNER_MESSAGE = "🚀 Alga Ale is now live for public testing — explore, book, and share your feedback with us!"

export function TestBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (!SHOW_TEST_BANNER || dismissed) return null

  return (
    <div className="relative z-50 flex items-center justify-center gap-3 bg-primary px-4 py-2 text-sm text-primary-foreground">
      <span>{BANNER_MESSAGE}</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="ml-2 rounded p-0.5 hover:bg-primary-foreground/20 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
