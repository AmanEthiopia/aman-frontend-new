"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Navigation, X } from "lucide-react"
import { toast } from "sonner"
import {
  type Coords,
  GeoError,
  geoHelpText,
  getCurrentPosition,
  isValidCoords,
  osmEmbedUrl,
  parseCoords,
} from "@/lib/utils/geo"

interface Props {
  latitude?: number | string | null
  longitude?: number | string | null
  onChange: (coords: { latitude: number; longitude: number } | { latitude: null; longitude: null }) => void
  label?: string
}

/**
 * Keyless location picker for provider forms:
 * - "Use my current location" (browser geolocation)
 * - paste a Google Maps link / coordinates
 * - live OpenStreetMap preview with a marker
 */
export function LocationPicker({ latitude, longitude, onChange, label = "Location" }: Props) {
  const initial: Coords | null =
    latitude != null && longitude != null && latitude !== "" && longitude !== ""
      ? { lat: Number(latitude), lng: Number(longitude) }
      : null
  const [coords, setCoords] = useState<Coords | null>(isValidCoords(initial) ? initial : null)
  const [pasteValue, setPasteValue] = useState("")
  const [locating, setLocating] = useState(false)

  const apply = (c: Coords) => {
    setCoords(c)
    onChange({ latitude: c.lat, longitude: c.lng })
  }

  const clear = () => {
    setCoords(null)
    setPasteValue("")
    onChange({ latitude: null, longitude: null })
  }

  const useCurrent = async () => {
    setLocating(true)
    try {
      const c = await getCurrentPosition()
      apply(c)
      toast.success("Location set to your current position")
    } catch (err) {
      const reason = err instanceof GeoError ? err.reason : "unavailable"
      // For the provider form there's always the paste fallback, so a toast is fine.
      const suffix = reason === "denied" || reason === "insecure" ? " You can paste a Google Maps link instead." : ""
      toast.error(geoHelpText(reason) + suffix)
    } finally {
      setLocating(false)
    }
  }

  const handlePaste = (value: string) => {
    setPasteValue(value)
    const parsed = parseCoords(value)
    if (parsed && isValidCoords(parsed)) apply(parsed)
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={useCurrent} disabled={locating} className="shrink-0">
          {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
          Use my current location
        </Button>
        <Input
          placeholder="…or paste a Google Maps link / coordinates"
          value={pasteValue}
          onChange={(e) => handlePaste(e.target.value)}
        />
      </div>

      {coords ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </span>
            <button type="button" onClick={clear} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <iframe
              key={`${coords.lat},${coords.lng}`}
              title="Location preview"
              src={osmEmbedUrl(coords.lat, coords.lng)}
              className="h-52 w-full"
              loading="lazy"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Drag-free preview. To adjust, paste a different pin from Google Maps.
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Add a map pin so travelers can find you and use &ldquo;Near me.&rdquo; Tip: in Google Maps, right-click your
          spot → copy the coordinates, or share the link and paste it here.
        </p>
      )}
    </div>
  )
}
