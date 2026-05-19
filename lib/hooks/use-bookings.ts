"use client"

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import * as bookingsAPI from "@/lib/api/bookings"
import type {
  BookingStatus,
  HotelBooking,
  HotelBookingListItem,
  RestaurantReservation,
  RestaurantReservationListItem,
  PackageBooking,
  TransportBooking,
  Booking,
  AllBookingsResponse,
  CreateHotelBookingPayload,
  CreateRestaurantReservationPayload,
  CreatePackageBookingPayload,
  CreateTransportBookingPayload,
  HotelBookingResponse,
  RestaurantReservationResponse,
  PackageBookingResponse,
  TransportBookingResponse,
  ProviderDashboardStats,
  CalendarResponse,
  EarningsResponse,
} from "@/lib/api/bookings"

// ============================================================================
// User Booking Hooks
// ============================================================================

/**
 * Hook to get all user bookings across all types
 */
export function useAllBookings() {
  const { data, error, isLoading, mutate } = useSWR<AllBookingsResponse>(
    "user-all-bookings",
    async () => {
      try {
        return await bookingsAPI.getAllMyBookings()
      } catch (err) {
        console.error("[v0] Failed to fetch all bookings:", err)
        return { hotel: [], restaurant: [], package: [], driver: [], transport: [] }
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  // Get flattened and sorted list
  const allBookings: Booking[] = data ? bookingsAPI.flattenBookings(data) : []

  return {
    bookings: allBookings,
    hotelBookings: data?.hotel || [],
    restaurantReservations: data?.restaurant || [],
    packageBookings: data?.package || [],
    transportBookings: data?.transport || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to get hotel bookings
 */
export function useHotelBookings(status?: BookingStatus) {
  const { data, error, isLoading, mutate } = useSWR<HotelBookingListItem[]>(
    ["user-hotel-bookings", status],
    async () => {
      try {
        return await bookingsAPI.getMyHotelBookings(status)
      } catch (err) {
        console.error("[v0] Failed to fetch hotel bookings:", err)
        return []
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    bookings: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to get a single hotel booking
 */
export function useHotelBooking(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<HotelBooking | null>(
    id ? ["hotel-booking", id] : null,
    async () => {
      if (!id) return null
      try {
        return await bookingsAPI.getHotelBookingById(id)
      } catch (err) {
        console.error("[v0] Failed to fetch hotel booking:", err)
        return null
      }
    }
  )

  return {
    booking: data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to get restaurant reservations
 */
export function useRestaurantReservations(status?: BookingStatus) {
  const { data, error, isLoading, mutate } = useSWR<RestaurantReservationListItem[]>(
    ["user-restaurant-reservations", status],
    async () => {
      try {
        return await bookingsAPI.getMyRestaurantReservations(status)
      } catch (err) {
        console.error("[v0] Failed to fetch restaurant reservations:", err)
        return []
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    reservations: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to get package bookings
 */
export function usePackageBookings(status?: BookingStatus) {
  const { data, error, isLoading, mutate } = useSWR<PackageBooking[]>(
    ["user-package-bookings", status],
    async () => {
      try {
        return await bookingsAPI.getMyPackageBookings(status)
      } catch (err) {
        console.error("[v0] Failed to fetch package bookings:", err)
        return []
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    bookings: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to get transport bookings
 */
export function useTransportBookings(status?: BookingStatus) {
  const { data, error, isLoading, mutate } = useSWR<TransportBooking[]>(
    ["user-transport-bookings", status],
    async () => {
      try {
        return await bookingsAPI.getMyTransportBookings(status)
      } catch (err) {
        console.error("[v0] Failed to fetch transport bookings:", err)
        return []
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    bookings: data || [],
    isLoading,
    error,
    mutate,
  }
}

// ============================================================================
// Booking Mutation Hooks
// ============================================================================

/**
 * Hook to create a hotel booking
 */
export function useCreateHotelBooking() {
  const { trigger, isMutating, error } = useSWRMutation(
    "create-hotel-booking",
    async (_key: string, { arg }: { arg: CreateHotelBookingPayload }) => {
      return await bookingsAPI.createHotelBooking(arg)
    }
  )

  return {
    createBooking: trigger,
    isCreating: isMutating,
    error,
  }
}

/**
 * Hook to create a restaurant reservation
 */
export function useCreateRestaurantReservation() {
  const { trigger, isMutating, error } = useSWRMutation(
    "create-restaurant-reservation",
    async (_key: string, { arg }: { arg: CreateRestaurantReservationPayload }) => {
      return await bookingsAPI.createRestaurantReservation(arg)
    }
  )

  return {
    createReservation: trigger,
    isCreating: isMutating,
    error,
  }
}

/**
 * Hook to create a package booking
 */
export function useCreatePackageBooking() {
  const { trigger, isMutating, error } = useSWRMutation(
    "create-package-booking",
    async (_key: string, { arg }: { arg: CreatePackageBookingPayload }) => {
      return await bookingsAPI.createPackageBooking(arg)
    }
  )

  return {
    createBooking: trigger,
    isCreating: isMutating,
    error,
  }
}

/**
 * Hook to create a transport booking
 */
export function useCreateTransportBooking() {
  const { trigger, isMutating, error } = useSWRMutation(
    "create-transport-booking",
    async (_key: string, { arg }: { arg: CreateTransportBookingPayload }) => {
      return await bookingsAPI.createTransportBooking(arg)
    }
  )

  return {
    createBooking: trigger,
    isCreating: isMutating,
    error,
  }
}

/**
 * Hook to cancel a hotel booking
 */
export function useCancelHotelBooking() {
  const { trigger, isMutating, error } = useSWRMutation(
    "cancel-hotel-booking",
    async (_key: string, { arg }: { arg: { id: string; reason?: string } }) => {
      return await bookingsAPI.cancelHotelBooking(arg.id, arg.reason)
    }
  )

  return {
    cancelBooking: trigger,
    isCancelling: isMutating,
    error,
  }
}

/**
 * Hook to cancel a restaurant reservation
 */
export function useCancelRestaurantReservation() {
  const { trigger, isMutating, error } = useSWRMutation(
    "cancel-restaurant-reservation",
    async (_key: string, { arg }: { arg: { id: string; reason?: string } }) => {
      return await bookingsAPI.cancelRestaurantReservation(arg.id, arg.reason)
    }
  )

  return {
    cancelReservation: trigger,
    isCancelling: isMutating,
    error,
  }
}

/**
 * Hook to cancel a package booking
 */
export function useCancelPackageBooking() {
  const { trigger, isMutating, error } = useSWRMutation(
    "cancel-package-booking",
    async (_key: string, { arg }: { arg: { id: string; reason?: string } }) => {
      return await bookingsAPI.cancelPackageBooking(arg.id, arg.reason)
    }
  )

  return {
    cancelBooking: trigger,
    isCancelling: isMutating,
    error,
  }
}

// ============================================================================
// Provider Booking Hooks
// ============================================================================

/**
 * Hook to get provider dashboard stats
 */
export function useProviderDashboard() {
  const { data, error, isLoading, mutate } = useSWR<ProviderDashboardStats>(
    "provider-dashboard",
    async () => {
      try {
        return await bookingsAPI.getProviderDashboard()
      } catch (err) {
        console.error("[v0] Failed to fetch provider dashboard:", err)
        // Return mock data for development
        return {
          pending_bookings: 0,
          confirmed_bookings_this_month: 0,
          revenue_this_month: "0.00",
          occupancy_rate: 0,
          average_rating: 0,
          total_hotels: 0,
        }
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to get provider calendar
 */
export function useProviderCalendar(params?: { year?: number; month?: number; hotel_id?: string }) {
  const { data, error, isLoading, mutate } = useSWR<CalendarResponse>(
    ["provider-calendar", params?.year, params?.month, params?.hotel_id],
    async () => {
      try {
        return await bookingsAPI.getProviderCalendar(params)
      } catch (err) {
        console.error("[v0] Failed to fetch provider calendar:", err)
        return {
          bookings: [],
          month_stats: { total_nights: 0, total_guests: 0, revenue: "0.00" },
        }
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    calendar: data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to get provider earnings
 */
export function useProviderEarnings(params?: { period?: "this_month" | "last_month" | "this_year"; hotel_id?: string }) {
  const { data, error, isLoading, mutate } = useSWR<EarningsResponse>(
    ["provider-earnings", params?.period, params?.hotel_id],
    async () => {
      try {
        return await bookingsAPI.getProviderEarnings(params)
      } catch (err) {
        console.error("[v0] Failed to fetch provider earnings:", err)
        return {
          period: params?.period || "this_month",
          total_revenue: "0.00",
          total_bookings: 0,
          avg_nightly_rate: "0.00",
          occupancy_rate: 0,
          pending_balance: "0.00",
          transactions: [],
        }
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    earnings: data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to get provider hotel bookings
 */
export function useProviderHotelBookings(params?: { status?: BookingStatus; hotel_id?: string }) {
  const { data, error, isLoading, mutate } = useSWR<HotelBookingListItem[]>(
    ["provider-hotel-bookings", params?.status, params?.hotel_id],
    async () => {
      try {
        return await bookingsAPI.getProviderHotelBookings(params)
      } catch (err) {
        console.error("[v0] Failed to fetch provider hotel bookings:", err)
        return []
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    bookings: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to get provider restaurant reservations
 */
export function useProviderRestaurantReservations(params?: { status?: BookingStatus; restaurant_id?: string; date?: string }) {
  const { data, error, isLoading, mutate } = useSWR<RestaurantReservationListItem[]>(
    ["provider-restaurant-reservations", params?.status, params?.restaurant_id, params?.date],
    async () => {
      try {
        return await bookingsAPI.getProviderRestaurantReservations(params)
      } catch (err) {
        console.error("[v0] Failed to fetch provider restaurant reservations:", err)
        return []
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    reservations: data || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to confirm/reject hotel bookings
 */
export function useProviderHotelBookingActions() {
  const confirmMutation = useSWRMutation(
    "confirm-hotel-booking",
    async (_key: string, { arg }: { arg: string }) => {
      return await bookingsAPI.confirmHotelBooking(arg)
    }
  )

  const rejectMutation = useSWRMutation(
    "reject-hotel-booking",
    async (_key: string, { arg }: { arg: { id: string; reason?: string } }) => {
      return await bookingsAPI.rejectHotelBooking(arg.id, arg.reason)
    }
  )

  return {
    confirmBooking: confirmMutation.trigger,
    isConfirming: confirmMutation.isMutating,
    rejectBooking: rejectMutation.trigger,
    isRejecting: rejectMutation.isMutating,
  }
}

/**
 * Hook to confirm/reject restaurant reservations
 */
export function useProviderRestaurantReservationActions() {
  const confirmMutation = useSWRMutation(
    "confirm-restaurant-reservation",
    async (_key: string, { arg }: { arg: string }) => {
      return await bookingsAPI.confirmRestaurantReservation(arg)
    }
  )

  const rejectMutation = useSWRMutation(
    "reject-restaurant-reservation",
    async (_key: string, { arg }: { arg: { id: string; reason?: string } }) => {
      return await bookingsAPI.rejectRestaurantReservation(arg.id, arg.reason)
    }
  )

  return {
    confirmReservation: confirmMutation.trigger,
    isConfirming: confirmMutation.isMutating,
    rejectReservation: rejectMutation.trigger,
    isRejecting: rejectMutation.isMutating,
  }
}

/**
 * Hook to confirm/reject package bookings
 */
export function useProviderPackageBookingActions() {
  const confirmMutation = useSWRMutation(
    "confirm-package-booking",
    async (_key: string, { arg }: { arg: string }) => {
      return await bookingsAPI.confirmPackageBooking(arg)
    }
  )

  const rejectMutation = useSWRMutation(
    "reject-package-booking",
    async (_key: string, { arg }: { arg: { id: string; reason?: string } }) => {
      return await bookingsAPI.rejectPackageBooking(arg.id, arg.reason)
    }
  )

  return {
    confirmBooking: confirmMutation.trigger,
    isConfirming: confirmMutation.isMutating,
    rejectBooking: rejectMutation.trigger,
    isRejecting: rejectMutation.isMutating,
  }
}
