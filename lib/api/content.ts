import { apiGet, apiPost } from "./client"

export interface City {
  id: string
  name: string
  nickname: string | null  // Amharic name e.g., "አዲስ አበባ"
  slug: string
  country: string
  short_description: string
  cover_photo_url: string
  is_popular: boolean
  display_order: number
  // Dynamic counts from backend
  hotels_count: number
  restaurants_count: number
  experiences_count: number
}

export interface CityDetail extends City {
  description: string
  latitude: number
  longitude: number
  timezone: string
  meta_title: string
  meta_description: string
  attractions_count: number
  safety_info_summary: {
    total: number
    levels: {
      safe: number
      caution: number
    }
  }
}

export interface Attraction {
  id: string
  name: string
  slug: string
  category: string
  description: string
  city: string
  city_name: string
  photo_url: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  opening_hours: string | null
  entry_fee: string | null
  tips: string[]
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface SafetyInfo {
  id: string
  city: string
  area_name: string
  safety_level: string
  title: string
  description: string
  tips: string[]
  emergency_numbers: string[]
  created_at: string
  updated_at: string
}

export interface CulturalGuide {
  id: string
  title: string
  slug: string
  category: string
  content: string
  icon: string
  display_order: number
  is_published: boolean
}

export interface ScamWarning {
  id: string
  title: string
  description: string
  prevention_tips: string[]
  severity: string
  category: string
  is_active: boolean
}

export interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  display_order: number
  view_count: number
  is_published: boolean
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  cover_image_url: string | null
  author_name: string
  published_at: string | null
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: string
  effective_date: string
  created_at: string
  updated_at: string
}

/**
 * List cities
 */
export async function getCities(params?: { is_popular?: boolean; search?: string }): Promise<City[]> {
  const query = new URLSearchParams()
  if (params?.is_popular !== undefined) query.append("is_popular", String(params.is_popular))
  if (params?.search) query.append("search", params.search)

  return apiGet<City[]>(`/content/cities/${query.toString() ? `?${query}` : ""}`)
}

/**
 * Create a new city (for providers adding hotels in unlisted cities)
 */
export interface CreateCityPayload {
  name: string
  nickname?: string // Amharic name
  country?: string
  short_description?: string
}

export async function createCity(payload: CreateCityPayload): Promise<City> {
  return apiPost<City>("/content/cities/", {
    ...payload,
    country: payload.country || "Ethiopia",
  })
}

/**
 * Get city detail by slug
 */
export async function getCityDetail(slug: string): Promise<CityDetail> {
  return apiGet<CityDetail>(`/content/cities/${slug}/`)
}

/**
 * List attractions
 */
export async function getAttractions(params?: { city?: string; category?: string }): Promise<Attraction[]> {
  const query = new URLSearchParams()
  if (params?.city) query.append("city", params.city)
  if (params?.category) query.append("category", params.category)

  return apiGet<Attraction[]>(`/content/attractions/${query.toString() ? `?${query}` : ""}`)
}

/**
 * List safety information
 */
export async function getSafetyInfo(params?: { city?: string; safety_level?: string }): Promise<SafetyInfo[]> {
  const query = new URLSearchParams()
  if (params?.city) query.append("city", params.city)
  if (params?.safety_level) query.append("safety_level", params.safety_level)

  return apiGet<SafetyInfo[]>(`/content/safety/${query.toString() ? `?${query}` : ""}`)
}

/**
 * List cultural guides
 */
export async function getCulturalGuides(params?: { category?: string }): Promise<CulturalGuide[]> {
  const query = new URLSearchParams()
  if (params?.category) query.append("category", params.category)

  return apiGet<CulturalGuide[]>(`/content/cultural-guides/${query.toString() ? `?${query}` : ""}`)
}

/**
 * List scam warnings
 */
export async function getScamWarnings(params?: { severity?: string; category?: string }): Promise<ScamWarning[]> {
  const query = new URLSearchParams()
  if (params?.severity) query.append("severity", params.severity)
  if (params?.category) query.append("category", params.category)

  return apiGet<ScamWarning[]>(`/content/scam-warnings/${query.toString() ? `?${query}` : ""}`)
}

/**
 * List FAQs
 */
export async function getFAQs(params?: { category?: string }): Promise<FAQ[]> {
  const query = new URLSearchParams()
  if (params?.category) query.append("category", params.category)

  return apiGet<FAQ[]>(`/content/faqs/${query.toString() ? `?${query}` : ""}`)
}

/**
 * Get FAQ detail
 */
export async function getFAQDetail(faqId: string): Promise<FAQ> {
  return apiGet<FAQ>(`/content/faqs/${faqId}/`)
}

/**
 * List blog posts
 */
export async function getBlogPosts(params?: { category?: string; search?: string }): Promise<BlogPost[]> {
  const query = new URLSearchParams()
  if (params?.category) query.append("category", params.category)
  if (params?.search) query.append("search", params.search)

  return apiGet<BlogPost[]>(`/content/blog/${query.toString() ? `?${query}` : ""}`)
}

/**
 * Get blog post detail by slug
 */
export async function getBlogPostDetail(slug: string): Promise<BlogPost> {
  return apiGet<BlogPost>(`/content/blog/${slug}/`)
}

/**
 * List exchange rates
 */
export async function getExchangeRates(params?: { 
  from_currency?: string
  to_currency?: string
  effective_date?: string 
}): Promise<ExchangeRate[]> {
  const query = new URLSearchParams()
  if (params?.from_currency) query.append("from_currency", params.from_currency)
  if (params?.to_currency) query.append("to_currency", params.to_currency)
  if (params?.effective_date) query.append("effective_date", params.effective_date)

  return apiGet<ExchangeRate[]>(`/content/exchange-rates/${query.toString() ? `?${query}` : ""}`)
}

/**
 * Get attraction detail by slug
 */
export async function getAttractionDetail(slug: string): Promise<Attraction> {
  return apiGet<Attraction>(`/content/attractions/${slug}/`)
}

/**
 * Get cultural guide detail by slug
 */
export async function getCulturalGuideDetail(slug: string): Promise<CulturalGuide> {
  return apiGet<CulturalGuide>(`/content/cultural-guides/${slug}/`)
}

/**
 * Get scam warning detail by ID
 */
export async function getScamWarningDetail(warningId: string): Promise<ScamWarning> {
  return apiGet<ScamWarning>(`/content/scam-warnings/${warningId}/`)
}
