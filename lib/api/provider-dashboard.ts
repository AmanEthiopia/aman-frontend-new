"use client"

import { apiGet, apiPost } from "./client"

// ============================================================================
// Provider Dashboard  GET /api/v1/provider/dashboard/
// ============================================================================

export interface DashboardStatValue {
  value: number
  vs_last_month_pct: number | null
}

export interface DashboardRevenueValue {
  value: number
  currency: string
  vs_last_month_pct: number | null
}

export interface DashboardAlert {
  pending_count: number
  message: string | null
}

export interface DashboardStats {
  pending_bookings: DashboardStatValue
  occupancy_rate: DashboardStatValue
  this_month_revenue: DashboardRevenueValue
  average_rating: DashboardStatValue
}

export interface DashboardPendingRequest {
  id: string
  booking_number: string
  booking_type: "hotel" | "restaurant" | "trip" | "guide" | "driver"
  guest_name: string
  guest_email: string
  guest_phone?: string
  property_id: string
  property_name: string
  check_in: string
  check_out: string | null
  guests: number
  num_nights: number | null
  total_price: number
  currency: string
  is_new: boolean
  created_at: string
}

export interface DashboardPerformance {
  response_rate: number
  occupancy_rate: number
  review_score: number
}

export interface DashboardReview {
  id: string
  reviewer_name: string
  rating: number
  title: string
  comment: string
  property_name: string
  reviewable_type: string
  reviewable_id: string
  has_response: boolean
  time_ago: string
  created_at: string
}

export interface DashboardTotals {
  total_properties: number
  confirmed_bookings: number
  total_bookings: number
  total_reviews: number
}

export interface DashboardVerification {
  total: number
  published: number
  unpublished: number
  verified: number
  unverified: number       // published but not yet verified
  pending_requests: number
}

export interface ProviderDashboardData {
  alert: DashboardAlert
  stats: DashboardStats
  pending_requests: DashboardPendingRequest[]
  performance: DashboardPerformance
  recent_reviews: DashboardReview[]
  totals: DashboardTotals
  verification?: DashboardVerification
}

export async function getProviderDashboard(): Promise<ProviderDashboardData> {
  return apiGet<ProviderDashboardData>("/provider/dashboard/")
}

// Confirm / reject per booking type
const CONFIRM_URLS: Record<DashboardPendingRequest["booking_type"], (id: string) => string> = {
  hotel:      (id) => `/bookings/provider/hotel/${id}/confirm/`,
  restaurant: (id) => `/bookings/provider/restaurant/${id}/confirm/`,
  trip:       (id) => `/experiences/provider/bookings/${id}/confirm/`,
  guide:      (id) => `/guides/provider/bookings/${id}/confirm/`,
  driver:     (id) => `/bookings/provider/driver/${id}/confirm/`,
}

const REJECT_URLS: Record<DashboardPendingRequest["booking_type"], (id: string) => string> = {
  hotel:      (id) => `/bookings/provider/hotel/${id}/reject/`,
  restaurant: (id) => `/bookings/provider/restaurant/${id}/reject/`,
  trip:       (id) => `/experiences/provider/bookings/${id}/reject/`,
  guide:      (id) => `/guides/provider/bookings/${id}/reject/`,
  driver:     (id) => `/bookings/provider/driver/${id}/reject/`,
}

export async function confirmDashboardBooking(id: string, type: DashboardPendingRequest["booking_type"]): Promise<void> {
  await apiPost(CONFIRM_URLS[type](id), {})
}

export async function rejectDashboardBooking(id: string, type: DashboardPendingRequest["booking_type"], reason?: string): Promise<void> {
  await apiPost(REJECT_URLS[type](id), { reason })
}

// ============================================================================
// Provider Earnings  GET /api/v1/provider/earnings/
// ============================================================================

export type EarningsPeriod = "this_month" | "last_month" | "last_3_months" | "last_6_months" | "this_year" | "custom"
export type EarningsType = "all" | "booking" | "service_fee"

export interface EarningsMetricValue {
  value: number
  vs_last_period_pct: number | null
}

export interface EarningsMetricRevenue {
  value: number
  currency: string
  vs_last_period_pct: number | null
}

export interface EarningsMetrics {
  total_revenue: EarningsMetricRevenue
  /** Gross collected directly by the provider from guests */
  gross_revenue?: EarningsMetricRevenue
  /** Commission the provider owes Algalle (e.g. 10%) */
  commission_owed?: EarningsMetricRevenue
  /** What the provider keeps after commission */
  net_earnings?: EarningsMetricRevenue
  total_bookings: EarningsMetricValue
  avg_nightly_rate: EarningsMetricRevenue
  occupancy_rate: EarningsMetricValue
}

export interface EarningsTransaction {
  id: string
  type: "booking" | "service_fee"
  description: string
  property_name: string
  date: string
  amount: number
  is_credit: boolean
  status?: string
}

export interface ProviderEarningsData {
  period: string
  period_start: string
  period_end: string
  /** Commission percentage Algalle charges (e.g. 10) */
  commission_pct?: number
  metrics: EarningsMetrics
  transactions: EarningsTransaction[]
}

export async function getNewProviderEarnings(params?: {
  period?: EarningsPeriod
  type?: EarningsType
  page?: number
  page_size?: number
  date_from?: string
  date_to?: string
}): Promise<ProviderEarningsData> {
  const p = new URLSearchParams()
  if (params?.period) p.append("period", params.period)
  if (params?.type) p.append("type", params.type)
  if (params?.page) p.append("page", params.page.toString())
  if (params?.page_size) p.append("page_size", params.page_size.toString())
  if (params?.date_from) p.append("date_from", params.date_from)
  if (params?.date_to) p.append("date_to", params.date_to)
  const query = p.toString() ? `?${p.toString()}` : ""
  return apiGet<ProviderEarningsData>(`/provider/earnings/${query}`)
}
