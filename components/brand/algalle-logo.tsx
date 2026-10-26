/**
 * Algalle brand logo — the bed mark + wordmark.
 * Single source of truth for traveler + provider.
 *
 * The mark is a 2:1 inline SVG so it can take any of the brand tones:
 *   - "brand"   green on light surfaces, light in dark mode (default)
 *   - "green"   always green (#278733)
 *   - "light"   always light (#F5F5F5) — for dark / green backgrounds
 *   - "mono"    always black — one-colour print / stamps
 *   - "current" inherits text colour (e.g. inside a bg-primary avatar)
 *
 * The standalone <AlgalleMark/> renders just the mark (no text).
 */

/** Brand name as it appears in the UI. */
export const BRAND_WORDMARK = "Algalle"

const MARK_PATH =
  "M0 0H142A152 152 0 0 1 294 152H1098A236 236 0 0 1 1334 388V668H1192V516H142V668H0V374H1191A94 94 0 0 0 1098 294H0Z"

export type AlgalleTone = "brand" | "green" | "light" | "mono" | "current"

const TONE_CLASS: Record<AlgalleTone, string> = {
  brand: "fill-[#278733] dark:fill-[#F5F5F5]",
  green: "fill-[#278733]",
  light: "fill-[#F5F5F5]",
  mono: "fill-black",
  current: "fill-current",
}

interface MarkProps {
  /** Mark width in px; height is half. */
  size?: number
  tone?: AlgalleTone
  /** Accessible label; pass `null` when the mark is decorative. */
  title?: string | null
  className?: string
}

export function AlgalleMark({ size = 36, tone = "brand", title = "Algalle", className = "" }: MarkProps) {
  return (
    <svg
      viewBox="0 0 1334 668"
      width={size}
      height={size / 2}
      // inline style so parent rules like Button's `[&_svg]:size-4` can't squash it
      style={{ width: size, height: size / 2 }}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={`shrink-0 ${TONE_CLASS[tone]} ${className}`}
    >
      <path d={MARK_PATH} />
    </svg>
  )
}

/**
 * Mark that gently "breathes" — use whenever an AI request is in flight
 * (AI Planner, AI Assistant streaming).
 */
export function AlgalleMarkLoader({
  size = 32,
  tone = "brand",
  label = "Algalle AI is thinking",
  className = "",
}: {
  size?: number
  tone?: AlgalleTone
  label?: string
  className?: string
}) {
  return (
    <span role="status" aria-live="polite" className={`inline-flex items-center ${className}`}>
      <AlgalleMark size={size} tone={tone} title={null} className="animate-pulse" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

interface AlgalleWordmarkProps {
  /** Lockup height in px (mark and text scale with it). */
  size?: number
  /** Show the Amharic አልጋ አለ subtitle. */
  showAmharic?: boolean
  /** Use on dark/green backgrounds: light mark + light text. */
  reverse?: boolean
  className?: string
}

export function AlgalleWordmark({ size = 36, showAmharic = true, reverse = false, className = "" }: AlgalleWordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <AlgalleMark size={Math.round(size * 1.33)} tone={reverse ? "light" : "brand"} title={null} />
      <span className="flex flex-col leading-none">
        <span
          className={`whitespace-nowrap font-bold tracking-tight ${reverse ? "text-white" : "text-foreground"}`}
          style={{ fontSize: Math.round(size * 0.5) }}
        >
          {BRAND_WORDMARK}
        </span>
        {showAmharic && (
          <span
            className={`font-serif ${reverse ? "text-white/70" : "text-muted-foreground"}`}
            style={{ fontSize: Math.round(size * 0.34) }}
          >
            አልጋ አለ
          </span>
        )}
      </span>
    </span>
  )
}
