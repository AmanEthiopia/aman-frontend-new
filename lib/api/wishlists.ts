import { apiGet, apiPost, apiDelete } from "./client"

export type WishlistItemType = "hotel" | "restaurant" | "experience" | "guide" | "driver"

export const WISHLIST_ITEM_TYPE_LABELS: Record<WishlistItemType, string> = {
  hotel: "Hotels",
  restaurant: "Restaurants",
  experience: "Experiences",
  guide: "Guides",
  driver: "Drivers",
}

export interface WishlistItemSummary {
  id: string
  type: WishlistItemType
  title: string
  slug: string
  city: string
  average_rating: string
  photo_url: string | null
}

export interface WishlistItem {
  id: string
  item_type: WishlistItemType
  item_id: string
  notes: string | null
  item: WishlistItemSummary
}

export interface WishlistCheckResult {
  is_wishlisted: boolean
  wishlist_count: number
}

export interface WishlistToggleResult {
  is_wishlisted: boolean
  wishlist_count: number
}

export interface ProviderWishlistStat {
  type: WishlistItemType
  id: string
  title: string
  slug: string
  wishlist_count: number
}

export async function getWishlists(type?: WishlistItemType): Promise<WishlistItem[]> {
  const qs = type ? `?type=${type}` : ""
  const raw = await apiGet<any>(`/wishlists/${qs}`)
  return Array.isArray(raw) ? raw : (raw?.results ?? raw?.data ?? [])
}

export async function checkWishlist(itemType: WishlistItemType, itemId: string): Promise<WishlistCheckResult> {
  return apiGet<WishlistCheckResult>(`/wishlists/check/?item_type=${itemType}&item_id=${itemId}`)
}

export async function toggleWishlist(itemType: WishlistItemType, itemId: string): Promise<WishlistToggleResult> {
  return apiPost<WishlistToggleResult>("/wishlists/toggle/", { item_type: itemType, item_id: itemId })
}

export async function removeFromWishlist(wishlistItemId: string): Promise<void> {
  return apiDelete(`/wishlists/${wishlistItemId}/`)
}

export async function getProviderWishlistStats(): Promise<ProviderWishlistStat[]> {
  const raw = await apiGet<any>("/wishlists/provider/stats/")
  return Array.isArray(raw) ? raw : (raw?.data ?? [])
}
