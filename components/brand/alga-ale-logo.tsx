/**
 * Algalle brand logo — the "Resting Arch" mark + wordmark.
 * Single source of truth for traveler + provider.
 *
 * Use `reverse` on dark / green backgrounds (renders the cream mark + light text).
 * The standalone <AlgaAleMark/> renders just the arch (no text).
 */

interface MarkProps {
  size?: number
  reverse?: boolean
  className?: string
}

export function AlgaAleMark({ size = 36, reverse = false, className = "" }: MarkProps) {
  const src = reverse ? "/brand/algalle-mark-reverse.svg" : "/brand/algalle-mark-green.svg"
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="Algalle" width={size} height={size} className={`shrink-0 ${className}`} style={{ height: size, width: size }} />
}

interface AlgaAleWordmarkProps {
  /** Mark size in px (text scales with it). */
  size?: number
  /** Show the Amharic አልጋ አለ subtitle. */
  showAmharic?: boolean
  /** Use on dark/green backgrounds: cream mark + light text. */
  reverse?: boolean
  className?: string
}

export function AlgaAleWordmark({ size = 36, showAmharic = true, reverse = false, className = "" }: AlgaAleWordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <AlgaAleMark size={size} reverse={reverse} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-bold tracking-tight ${reverse ? "text-white" : "text-foreground"}`}
          style={{ fontSize: Math.round(size * 0.5) }}
        >
          Alga Ale
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
