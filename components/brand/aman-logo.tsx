"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * AMAN Brand System
 * ------------------
 * Centralized logo lockups so every surface (landing, traveler portal,
 * provider portal, AI assistant, footer, favicon) stays visually in sync.
 *
 * Assets live in /public/brand and are referenced by local paths so the
 * runtime never depends on remote blob URLs.
 */

const ASSETS = {
  en: "/brand/aman-logo-en.jpeg",
  am: "/brand/aman-logo-am.jpeg",
  square: "/brand/aman-logo-square.jpeg",
  patternVertical: "/brand/aman-pattern-vertical.jpeg",
  patternHorizontal: "/brand/aman-pattern-horizontal.jpeg",
} as const

type LockupSize = "sm" | "md" | "lg"

const LOCKUP_HEIGHTS: Record<LockupSize, string> = {
  sm: "h-5",
  md: "h-7",
  lg: "h-9",
}

/**
 * Bilingual lockup: English "AMAN" wordmark + Amharic "አማን" wordmark
 * vertically centered. Used in the global navigation bar.
 */
export function AmanLockup({
  size = "md",
  showAmharic = true,
  className,
}: {
  size?: LockupSize
  showAmharic?: boolean
  className?: string
}) {
  const h = LOCKUP_HEIGHTS[size]
  return (
    <span
      className={cn("inline-flex items-center gap-2 leading-none", className)}
      aria-label="AMAN — Trust-First Ethiopian Travel"
    >
      <Image
        src={ASSETS.en}
        alt="AMAN"
        width={400}
        height={120}
        priority
        className={cn(h, "w-auto select-none object-contain dark:invert")}
      />
      {showAmharic && (
        <>
          <span className={cn(h, "w-px self-center bg-border/70")} aria-hidden="true" />
          <Image
            src={ASSETS.am}
            alt="አማን"
            width={400}
            height={400}
            className={cn(h, "w-auto select-none object-contain dark:invert")}
          />
        </>
      )}
    </span>
  )
}

/**
 * Square 1:1 mark — used for favicons, mobile shortcut icons, and the
 * collapsed sidebar state in the traveler/provider portals.
 */
export function AmanMark({
  size = 32,
  variant = "stacked",
  className,
}: {
  size?: number
  variant?: "stacked" | "pattern"
  className?: string
}) {
  const src = variant === "stacked" ? ASSETS.square : ASSETS.patternVertical
  return (
    <Image
      src={src}
      alt="AMAN"
      width={size}
      height={size}
      className={cn("select-none object-contain dark:invert", className)}
      style={{ width: size, height: size }}
    />
  )
}

/**
 * Wordmark only (English geometric "AMAN"). Used in the footer above
 * Safety & Support, and any place where the lockup is too tall.
 */
export function AmanWordmark({
  className,
  height = 36,
}: {
  className?: string
  height?: number
}) {
  return (
    <Image
      src={ASSETS.en}
      alt="AMAN"
      width={height * 4}
      height={height}
      className={cn("w-auto select-none object-contain dark:invert", className)}
      style={{ height }}
    />
  )
}

/**
 * Continuous zigzag SVG path that mirrors the horizontal AMAN pattern
 * mark. Used as the AI Assistant avatar and as a "drawing" loading
 * indicator for AI-Powered Planning.
 *
 * The path is hand-tuned to match the geometric AMAN wave: four peaks
 * with a small loop on the trailing edge.
 */
const ZIGZAG_PATH =
  "M2 36 L12 8 L22 36 L26 8 L36 36 L46 8 L56 36 L66 8 L76 36 L86 8 L94 30 A6 6 0 0 1 88 36 L86 36"

export function AmanZigzag({
  size = 24,
  className,
  strokeWidth = 5,
  title,
}: {
  size?: number
  className?: string
  strokeWidth?: number
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 96 44"
      width={size * (96 / 44)}
      height={size}
      role="img"
      aria-label={title ?? "AMAN AI"}
      className={className}
    >
      <path
        d={ZIGZAG_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Animated zigzag — draws itself across, then pulses. Use this whenever
 * an AI request is in flight (e.g. AI Planner, AI Assistant streaming).
 */
export function AmanZigzagLoader({
  size = 32,
  className,
  label = "AMAN AI is thinking",
}: {
  size?: number
  className?: string
  label?: string
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex items-center gap-2 text-primary", className)}
    >
      <svg
        viewBox="0 0 96 44"
        width={size * (96 / 44)}
        height={size}
        className="aman-zigzag-draw"
        aria-hidden="true"
      >
        <path
          d={ZIGZAG_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}
