import { apiFetch } from "./client"
import type { Transport } from "@/lib/types"

export interface TransportFilters {
  city?: string // Uses slug
  vehicle_type?: string
  service_type?: string
  search?: string
  page?: number
  page_size?: number
}

export interface PaginatedTransport {
  count: number
  next: string | null
  previous: string | null
  results: Transport[]
}

/**
 * Fetch transport/drivers with optional filters
 * City filter uses slug, not UUID
 */
export async function getTransports(filters: TransportFilters = {}): Promise<Transport[]> {
  const params = new URLSearchParams()
  
  if (filters.city && filters.city !== "all") {
    params.append("city", filters.city) // Using slug
  }
  if (filters.vehicle_type && filters.vehicle_type !== "all") {
    params.append("vehicle_type", filters.vehicle_type)
  }
  if (filters.service_type && filters.service_type !== "all") {
    params.append("service_type", filters.service_type)
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
  const endpoint = queryString ? `/drivers/?${queryString}` : "/drivers/"
  
  try {
    const response = await apiFetch<PaginatedTransport | Transport[]>(endpoint)
    
    if (Array.isArray(response)) {
      return response
    }
    if (response && "results" in response) {
      return response.results
    }
    return []
  } catch (error) {
    console.error("[v0] Failed to fetch transport:", error)
    return []
  }
}

/**
 * Get transport/driver by ID or slug
 */
export async function getTransportById(idOrSlug: string): Promise<Transport> {
  return apiFetch<Transport>(`/drivers/${idOrSlug}/`)
}

/**
 * Get featured transport services
 */
export async function getFeaturedTransports(): Promise<Transport[]> {
  return getTransports({ page_size: 6 })
}
