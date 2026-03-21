"use client"

import { apiPost, apiGet, apiPatch, apiDelete } from "./client"

// ============================================================================
// Types
// ============================================================================

export type PackageCategory = "city_tour" | "multi_city" | "adventure" | "culture" | "food" | "nature" | "spiritual" | "historical"
export type PackageItemType = "hotel" | "restaurant" | "attraction" | "activity"

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

export interface PackagePhoto {
  id: string
  photo_url: string
  is_primary: boolean
  display_order: number
}

export interface PackageOrganizer {
  id: string
  name: string
  photo_url?: string
}

// Item linked entities
export interface LinkedHotel {
  id: string
  name: string
  nickname?: string
  slug: string
  star_rating: number
  address: string
  average_rating?: string
  cover_photo_url?: string
}

export interface LinkedRestaurant {
  id: string
  name: string
  nickname?: string
  slug: string
  cuisine_type?: string
  address: string
  average_rating?: string
  cover_photo_url?: string
}

export interface LinkedAttraction {
  id: string
  name: string
  nickname?: string
  slug: string
  category: string
  cover_photo_url?: string
}

export interface PackageDayItem {
  id: string
  item_type: PackageItemType
  order: number
  hotel?: LinkedHotel | null
  restaurant?: LinkedRestaurant | null
  attraction?: LinkedAttraction | null
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

// Package listing (summary)
export interface PackageSummary {
  id: string
  title: string
  nickname?: string
  slug: string
  category: PackageCategory
  duration_days: number
  price_per_person: string
  price_currency: string
  max_group_size: number
  average_rating: string
  review_count: number
  is_published: boolean
  primary_photo?: PackagePhoto
  cities: PackageCity[]
}

// Full package detail
export interface PackageDetail extends PackageSummary {
  short_description?: string
  description: string
  child_price?: string
  payment_required: boolean
  min_group_size: number
  min_age?: number
  meeting_point?: string
  languages: string[]
  what_included: string[]
  what_excluded: string[]
  what_to_bring: string[]
  cancellation_policy?: string
  organizer: PackageOrganizer
  days: PackageDay[]
  photos: PackagePhoto[]
}

// ============================================================================
// Public API (Browse Packages)
// ============================================================================

export interface ListPackagesParams {
  category?: PackageCategory
  city?: string
  min_days?: number
  max_days?: number
  price_min?: number
  price_max?: number
  search?: string
  sort?: "price_asc" | "price_desc" | "rating_desc" | "duration_asc" | "newest"
  page?: number
  page_size?: number
}

export async function getPackages(params?: ListPackagesParams): Promise<PackageSummary[]> {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.append("category", params.category)
  if (params?.city) searchParams.append("city", params.city)
  if (params?.min_days) searchParams.append("min_days", params.min_days.toString())
  if (params?.max_days) searchParams.append("max_days", params.max_days.toString())
  if (params?.price_min) searchParams.append("price_min", params.price_min.toString())
  if (params?.price_max) searchParams.append("price_max", params.price_max.toString())
  if (params?.search) searchParams.append("search", params.search)
  if (params?.sort) searchParams.append("sort", params.sort)
  if (params?.page) searchParams.append("page", params.page.toString())
  if (params?.page_size) searchParams.append("page_size", params.page_size.toString())
  
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const response = await apiGet<{ data: PackageSummary[] }>(`/experiences/${query}`)
  return response.data || []
}

export async function getPackageBySlug(slug: string): Promise<PackageDetail> {
  const response = await apiGet<{ data: PackageDetail }>(`/experiences/${slug}/`)
  return response.data
}

// ============================================================================
// Provider Package Management API
// ============================================================================

export interface CreatePackagePayload {
  title: string
  nickname?: string
  description: string
  short_description?: string
  category: PackageCategory
  duration_days: number
  price_per_person: string
  price_currency?: string
  child_price?: string
  payment_required?: boolean
  min_group_size?: number
  max_group_size?: number
  min_age?: number
  meeting_point?: string
  languages?: string[]
  what_included?: string[]
  what_excluded?: string[]
  what_to_bring?: string[]
  cancellation_policy?: string
}

export interface CreatePackageResponse {
  id: string
  slug: string
}

export async function createPackage(payload: CreatePackagePayload): Promise<CreatePackageResponse> {
  const response = await apiPost<{ data: CreatePackageResponse }>("/experiences/provider/", payload)
  return response.data
}

export async function getMyPackages(): Promise<PackageSummary[]> {
  const response = await apiGet<{ data: PackageSummary[] }>("/experiences/provider/")
  return response.data || []
}

export async function getMyPackageDetail(packageId: string): Promise<PackageDetail> {
  const response = await apiGet<{ data: PackageDetail }>(`/experiences/provider/${packageId}/`)
  return response.data
}

export async function updatePackage(packageId: string, payload: Partial<CreatePackagePayload>): Promise<PackageDetail> {
  const response = await apiPatch<{ data: PackageDetail }>(`/experiences/provider/${packageId}/`, payload)
  return response.data
}

export async function deletePackage(packageId: string): Promise<void> {
  await apiDelete(`/experiences/provider/${packageId}/`)
}

export async function publishPackage(packageId: string): Promise<{ is_published: boolean }> {
  const response = await apiPost<{ data: { is_published: boolean } }>(`/experiences/provider/${packageId}/publish/`, {})
  return response.data
}

// Package Cities
export interface AddPackageCityPayload {
  city_id: string
  order: number
  night_count: number
}

export async function getPackageCities(packageId: string): Promise<PackageCity[]> {
  const response = await apiGet<{ data: PackageCity[] }>(`/experiences/provider/${packageId}/cities/`)
  return response.data || []
}

export async function addPackageCity(packageId: string, payload: AddPackageCityPayload): Promise<PackageCity> {
  const response = await apiPost<{ data: PackageCity }>(`/experiences/provider/${packageId}/cities/`, payload)
  return response.data
}

export async function removePackageCity(packageId: string, cityEntryId: string): Promise<void> {
  await apiDelete(`/experiences/provider/${packageId}/cities/${cityEntryId}/`)
}

// Package Days
export interface AddPackageDayPayload {
  day_number: number
  title: string
  description?: string
  city_id?: string
}

export async function getPackageDays(packageId: string): Promise<PackageDay[]> {
  const response = await apiGet<{ data: PackageDay[] }>(`/experiences/provider/${packageId}/days/`)
  return response.data || []
}

export async function addPackageDay(packageId: string, payload: AddPackageDayPayload): Promise<PackageDay> {
  const response = await apiPost<{ data: PackageDay }>(`/experiences/provider/${packageId}/days/`, payload)
  return response.data
}

export async function updatePackageDay(packageId: string, dayId: string, payload: Partial<AddPackageDayPayload>): Promise<PackageDay> {
  const response = await apiPatch<{ data: PackageDay }>(`/experiences/provider/${packageId}/days/${dayId}/`, payload)
  return response.data
}

export async function deletePackageDay(packageId: string, dayId: string): Promise<void> {
  await apiDelete(`/experiences/provider/${packageId}/days/${dayId}/`)
}

// Package Day Items
export interface AddPackageItemPayload {
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

export async function getPackageDayItems(packageId: string, dayId: string): Promise<PackageDayItem[]> {
  const response = await apiGet<{ data: PackageDayItem[] }>(`/experiences/provider/${packageId}/days/${dayId}/items/`)
  return response.data || []
}

export async function addPackageDayItem(packageId: string, dayId: string, payload: AddPackageItemPayload): Promise<PackageDayItem> {
  const response = await apiPost<{ data: PackageDayItem }>(`/experiences/provider/${packageId}/days/${dayId}/items/`, payload)
  return response.data
}

export async function updatePackageDayItem(packageId: string, dayId: string, itemId: string, payload: Partial<AddPackageItemPayload>): Promise<PackageDayItem> {
  const response = await apiPatch<{ data: PackageDayItem }>(`/experiences/provider/${packageId}/days/${dayId}/items/${itemId}/`, payload)
  return response.data
}

export async function deletePackageDayItem(packageId: string, dayId: string, itemId: string): Promise<void> {
  await apiDelete(`/experiences/provider/${packageId}/days/${dayId}/items/${itemId}/`)
}
