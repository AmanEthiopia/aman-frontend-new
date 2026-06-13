/** Shared geolocation helpers for maps + "near me". */

export interface Coords {
  lat: number
  lng: number
}

/** Parse coordinates out of pasted text: "9.01, 38.76", a Google Maps URL, etc. */
export function parseCoords(input: string): Coords | null {
  if (!input) return null
  const text = input.trim()

  // Google Maps URL with @lat,lng,zoom
  const at = text.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) }

  // ?q=lat,lng or query=lat,lng or ll=lat,lng or destination=lat,lng
  const q = text.match(/(?:[?&](?:q|query|ll|destination|center)=)(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (q) return { lat: parseFloat(q[1]), lng: parseFloat(q[2]) }

  // Plain "lat, lng"
  const plain = text.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
  if (plain) return { lat: parseFloat(plain[1]), lng: parseFloat(plain[2]) }

  return null
}

export function isValidCoords(c: Coords | null | undefined): c is Coords {
  return !!c && Number.isFinite(c.lat) && Number.isFinite(c.lng) && Math.abs(c.lat) <= 90 && Math.abs(c.lng) <= 180
}

/** Deep link to Google Maps showing the point. */
export function googleMapsLink(lat: number, lng: number, label?: string): string {
  const q = label ? `${lat},${lng} (${encodeURIComponent(label)})` : `${lat},${lng}`
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

/** Deep link to Google Maps directions to the point. */
export function googleDirectionsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

/** Keyless OpenStreetMap embed (iframe) URL with a marker. */
export function osmEmbedUrl(lat: number, lng: number, delta = 0.01): string {
  const left = lng - delta
  const right = lng + delta
  const top = lat + delta
  const bottom = lat - delta
  const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
}

// Reason a geolocation request can't succeed — drives the message we show.
export type GeoErrorReason = "unsupported" | "insecure" | "denied" | "unavailable" | "timeout"

export class GeoError extends Error {
  reason: GeoErrorReason
  constructor(reason: GeoErrorReason, message: string) {
    super(message)
    this.reason = reason
    this.name = "GeoError"
  }
}

/** True only in a secure context (https or localhost) where geolocation is allowed. */
export function isGeoAvailable(): boolean {
  if (typeof navigator === "undefined" || !navigator.geolocation) return false
  if (typeof window !== "undefined" && window.isSecureContext === false) return false
  return true
}

/**
 * Browser geolocation as a promise. Coarse accuracy is intentional — for a
 * radius search, city-level location is plenty and is faster + more reliable
 * on mobile. Rejects with a GeoError carrying a typed reason.
 */
export function getCurrentPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new GeoError("unsupported", "Geolocation isn't supported by this browser"))
      return
    }
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      reject(new GeoError("insecure", "Location needs a secure (https) connection"))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const reason: GeoErrorReason =
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.TIMEOUT
              ? "timeout"
              : "unavailable"
        reject(new GeoError(reason, err.message || "Could not get your location"))
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 },
    )
  })
}

/**
 * Check whether geolocation permission is already in a known state, where the
 * Permissions API is supported (Android/desktop Chrome; not iOS Safari).
 * Returns "prompt" when unknown.
 */
export async function getGeoPermissionState(): Promise<PermissionState | "prompt"> {
  try {
    if (typeof navigator !== "undefined" && (navigator as any).permissions?.query) {
      const status = await (navigator as any).permissions.query({ name: "geolocation" })
      return status.state as PermissionState
    }
  } catch {
    // Permissions API not available / not queryable — fall through.
  }
  return "prompt"
}

/** iOS / iPadOS detection (covers iPadOS reporting as Mac with touch). */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent || ""
  const iOSClassic = /iPad|iPhone|iPod/.test(ua)
  const iPadOS = navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1
  return iOSClassic || iPadOS
}

/** Short, device-aware help text for when location is blocked/denied. */
export function geoHelpText(reason: GeoErrorReason): string {
  if (reason === "insecure") {
    return "Location needs a secure (https) connection. Make sure you're on https://aman.yichalal.ai and try again."
  }
  if (reason === "unsupported") {
    return "This browser doesn't support location. Try Safari or Chrome."
  }
  if (reason === "denied") {
    if (isIOS()) {
      return (
        "Location is blocked for this browser. On iPhone/iPad: open Settings → Privacy & Security → " +
        "Location Services → turn it on for your browser (Chrome or Safari) and set it to “While Using.” " +
        "In Safari you can also tap the “aA” menu in the address bar → Website Settings → Location → Allow. " +
        "Then reload this page and tap Near Me again."
      )
    }
    return (
      "Location is blocked. Click the location/lock icon in your browser's address bar, set Location to " +
      "“Allow,” then reload and tap Near Me again."
    )
  }
  if (reason === "timeout") {
    return "Getting your location took too long. Please try again somewhere with a clearer signal."
  }
  return "We couldn't determine your location. Please try again."
}

export function formatDistance(km?: number | null): string | null {
  if (km == null || !Number.isFinite(km)) return null
  if (km < 1) return `${Math.round(km * 1000)} m away`
  return `${km.toFixed(1)} km away`
}
