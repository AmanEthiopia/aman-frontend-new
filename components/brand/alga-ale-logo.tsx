"use client"

/**
 * Alga Ale brand logo — single source of truth for traveler + provider.
 *
 * Right now it renders the text-badge lockup (the "A" badge + "Alga Ale" / አልጋ አለ),
 * which matches the dashboard header and needs no image asset.
 *
 * To switch to one of the custom logo designs, drop the exported artwork into
 * /public/brand/ (e.g. alga-ale.svg) and flip ACTIVE_LOGO below to that file —
 * every header/footer that uses <AlgaAleWordmark/> updates automatically.
 */
import Image from "next/image"

// When you add the chosen design, set this to its public path, e.g. "/brand/alga-ale.svg".
// Leave null to use the built-in text lockup.
const ACTIVE_LOGO: string | null = null

interface AlgaAleWordmarkProps {
  /** Badge size in px (text scales with it). */
  size?: number
  /** Show the Amharic አልጋ አለ subtitle. */
  showAmharic?: boolean
  className?: string
}

export function AlgaAleWordmark({ size = 36, showAmharic = true, className = "" }: AlgaAleWordmarkProps) {
  if (ACTIVE_LOGO) {
    return (
      <Image
        src={ACTIVE_LOGO}
        alt="Alga Ale"
        height={size}
        width={size * 4}
        className={`h-auto w-auto object-contain ${className}`}
        priority
      />
    )
  }

  const badge = Math.round(size)
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="flex items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground"
        style={{ height: badge, width: badge, fontSize: badge * 0.5 }}
      >
        A
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-bold text-foreground" style={{ fontSize: badge * 0.5 }}>
          Alga Ale
        </span>
        {showAmharic && (
          <span className="font-serif text-muted-foreground" style={{ fontSize: badge * 0.34 }}>
            አልጋ አለ
          </span>
        )}
      </span>
    </span>
  )
}
