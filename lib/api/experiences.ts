import { apiFetch, apiPost, apiGet, apiPatch, apiDelete } from "./client"

// ============================================================================
// Types
// ============================================================================

export type PackageCategory = 
  | "city_tour" 
  | "multi_city" 
  | "adventure" 
  | "culture" 
  | "food" 
  | "nature" 
  | "spiritual" 
  | "historical"

export type PackageItemType = "hotel" | "restaurant" | "attraction" | "activity"

export interface PackagePhoto {
  id: string
  photo_url: string
  caption?: string
  is_primary: boolean
  display_order: number
}

export interface PackageCity {
  id: string
  city: {
    id: string
    name: string
    nickname?: string
    slug: string
  }
  order: number
  night_count: number
}

export interface PackageItemHotel {
  id: string
  name: string
  nickname?: string
  slug: string
  star_rating?: number
  address?: string
  average_rating?: string
}

export interface PackageItemRestaurant {
  id: string
  name: string
  nickname?: string
  slug: string
  cuisine_type?: string
}

export interface PackageItemAttraction {
  id: string
  name: string
  nickname?: string
  slug: string
  category?: string
}

export interface PackageDayItem {
  id: string
  item_type: PackageItemType
  order: number
  hotel?: PackageItemHotel | null
  restaurant?: PackageItemRestaurant | null
  attraction?: PackageItemAttraction | null
  title?: string | null
  description?: string | null
  duration_minutes?: number | null
  notes?: string | null
}

export interface PackageDay {
  id: string
  day_number: number
  title: string
  description?: string
  city?: {
    id: string
    name: string
    nickname?: string
    slug: string
  }
  items: PackageDayItem[]
}

export interface Departure {
  id: string
  start_date: string
  end_date: string
  max_seats: number
  available_seats: number
  is_active: boolean
  notes?: string
}

export interface PackageOrganizer {
  id: string
  name: string
}

export interface Package {
  id: string
  title: string
  nickname?: string
  slug: string
  short_description?: string
  description?: string
  category: PackageCategory
  duration_days: number
  price_per_person: string
  price_currency: string
  child_price?: string
  payment_required: boolean
  min_group_size?: number
  max_group_size?: number
  min_age?: number | null
  meeting_point?: string
  languages?: string[]
  what_included?: string[]
  what_excluded?: string[]
  what_to_bring?: string[]
  cancellation_policy?: string
  average_rating?: string
  review_count?: number
  is_published: boolean
  provider_id?: string
  organizer?: PackageOrganizer
  primary_photo?: PackagePhoto
  photos?: PackagePhoto[]
  cities?: PackageCity[]
  days?: PackageDay[]
  next_departure?: Departure        // list view: nearest upcoming departure
  departures?: Departure[]          // detail view: all upcoming active departures
  created_at?: string
  updated_at?: string
}

// Alias for backward compatibility
export type Experience = Package

export interface ExperienceFilters {
  city?: string
  category?: string
  duration?: string
  min_days?: number
  max_days?: number
  price_min?: number
  price_max?: number
  search?: string
  sort?: "price_asc" | "price_desc" | "rating_desc" | "duration_asc" | "newest"
  page?: number
  page_size?: number
}

export interface PaginatedExperiences {
  count: number
  next: string | null
  previous: string | null
  results: Package[]
}

// ============================================================================
// Public APIs
// ============================================================================

/**
 * Fetch packages/experiences with optional filters
 */
export async function getExperiences(filters: ExperienceFilters = {}): Promise<Package[]> {
  const response = await getExperiencesPaginated(filters)
  return response.results
}

/**
 * Fetch packages with pagination info (includes total count)
 */
export async function getExperiencesPaginated(filters: ExperienceFilters = {}): Promise<PaginatedExperiences> {
  const params = new URLSearchParams()
  
  if (filters.city && filters.city !== "all") {
    params.append("city", filters.city)
  }
  if (filters.category && filters.category !== "all") {
    params.append("category", filters.category)
  }
  if (filters.min_days) {
    params.append("min_days", String(filters.min_days))
  }
  if (filters.max_days) {
    params.append("max_days", String(filters.max_days))
  }
  if (filters.price_min) {
    params.append("price_min", String(filters.price_min))
  }
  if (filters.price_max) {
    params.append("price_max", String(filters.price_max))
  }
  if (filters.search) {
    params.append("search", filters.search)
  }
  if (filters.sort) {
    params.append("sort", filters.sort)
  }
  if (filters.page) {
    params.append("page", String(filters.page))
  }
  if (filters.page_size) {
    params.append("page_size", String(filters.page_size))
  }

  const queryString = params.toString()
  const endpoint = queryString ? `/experiences/?${queryString}` : "/experiences/"
  
  try {
    const response = await apiFetch<PaginatedExperiences | Package[]>(endpoint)
    
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
  } catch {
    return { count: 0, next: null, previous: null, results: [] }
  }
}

/**
 * Get package/experience by slug with full itinerary
 */
export async function getExperienceBySlug(slug: string): Promise<Package> {
  return apiFetch<Package>(`/experiences/${slug}/`)
}

/**
 * Get featured packages
 */
export async function getFeaturedExperiences(): Promise<Package[]> {
  return getExperiences({ page_size: 6, sort: "rating_desc" })
}

// ============================================================================
// Traveler Booking APIs
// ============================================================================

export interface PackageBookingRequest {
  package_id: string
  /** Provide a scheduled departure, OR a preferred start_date for a flexible request. */
  departure_id?: string
  start_date?: string
  num_adults: number
  num_children?: number
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
}

export interface PackageBookingResponse {
  booking: {
    id: string
    booking_number: string
    status: string
    payment_required: boolean
    payment_status: string
    package: {
      id: string
      title: string
      nickname?: string
      slug: string
      duration_days: number
      price_per_person: string
      currency: string
    }
    departure?: Departure
    num_adults: number
    num_children: number
    total_price: string
    currency: string
    guest_name: string
    guest_email: string
    created_at: string
  }
  payment?: {
    required: boolean
    client_secret?: string
    payment_intent_id?: string
    amount?: string
    currency?: string
  }
}

export interface PackageBooking {
  id: string
  booking_number: string
  status: string
  payment_required: boolean
  payment_status: string
  package: {
    id: string
    title: string
    nickname?: string
    slug: string
    duration_days: number
    price_per_person: string
    currency: string
    primary_photo_url?: string
  }
  departure?: Departure
  num_adults: number
  num_children: number
  total_price: string
  currency: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  special_requests?: string
  created_at: string
  confirmed_at?: string
  cancelled_at?: string
  cancellation_reason?: string
}

/**
 * Book a package
 */
export async function createPackageBooking(data: PackageBookingRequest): Promise<PackageBookingResponse> {
  return apiPost<PackageBookingResponse>("/experiences/bookings/", data)
}

export interface ModifyPackageBookingPayload {
  start_date?: string
  num_adults?: number
  num_children?: number
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  special_requests?: string
}

export async function modifyPackageBooking(id: string, payload: ModifyPackageBookingPayload): Promise<unknown> {
  return apiPatch(`/experiences/bookings/${id}/`, payload)
}

/**
 * Get my package bookings
 */
export async function getMyPackageBookings(status?: string): Promise<PackageBooking[]> {
  const params = status ? `?status=${status}` : ""
  return apiGet<PackageBooking[]>(`/experiences/bookings/mine/${params}`)
}

/**
 * Get package booking by ID
 */
export async function getPackageBookingById(id: string): Promise<PackageBooking> {
  return apiGet<PackageBooking>(`/experiences/bookings/${id}/`)
}

/**
 * Cancel package booking
 */
export async function cancelPackageBooking(id: string, reason?: string): Promise<void> {
  await apiPost(`/experiences/bookings/${id}/cancel/`, { reason })
}

/**
 * Retry payment intent for booking
 */
export async function retryPackagePaymentIntent(id: string): Promise<{ client_secret: string; payment_intent_id: string }> {
  return apiPost(`/experiences/bookings/${id}/create-intent/`, {})
}

// ============================================================================
// Provider Package APIs
// ============================================================================

export interface CreatePackageRequest {
  title: string
  nickname?: string
  description?: string
  short_description?: string
  category: PackageCategory
  duration_days: number
  price_per_person: string
  price_currency?: string
  child_price?: string
  payment_required?: boolean
  min_group_size?: number
  max_group_size?: number
  min_age?: number | null
  meeting_point?: string
  languages?: string[]
  what_included?: string[]
  what_excluded?: string[]
  what_to_bring?: string[]
  cancellation_policy?: string
}

export interface AddCityRequest {
  city_id: string
  order: number
  night_count: number
}

export interface AddDayRequest {
  day_number: number
  title: string
  description?: string
  city_id?: string
}

export interface AddDayItemRequest {
  item_type: PackageItemType
  order: number
  hotel_id?: string
  restaurant_id?: string
  attraction_id?: string
  title?: string
  description?: string
  duration_minutes?: number
  notes?: string
}

/**
 * Get provider's packages
 */
export async function getProviderPackages(): Promise<Package[]> {
  return apiGet<Package[]>("/experiences/provider/")
}

/**
 * Get provider package by ID (with full details)
 */
export async function getProviderPackageById(id: string): Promise<Package> {
  return apiGet<Package>(`/experiences/provider/${id}/`)
}

/**
 * Create a new package
 */
export async function createPackage(data: CreatePackageRequest): Promise<{ id: string; slug: string }> {
  return apiPost<{ id: string; slug: string }>("/experiences/provider/", data)
}

/**
 * Update package
 */
export async function updatePackage(id: string, data: Partial<CreatePackageRequest>): Promise<Package> {
  return apiPatch<Package>(`/experiences/provider/${id}/`, data)
}

/**
 * Delete/unpublish package
 */
export async function deletePackage(id: string): Promise<void> {
  await apiDelete(`/experiences/provider/${id}/`)
}

/**
 * Toggle publish status
 */
export async function togglePackagePublish(id: string): Promise<{ is_published: boolean }> {
  return apiFetch<{ is_published: boolean }>(`/experiences/provider/${id}/publish/`, {
    method: "PUT",
  })
}

/**
 * Unpublish a package — hides it from public results without deleting it.
 * Idempotent: returns 200 even if already unpublished.
 */
export async function unpublishPackage(id: string): Promise<{ is_published: boolean }> {
  return apiFetch<{ is_published: boolean }>(`/experiences/provider/${id}/unpublish/`, {
    method: "PUT",
  })
}

// City management
export async function getPackageCities(packageId: string): Promise<PackageCity[]> {
  return apiGet<PackageCity[]>(`/experiences/provider/${packageId}/cities/`)
}

export async function addPackageCity(packageId: string, data: AddCityRequest): Promise<PackageCity> {
  return apiPost<PackageCity>(`/experiences/provider/${packageId}/cities/`, data)
}

export async function updatePackageCity(
  packageId: string,
  cityEntryId: string,
  data: { order?: number; night_count?: number }
): Promise<PackageCity> {
  return apiPatch<PackageCity>(`/experiences/provider/${packageId}/cities/${cityEntryId}/`, data)
}

export async function removePackageCity(packageId: string, cityEntryId: string): Promise<void> {
  await apiDelete(`/experiences/provider/${packageId}/cities/${cityEntryId}/`)
}

// Photo management
export async function getPackagePhotos(packageId: string): Promise<PackagePhoto[]> {
  return apiGet<PackagePhoto[]>(`/experiences/provider/${packageId}/photos/`)
}

export async function uploadPackagePhoto(
  packageId: string,
  file: File,
  options?: { caption?: string; display_order?: number; is_primary?: boolean }
): Promise<PackagePhoto> {
  const form = new FormData()
  form.append("photo", file)
  if (options?.caption) form.append("caption", options.caption)
  if (options?.display_order !== undefined) form.append("display_order", String(options.display_order))
  if (options?.is_primary) form.append("is_primary", "true")
  return apiFetch<PackagePhoto>(`/experiences/provider/${packageId}/photos/`, {
    method: "POST",
    body: form,
  })
}

export async function deletePackagePhoto(packageId: string, photoId: string): Promise<void> {
  await apiDelete(`/experiences/provider/${packageId}/photos/${photoId}/`)
}

export async function setPackagePhotoPrimary(packageId: string, photoId: string): Promise<PackagePhoto> {
  return apiPost<PackagePhoto>(`/experiences/provider/${packageId}/photos/${photoId}/set-primary/`, {})
}

// Day management
export async function getPackageDays(packageId: string): Promise<PackageDay[]> {
  return apiGet<PackageDay[]>(`/experiences/provider/${packageId}/days/`)
}

export async function addPackageDay(packageId: string, data: AddDayRequest): Promise<PackageDay> {
  return apiPost<PackageDay>(`/experiences/provider/${packageId}/days/`, data)
}

export async function updatePackageDay(packageId: string, dayId: string, data: Partial<AddDayRequest>): Promise<PackageDay> {
  return apiPatch<PackageDay>(`/experiences/provider/${packageId}/days/${dayId}/`, data)
}

export async function deletePackageDay(packageId: string, dayId: string): Promise<void> {
  await apiDelete(`/experiences/provider/${packageId}/days/${dayId}/`)
}

// Day item management
export async function getPackageDayItems(packageId: string, dayId: string): Promise<PackageDayItem[]> {
  return apiGet<PackageDayItem[]>(`/experiences/provider/${packageId}/days/${dayId}/items/`)
}

export async function addPackageDayItem(packageId: string, dayId: string, data: AddDayItemRequest): Promise<PackageDayItem> {
  return apiPost<PackageDayItem>(`/experiences/provider/${packageId}/days/${dayId}/items/`, data)
}

export async function updatePackageDayItem(
  packageId: string, 
  dayId: string, 
  itemId: string, 
  data: Partial<AddDayItemRequest>
): Promise<PackageDayItem> {
  return apiPatch<PackageDayItem>(`/experiences/provider/${packageId}/days/${dayId}/items/${itemId}/`, data)
}

export async function deletePackageDayItem(packageId: string, dayId: string, itemId: string): Promise<void> {
  await apiDelete(`/experiences/provider/${packageId}/days/${dayId}/items/${itemId}/`)
}

// ============================================================================
// Provider Departure Management
// ============================================================================

export interface CreateDepartureRequest {
  start_date: string
  end_date: string
  max_seats: number
  is_active?: boolean
  notes?: string
}

export async function getPackageDepartures(packageId: string): Promise<Departure[]> {
  const r = await apiGet<Departure[] | { results: Departure[] }>(
    `/experiences/provider/${packageId}/departures/`
  )
  return Array.isArray(r) ? r : r?.results ?? []
}

export async function createDeparture(packageId: string, data: CreateDepartureRequest): Promise<Departure> {
  return apiPost<Departure>(`/experiences/provider/${packageId}/departures/`, data)
}

export async function updateDeparture(
  packageId: string,
  departureId: string,
  data: Partial<CreateDepartureRequest>
): Promise<Departure> {
  return apiPatch<Departure>(`/experiences/provider/${packageId}/departures/${departureId}/`, data)
}

export async function deleteDeparture(packageId: string, departureId: string): Promise<void> {
  await apiDelete(`/experiences/provider/${packageId}/departures/${departureId}/`)
}

// ============================================================================
// Provider Booking APIs
// ============================================================================

export interface ProviderPackageBooking extends PackageBooking {
  traveler?: {
    id: string
    name: string
    email: string
  }
}

export async function getProviderPackageBookings(params?: {
  status?: string
  package_id?: string
}): Promise<ProviderPackageBooking[]> {
  const query = new URLSearchParams()
  if (params?.status) query.append("status", params.status)
  if (params?.package_id) query.append("package_id", params.package_id)
  const queryString = query.toString()
  return apiGet<ProviderPackageBooking[]>(`/experiences/provider/bookings/${queryString ? `?${queryString}` : ""}`)
}

export async function confirmPackageBooking(bookingId: string): Promise<void> {
  await apiPost(`/experiences/provider/bookings/${bookingId}/confirm/`, {})
}

export async function rejectPackageBooking(bookingId: string, reason?: string): Promise<void> {
  await apiPost(`/experiences/provider/bookings/${bookingId}/reject/`, { reason })
}
