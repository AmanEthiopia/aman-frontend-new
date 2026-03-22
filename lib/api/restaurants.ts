import { apiFetch, apiGet } from "./client"
import type { Restaurant } from "@/lib/types"

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
  const endpoint = queryString ? `/restaurants/?${queryString}` : "/restaurants/"
  
  try {
    const response = await apiFetch<PaginatedRestaurants | Restaurant[]>(endpoint)
    
    // Handle both paginated and array responses
    if (Array.isArray(response)) {
      return {
        count: response.length,
        next: null,
        previous: null,
        results: response,
      }
    }
    if (response && "results" in response) {
      return response
    }
    return { count: 0, next: null, previous: null, results: [] }
  } catch (error) {
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
