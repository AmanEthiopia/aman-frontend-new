"use client"

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import * as providerAPI from "@/lib/api/provider"
import type {
  PropertyCategory,
  PropertyBase,
  ProviderHotel,
  ProviderRestaurant,
  ProviderDriver,
  ProviderTrip,
  ProviderStats,
  ProviderBooking,
  PaginatedResponse,
  City,
  CreateHotelPayload,
  CreateRestaurantPayload,
  CreateDriverPayload,
  CreateTripPayload,
} from "@/lib/api/provider"

// ============================================================================
// FETCHER FUNCTIONS
// ============================================================================

const fetchStats = async (): Promise<ProviderStats> => {
  return providerAPI.getProviderStats()
}

const fetchProperties = async (
  _key: string,
  { arg }: { arg?: { category?: PropertyCategory; is_active?: boolean; page?: number } }
): Promise<PaginatedResponse<PropertyBase>> => {
  return providerAPI.getMyProperties(arg || {})
}

const fetchMyHotels = async (): Promise<PaginatedResponse<ProviderHotel>> => {
  return providerAPI.getMyHotels({ page_size: 100 })
}

const fetchMyRestaurants = async (): Promise<PaginatedResponse<ProviderRestaurant>> => {
  return providerAPI.getMyRestaurants({ page_size: 100 })
}

const fetchMyDrivers = async (): Promise<PaginatedResponse<ProviderDriver>> => {
  return providerAPI.getMyDrivers({ page_size: 100 })
}

const fetchMyTrips = async (): Promise<PaginatedResponse<ProviderTrip>> => {
  return providerAPI.getMyTrips({ page_size: 100 })
}

const fetchBookings = async (
  _key: string,
  params?: {
    status?: "pending" | "confirmed" | "cancelled" | "completed"
    property_id?: string
    page?: number
  }
): Promise<PaginatedResponse<ProviderBooking>> => {
  return providerAPI.getMyBookings(params || {})
}

const fetchCities = async (): Promise<PaginatedResponse<City>> => {
  return providerAPI.getCities({ page_size: 100 })
}

// ============================================================================
// PROVIDER STATS HOOK
// ============================================================================

export function useProviderStats() {
  const { data, error, isLoading, mutate } = useSWR(
    "provider-stats",
    fetchStats,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      fallbackData: {
        total_properties: 0,
        total_bookings: 0,
        pending_bookings: 0,
        confirmed_bookings: 0,
        total_revenue: 0,
        monthly_revenue: 0,
        average_rating: 0,
        total_reviews: 0,
        response_rate: 0,
        occupancy_rate: 0,
      },
    }
  )

  return {
    stats: data,
    isLoading,
    error,
    refresh: mutate,
  }
}

// ============================================================================
// PROPERTIES HOOKS
// ============================================================================

export function useMyProperties(params?: { 
  category?: PropertyCategory
  is_active?: boolean
  page?: number
}) {
  const queryKey = params 
    ? `provider-properties-${JSON.stringify(params)}`
    : "provider-properties"

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    () => providerAPI.getMyProperties(params || {}),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  )

  return {
    properties: data?.results || [],
    pagination: data ? {
      count: data.count,
      page: data.page,
      pageSize: data.page_size,
      numPages: data.num_pages,
      hasNext: !!data.next,
      hasPrev: !!data.previous,
    } : null,
    isLoading,
    error,
    refresh: mutate,
  }
}

export function useMyHotels() {
  const { data, error, isLoading, mutate } = useSWR(
    "provider-hotels",
    fetchMyHotels,
    { revalidateOnFocus: false }
  )

  return {
    hotels: data?.results || [],
    isLoading,
    error,
    refresh: mutate,
  }
}

export function useMyRestaurants() {
  const { data, error, isLoading, mutate } = useSWR(
    "provider-restaurants",
    fetchMyRestaurants,
    { revalidateOnFocus: false }
  )

  return {
    restaurants: data?.results || [],
    isLoading,
    error,
    refresh: mutate,
  }
}

export function useMyDrivers() {
  const { data, error, isLoading, mutate } = useSWR(
    "provider-drivers",
    fetchMyDrivers,
    { revalidateOnFocus: false }
  )

  return {
    drivers: data?.results || [],
    isLoading,
    error,
    refresh: mutate,
  }
}

export function useMyTrips() {
  const { data, error, isLoading, mutate } = useSWR(
    "provider-trips",
    fetchMyTrips,
    { revalidateOnFocus: false }
  )

  return {
    trips: data?.results || [],
    isLoading,
    error,
    refresh: mutate,
  }
}

// ============================================================================
// BOOKINGS HOOK
// ============================================================================

export function useProviderBookings(params?: {
  status?: "pending" | "confirmed" | "cancelled" | "completed"
  property_id?: string
  page?: number
}) {
  const queryKey = params
    ? `provider-bookings-${JSON.stringify(params)}`
    : "provider-bookings"

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    () => providerAPI.getMyBookings(params || {}),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  return {
    bookings: data?.results || [],
    pagination: data ? {
      count: data.count,
      page: data.page,
      pageSize: data.page_size,
      numPages: data.num_pages,
      hasNext: !!data.next,
      hasPrev: !!data.previous,
    } : null,
    isLoading,
    error,
    refresh: mutate,
  }
}

// ============================================================================
// CITIES HOOK
// ============================================================================

export function useCities() {
  const { data, error, isLoading } = useSWR(
    "cities",
    fetchCities,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 * 5, // 5 minutes cache
      fallbackData: {
        count: 6,
        page: 1,
        page_size: 100,
        num_pages: 1,
        next: null,
        previous: null,
        results: [
          { id: "1", name: "Addis Ababa", nickname: "አዲስ አበባ", slug: "addis-ababa", country: "Ethiopia", is_popular: true },
          { id: "2", name: "Lalibela", nickname: "ላሊበላ", slug: "lalibela", country: "Ethiopia", is_popular: true },
          { id: "3", name: "Gondar", nickname: "ጎንደር", slug: "gondar", country: "Ethiopia", is_popular: true },
          { id: "4", name: "Axum", nickname: "አክሱም", slug: "axum", country: "Ethiopia", is_popular: true },
          { id: "5", name: "Harar", nickname: "ሐረር", slug: "harar", country: "Ethiopia", is_popular: true },
          { id: "6", name: "Bahir Dar", nickname: "ባሕር ዳር", slug: "bahir-dar", country: "Ethiopia", is_popular: true },
        ],
      },
    }
  )

  return {
    cities: data?.results || [],
    isLoading,
    error,
  }
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export function useCreateHotel() {
  const { trigger, isMutating, error } = useSWRMutation(
    "create-hotel",
    async (_key: string, { arg }: { arg: CreateHotelPayload }) => {
      return providerAPI.createHotel(arg)
    }
  )

  return {
    createHotel: trigger,
    isCreating: isMutating,
    error,
  }
}

export function useCreateRestaurant() {
  const { trigger, isMutating, error } = useSWRMutation(
    "create-restaurant",
    async (_key: string, { arg }: { arg: CreateRestaurantPayload }) => {
      return providerAPI.createRestaurant(arg)
    }
  )

  return {
    createRestaurant: trigger,
    isCreating: isMutating,
    error,
  }
}

export function useCreateDriver() {
  const { trigger, isMutating, error } = useSWRMutation(
    "create-driver",
    async (_key: string, { arg }: { arg: CreateDriverPayload }) => {
      return providerAPI.createDriver(arg)
    }
  )

  return {
    createDriver: trigger,
    isCreating: isMutating,
    error,
  }
}

export function useCreateTrip() {
  const { trigger, isMutating, error } = useSWRMutation(
    "create-trip",
    async (_key: string, { arg }: { arg: CreateTripPayload }) => {
      return providerAPI.createTrip(arg)
    }
  )

  return {
    createTrip: trigger,
    isCreating: isMutating,
    error,
  }
}

export function useAcceptBooking() {
  const { trigger, isMutating, error } = useSWRMutation(
    "accept-booking",
    async (_key: string, { arg }: { arg: string }) => {
      return providerAPI.acceptBooking(arg)
    }
  )

  return {
    acceptBooking: trigger,
    isAccepting: isMutating,
    error,
  }
}

export function useDeclineBooking() {
  const { trigger, isMutating, error } = useSWRMutation(
    "decline-booking",
    async (_key: string, { arg }: { arg: { id: string; reason?: string } }) => {
      return providerAPI.declineBooking(arg.id, arg.reason)
    }
  )

  return {
    declineBooking: trigger,
    isDeclining: isMutating,
    error,
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get all provider data at once for dashboard
 */
export function useProviderDashboard() {
  const { stats, isLoading: statsLoading, error: statsError } = useProviderStats()
  const { bookings: pendingBookings, isLoading: bookingsLoading } = useProviderBookings({ 
    status: "pending" 
  })
  const { properties, isLoading: propertiesLoading } = useMyProperties()

  return {
    stats,
    pendingBookings,
    properties,
    isLoading: statsLoading || bookingsLoading || propertiesLoading,
    error: statsError,
  }
}
