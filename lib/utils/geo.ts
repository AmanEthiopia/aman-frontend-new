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

/** Browser geolocation as a promise. */
export function getCurrentPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  })
}

export function formatDistance(km?: number | null): string | null {
  if (km == null || !Number.isFinite(km)) return null
  if (km < 1) return `${Math.round(km * 1000)} m away`
  return `${km.toFixed(1)} km away`
}
