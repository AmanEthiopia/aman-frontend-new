"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, Navigation } from "lucide-react"
import { googleDirectionsLink, googleMapsLink, isValidCoords, osmEmbedUrl } from "@/lib/utils/geo"

interface Props {
  latitude?: number | string | null
  longitude?: number | string | null
  name?: string
  address?: string
  /** Render nothing if no coords (default), or a graceful fallback message. */
  fallback?: boolean
}

/**
 * Detail-page location block: embedded keyless OSM map + "Open in Google Maps"
 * and "Directions" deep links. Renders nothing when there are no coordinates.
 */
export function LocationMap({ latitude, longitude, name, address, fallback = false }: Props) {
  const coords =
    latitude != null && longitude != null && latitude !== "" && longitude !== ""
      ? { lat: Number(latitude), lng: Number(longitude) }
      : null

  if (!isValidCoords(coords)) {
    if (!fallback) return null
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <MapPin className="mb-1 inline h-4 w-4" /> Location not provided yet.
        {address ? <span className="ml-1">{address}</span> : null}
      </div>
    )
  }

  const { lat, lng } = coords

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border">
        <iframe
          title={`Map of ${name ?? "location"}`}
          src={osmEmbedUrl(lat, lng)}
          className="h-64 w-full"
          loading="lazy"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={googleMapsLink(lat, lng, name)} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Google Maps
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={googleDirectionsLink(lat, lng)} target="_blank" rel="noopener noreferrer">
            <Navigation className="mr-2 h-4 w-4" />
            Get Directions
          </a>
        </Button>
      </div>
      {address ? (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {address}
        </p>
      ) : null}
    </div>
  )
}
