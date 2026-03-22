import { apiFetch } from "./client"
import type { Experience } from "@/lib/types"

export interface ExperienceFilters {
  city?: string // Uses slug
  category?: string
  duration?: string
  search?: string
  page?: number
  page_size?: number
}

export interface PaginatedExperiences {
  count: number
  next: string | null
  previous: string | null
  results: Experience[]
}

/**
 * Fetch experiences/trips with optional filters
 * City filter uses slug, not UUID
 * Tries multiple endpoints: /experiences/, /trips/
 */
export async function getExperiences(filters: ExperienceFilters = {}): Promise<Experience[]> {
  const response = await getExperiencesPaginated(filters)
  return response.results
}

/**
 * Fetch experiences with pagination info (includes total count)
 * Tries /experiences/ endpoint first, falls back to /trips/
 */
export async function getExperiencesPaginated(filters: ExperienceFilters = {}): Promise<PaginatedExperiences> {
  const params = new URLSearchParams()
  
  if (filters.city && filters.city !== "all") {
    params.append("city", filters.city) // Using slug
  }
  if (filters.category && filters.category !== "all") {
    params.append("category", filters.category)
  }
  if (filters.duration && filters.duration !== "all") {
    params.append("duration", filters.duration)
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
  
  // Try /experiences/ first, then /trips/ as fallback
  const endpoints = [
    queryString ? `/experiences/?${queryString}` : "/experiences/",
    queryString ? `/trips/?${queryString}` : "/trips/",
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await apiFetch<PaginatedExperiences | Experience[]>(endpoint)
      
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
    } catch {
      // Try next endpoint
      continue
    }
  }
  
  return { count: 0, next: null, previous: null, results: [] }
}

/**
 * Get experience/trip by ID or slug
 */
export async function getExperienceById(idOrSlug: string): Promise<Experience> {
  return apiFetch<Experience>(`/trips/${idOrSlug}/`)
}

/**
 * Get featured experiences
 */
export async function getFeaturedExperiences(): Promise<Experience[]> {
  return getExperiences({ page_size: 6 })
}
