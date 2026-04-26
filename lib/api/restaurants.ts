import { apiFetch, apiGet } from "./client"
import type { Restaurant } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.aman.yichalal.ai/api/v1"

export interface RestaurantFilters {
  city?: string // Uses slug
  cuisine?: string
  priceRange?: string
  search?: string
  page?: number
  page_size?: number
}

export interface PaginatedRestaurants {
  count: number
  next: string | null
  previous: string | null
  results: Restaurant[]
}

/**
 * Fetch restaurants with optional filters
 * City filter uses slug, not UUID
 */
export async function getRestaurants(filters: RestaurantFilters = {}): Promise<Restaurant[]> {
  const response = await getRestaurantsPaginated(filters)
  return response.results
}

/**
 * Fetch restaurants with pagination info (includes total count)
 */
export async function getRestaurantsPaginated(filters: RestaurantFilters = {}): Promise<PaginatedRestaurants> {
  const params = new URLSearchParams()
  
  if (filters.city && filters.city !== "all") {
    params.append("city", filters.city) // Using slug
  }
  if (filters.cuisine && filters.cuisine !== "all") {
    params.append("cuisine", filters.cuisine)
  }
  if (filters.priceRange && filters.priceRange !== "all") {
    params.append("price_range", filters.priceRange)
  }
  if (filters.search) {
    params.append("search", filters.search)
  }
  if (filters.page) {
    params.append("page", String(filters.page))
  }
  if (filters.page_size) {
    params.append("page_size", String(filters.page_size))
  }

  const queryString = params.toString()
  const url = `${API_BASE_URL}/restaurants/${queryString ? `?${queryString}` : ""}`

  try {
    const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    if (!res.ok) return { count: 0, next: null, previous: null, results: [] }
    const raw = await res.json()

    // { success: true, data: [...], meta: { pagination: {...} } }
    if (raw.meta?.pagination) {
      const p = raw.meta.pagination
      return {
        count: p.count ?? 0,
        next: p.next || null,
        previous: p.previous || null,
        results: raw.data || raw.results || [],
      }
    }

    // Envelope without meta
    if (raw.success !== undefined && raw.data) {
      const arr = Array.isArray(raw.data) ? raw.data : raw.data.results || []
      return { count: arr.length, next: null, previous: null, results: arr }
    }

    // Direct paginated response
    if (raw.results) return raw as PaginatedRestaurants
    if (Array.isArray(raw)) return { count: raw.length, next: null, previous: null, results: raw }

    return { count: 0, next: null, previous: null, results: [] }
  } catch {
    return { count: 0, next: null, previous: null, results: [] }
  }
}

/**
 * Get restaurant by ID or slug
 */
export async function getRestaurantById(idOrSlug: string): Promise<Restaurant> {
  return apiFetch<Restaurant>(`/restaurants/${idOrSlug}/`)
}

/**
 * Get featured restaurants
 */
export async function getFeaturedRestaurants(): Promise<Restaurant[]> {
  return getRestaurants({ page_size: 6 })
}
