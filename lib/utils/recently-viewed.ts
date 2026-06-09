export interface RecentlyViewedItem {
  id: string
  type: "hotel" | "attraction" | "restaurant" | "experience"
  name: string
  imageUrl: string
  slug?: string
  location?: string
  viewedAt: number
}

const STORAGE_KEY = "algaale_recently_viewed"
const MAX_ITEMS = 12

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  if (typeof window === "undefined") return
  try {
    const existing = getRecentlyViewed()
    // Remove duplicate (same id + type)
    const filtered = existing.filter(i => !(i.id === item.id && i.type === item.type))
    const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : []
  } catch {
    return []
  }
}
