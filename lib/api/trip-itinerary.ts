import { apiGet, apiPost, apiPatch, apiDelete, apiFetch } from "./client"

// ── Types (match backend PackageDaySerializer / PackageItemSerializer) ────────

export interface TripDayItem {
  id: string
  item_type: "hotel" | "restaurant" | "attraction" | "activity"
  order: number
  title?: string | null
  description?: string | null
  duration_minutes?: number | null
  notes?: string | null
  hotel?: { id: string; name: string } | null
  restaurant?: { id: string; name: string } | null
  attraction?: { id: string; name: string } | null
}

export interface TripDay {
  id: string
  day_number: number
  title: string
  description?: string | null
  photo_url?: string | null
  city?: { id: string; name: string } | null
  items: TripDayItem[]
}

const base = (pkgId: string) => `/experiences/provider/${pkgId}/days/`

// ── Days ──────────────────────────────────────────────────────────────────────

export async function getTripDays(pkgId: string): Promise<TripDay[]> {
  const raw = await apiGet<any>(base(pkgId))
  return Array.isArray(raw) ? raw : (raw?.results ?? [])
}

export async function createTripDay(
  pkgId: string,
  payload: { day_number: number; title: string; description?: string },
): Promise<TripDay> {
  return apiPost<TripDay>(base(pkgId), payload)
}

export async function updateTripDay(
  pkgId: string,
  dayId: string,
  payload: Partial<{ day_number: number; title: string; description: string }>,
): Promise<TripDay> {
  return apiPatch<TripDay>(`${base(pkgId)}${dayId}/`, payload)
}

export async function deleteTripDay(pkgId: string, dayId: string): Promise<void> {
  await apiDelete(`${base(pkgId)}${dayId}/`)
}

// ── Day photo ─────────────────────────────────────────────────────────────────

export async function uploadTripDayPhoto(pkgId: string, dayId: string, file: File): Promise<TripDay> {
  const formData = new FormData()
  formData.append("photo", file)
  return apiFetch<TripDay>(`${base(pkgId)}${dayId}/photo/`, { method: "POST", body: formData })
}

export async function deleteTripDayPhoto(pkgId: string, dayId: string): Promise<void> {
  await apiDelete(`${base(pkgId)}${dayId}/photo/`)
}

// ── Items (activities + platform resources) ──────────────────────────────────

export interface AddTripDayItemPayload {
  item_type?: "activity" | "hotel" | "restaurant" | "attraction"
  title?: string
  description?: string
  duration_minutes?: number
  order?: number
  hotel_id?: string
  restaurant_id?: string
  attraction_id?: string
}

export async function addTripDayItem(
  pkgId: string,
  dayId: string,
  payload: AddTripDayItemPayload,
): Promise<TripDayItem> {
  return apiPost<TripDayItem>(`${base(pkgId)}${dayId}/items/`, {
    item_type: "activity",
    ...payload,
  })
}

export async function deleteTripDayItem(pkgId: string, dayId: string, itemId: string): Promise<void> {
  await apiDelete(`${base(pkgId)}${dayId}/items/${itemId}/`)
}
