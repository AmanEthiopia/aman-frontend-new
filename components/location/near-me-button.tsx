"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Navigation, X } from "lucide-react"
import { toast } from "sonner"
import { type Coords, getCurrentPosition } from "@/lib/utils/geo"

interface Props {
  active: boolean
  onLocate: (coords: Coords | null) => void
  className?: string
}

/**
 * Toggle button that requests the browser location (only on explicit click)
 * and reports it back, or clears it when toggled off.
 */
export function NearMeButton({ active, onLocate, className }: Props) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (active) {
      onLocate(null)
      return
    }
    setLoading(true)
    try {
      const coords = await getCurrentPosition()
      onLocate(coords)
      toast.success("Showing places near you")
    } catch (err: any) {
      toast.error(
        err?.code === 1
          ? "Location permission denied. Enable it to use Near Me."
          : "Couldn't get your location. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
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
  )
}
