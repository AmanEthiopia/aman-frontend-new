"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, MapPin, Navigation, X } from "lucide-react"
import { toast } from "sonner"
import {
  type Coords,
  GeoError,
  geoHelpText,
  getCurrentPosition,
  getGeoPermissionState,
} from "@/lib/utils/geo"

interface Props {
  active: boolean
  onLocate: (coords: Coords | null) => void
  className?: string
}

/**
 * Toggle button that requests the browser location (only on explicit click)
 * and reports it back, or clears it when toggled off.
 *
 * When location is blocked/denied (common on iOS where the browser returns
 * "denied" without prompting), shows a persistent, device-aware help panel
 * instead of a vanishing toast — so the user can actually fix it.
 */
export function NearMeButton({ active, onLocate, className }: Props) {
  const [loading, setLoading] = useState(false)
  const [help, setHelp] = useState<string | null>(null)

  const handleClick = async () => {
    if (active) {
      onLocate(null)
      setHelp(null)
      return
    }
    setLoading(true)
    setHelp(null)
    try {
      // If the Permissions API already knows it's denied, show help immediately
      // (avoids a confusing silent no-op on browsers that won't re-prompt).
      const state = await getGeoPermissionState()
      if (state === "denied") {
        setHelp(geoHelpText("denied"))
        return
      }

      const coords = await getCurrentPosition()
      onLocate(coords)
      toast.success("Showing places near you")
    } catch (err) {
      const reason = err instanceof GeoError ? err.reason : "unavailable"
      if (reason === "timeout" || reason === "unavailable") {
        // Transient — a toast is enough; they can just tap again.
        toast.error(geoHelpText(reason))
      } else {
        // denied / insecure / unsupported — needs a settings change, so keep it on screen.
        setHelp(geoHelpText(reason))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Button
        type="button"
        variant={active ? "default" : "outline"}
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : active ? (
          <X className="mr-2 h-4 w-4" />
        ) : (
          <Navigation className="mr-2 h-4 w-4" />
        )}
        {active ? "Near Me: On" : "Near Me"}
      </Button>

      {help && (
        <Alert className="max-w-sm border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30">
          <MapPin className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            Turn on location
            <button
              type="button"
              onClick={() => setHelp(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">{help}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
