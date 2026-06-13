import { apiGet, apiDelete, apiPost, apiFetch } from "./client"

export interface PropertyPhotoItem {
  id: string
  photo_url: string | null
  caption?: string
  display_order?: number
  is_primary: boolean
}

export type PhotoKind = "driver" | "trip"

// Endpoint bases per kind (both follow the same list/upload/delete/set-primary shape).
const BASES: Record<PhotoKind, (id: string) => string> = {
  driver: (id) => `/drivers/${id}/photos/`,
  trip: (id) => `/experiences/provider/${id}/photos/`,
}

export async function getPropertyPhotos(kind: PhotoKind, propertyId: string): Promise<PropertyPhotoItem[]> {
  const raw = await apiGet<any>(BASES[kind](propertyId))
  return Array.isArray(raw) ? raw : (raw?.results ?? [])
}

/** Upload a photo (multipart, field name "photo"). */
export async function uploadPropertyPhoto(
  kind: PhotoKind,
  propertyId: string,
  file: File,
  options?: { caption?: string; is_primary?: boolean },
): Promise<PropertyPhotoItem> {
  const formData = new FormData()
  formData.append("photo", file)
  if (options?.caption) formData.append("caption", options.caption)
  if (options?.is_primary !== undefined) formData.append("is_primary", String(options.is_primary))
  return apiFetch<PropertyPhotoItem>(BASES[kind](propertyId), { method: "POST", body: formData })
}

export async function deletePropertyPhoto(kind: PhotoKind, propertyId: string, photoId: string): Promise<void> {
  await apiDelete(`${BASES[kind](propertyId)}${photoId}/`)
}

export async function setPropertyPhotoPrimary(
  kind: PhotoKind,
  propertyId: string,
  photoId: string,
): Promise<PropertyPhotoItem> {
  return apiPost<PropertyPhotoItem>(`${BASES[kind](propertyId)}${photoId}/set-primary/`, {})
}
