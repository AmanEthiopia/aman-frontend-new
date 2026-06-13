// Core Types for AMAN Platform

export interface City {
  id: string
  name: string
  nameAmharic: string
  description: string
  imageUrl: string
  hotelsCount: number
  restaurantsCount: number
  experiencesCount: number
}

export interface Hotel {
  id: string
  name: string
  provider_id?: string
  cityId: string
  city?: City
  description: string
  address: string
  area: string
  priceRange: "budget" | "mid-range" | "luxury"
  priceMin: number
  priceMax: number
  amenities: string[]
  safetyNotes: string
  isVerified: boolean
  isFeatured: boolean
  contactPhone: string
  contactEmail: string
  website?: string
  images: HotelImage[]
  rating: number
  reviewCount: number
  safetyScore: number
  // Trust Memory fields
  lastVerified?: string
  foreignTravelerCount?: number
  disputeFreeDays?: number
  // ── API (snake_case) fields, present when sourced from the backend ──────────
  slug?: string
  city_name?: string
  cover_photo?: string | null
  cover_photo_url?: string | null
  photos?: any[]
  price_range?: string
  price_min?: number
  price_max?: number
  is_verified?: boolean
  is_featured?: boolean
  review_count?: number
  average_rating?: number | string
  star_rating?: number
  category?: string
  latitude?: number | string | null
  longitude?: number | string | null
  distance_km?: number | null
}

export interface HotelImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  // API (snake_case) fields
  image_url?: string
  photo_url?: string
  alt_text?: string
  is_primary?: boolean
  hotel_id?: string
  display_order?: number
  created_at?: string
}

export interface Restaurant {
  id: string
  name: string
  slug: string
  provider_id?: string
  description?: string
  address?: string
  area?: string
  city_name?: string
  city?: { id: string; name: string; slug: string }
  cuisine_types?: string[]
  price_range?: string
  price_min?: number
  price_max?: number
  average_rating?: string | number
  review_count?: number
  cover_photo?: string
  cover_photo_url?: string
  is_verified?: boolean
  is_featured?: boolean
  is_active?: boolean
  accepts_reservations?: boolean
  has_wifi?: boolean
  has_parking?: boolean
  delivery_available?: boolean
  has_dine_in?: boolean
  has_takeaway?: boolean
  seating_capacity?: number
  opening_hours?: Record<string, string>
  phone?: string
  email?: string
  website?: string
  photos?: RestaurantImage[]
}

export interface RestaurantImage {
  id: string
  url?: string
  photo_url?: string
  alt?: string
  is_primary?: boolean
}

export interface Transport {
  id: string
  name: string
  type: "airport-pickup" | "driver" | "tour-vehicle" | "car-rental"
  cityId: string
  city?: City
  description: string
  priceRange: "budget" | "mid-range" | "luxury"
  pricePerDay?: number
  pricePerTrip?: number
  isVerified: boolean
  isFeatured: boolean
  contactPhone: string
  images: TransportImage[]
  rating: number
  reviewCount: number
  languages: string[]
  vehicleType?: string
  safetyScore: number
}

export interface TransportImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

export interface Experience {
  id: string
  name: string
  cityId: string
  city?: City
  description: string
  duration: string
  priceRange: "budget" | "mid-range" | "luxury"
  price: number
  category: "cultural" | "adventure" | "food" | "nature" | "historical"
  isVerified: boolean
  isFeatured: boolean
  contactPhone: string
  images: ExperienceImage[]
  rating: number
  reviewCount: number
  maxGroupSize: number
  included: string[]
  safetyScore: number
}

export interface ExperienceImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

export interface BookingRequest {
  id: string
  type: "hotel" | "restaurant" | "transport" | "experience"
  itemId: string
  itemName: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  checkInDate: string
  checkOutDate?: string
  numGuests: number
  message?: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
  totalPrice?: number
}

export interface Review {
  id: string
  type: "hotel" | "restaurant" | "transport" | "experience"
  itemId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  isVerifiedStay: boolean
  createdAt: string
  response?: {
    text: string
    createdAt: string
  }
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderType: "guest" | "provider" | "ai" | "support"
  senderName: string
  content: string
  attachments?: MessageAttachment[]
  createdAt: string
  isRead: boolean
}

export interface MessageAttachment {
  id: string
  type: "image" | "document"
  url: string
  name: string
}

export interface Conversation {
  id: string
  participants: ConversationParticipant[]
  lastMessage?: Message
  unreadCount: number
  bookingId?: string
  createdAt: string
}

export interface ConversationParticipant {
  id: string
  name: string
  avatar?: string
  type: "guest" | "provider" | "support"
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_email_verified: boolean
  is_phone_verified: boolean
  phone: string | null
  // Optional convenience/derived fields used in some UI contexts
  name?: string
  role?: string
}

export interface UserProfile {
  bio: string | null
  profile_photo: string | null
  date_of_birth: string | null
  gender: string | null
  nationality: string | null
  preferred_language: string
  preferred_currency: string
  timezone: string
  travel_style: string | null
  interests: string[] | null
  dietary_restrictions: string[] | null
  accessibility_needs: string[] | null
  dark_mode: boolean
  notif_email_bookings: boolean
  notif_email_messages: boolean
  notif_email_reviews: boolean
  notif_email_payments: boolean
  notif_email_marketing: boolean
  notif_push_bookings: boolean
  notif_push_messages: boolean
}

export interface UserRole {
  is_provider: boolean
  is_admin: boolean
  provider_flags: string[]
  admin_flags: string[]
  is_premium: boolean
}

export interface ProviderProfileInfo {
  business_name: string
  business_type: string
  registration_number: string | null
  tax_id: string | null
  business_address: string | null
  website: string | null
  support_email: string | null
}

export interface PayoutSettingsInfo {
  bank_name: string | null
  account_number: string | null
  account_holder_name: string | null
  payout_schedule: "weekly" | "biweekly" | "monthly"
}

export interface ProfileCompletionInfo {
  percentage: number
  is_complete: boolean
  missing: string[]
}

export interface CompleteUserProfile {
  user: User
  profile: UserProfile
  role: UserRole
  provider_profile: ProviderProfileInfo | null
  payout_settings: PayoutSettingsInfo | null
  profile_completion: ProfileCompletionInfo | null
}

export interface Provider {
  id: string
  userId: string
  businessName: string
  businessType: "hotel" | "restaurant" | "transport" | "experience"
  description: string
  isVerified: boolean
  verificationDate?: string
  totalBookings: number
  totalEarnings: number
  rating: number
  reviewCount: number
}

export interface TripPlan {
  id: string
  userId?: string
  name: string
  startDate: string
  endDate: string
  budget: number
  style: "budget" | "comfort" | "luxury"
  interests: string[]
  days: TripDay[]
  createdAt: string
}

export interface TripDay {
  date: string
  activities: TripActivity[]
}

export interface TripActivity {
  time: string
  type: "hotel" | "restaurant" | "transport" | "experience" | "free"
  itemId?: string
  itemName: string
  description: string
  estimatedCost?: number
}

// Trust recommendation type
export interface TrustRecommendation {
  verifiedRecently: boolean
  foreignTravelerCount: number
  priceWithinRange: boolean
  disputeFreeDays: number
}

export interface RoomUnit {
  id: string
  unit_number: string
  label?: string
  is_active: boolean
}

export interface Room {
  id: string
  hotel_id: string
  name: string
  description: string
  bed_type?: string
  bed_count?: number
  price_per_night?: number
  base_price?: string | number  // API returns "100.00" string
  max_guests?: number
  max_adults?: number
  max_children?: number
  room_size_sqm?: number
  amenities: string[]
  images?: RoomImage[]
  photos?: RoomImage[]
  is_available: boolean
  total_units?: number
  available_units?: number | null  // null = no dates; number = with dates; 0 = fully booked
  units?: RoomUnit[]
  gender_restriction?: "none" | "male_only" | "female_only"
}

export interface RoomImage {
  id: string
  url?: string
  photo_url?: string
  alt?: string
  is_primary?: boolean
}

export interface Booking {
  id: string
  hotel_id: string
  room_id?: string
  hotel_name: string
  room_name?: string
  check_in: string
  check_out: string
  guests: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  total_price?: number
  special_requests?: string
  created_at: string
  updated_at?: string
}

// Re-export provider types for convenience
export type {
  PropertyCategory,
  PropertyBase,
  PropertyPhoto,
  ProviderHotel,
  ProviderRoom,
  ProviderRestaurant,
  ProviderDriver,
  ProviderTrip,
  ProviderStats,
  ProviderBooking,
  CreateHotelPayload,
  CreateRoomPayload,
  CreateRestaurantPayload,
  CreateDriverPayload,
  CreateTripPayload,
  TripItineraryDay,
  DriverService,
  City as APICity,
  Attraction as APIAttraction,
} from "@/lib/api/provider"

// Re-export package types for experiences/packages
export type {
  Package,
  PackageDay,
  PackageDayItem,
  PackageCity,
  PackageCategory,
  PackageItemType,
} from "@/lib/api/experiences"

// Re-export itinerary types for personal trip planning
export type {
  Trip,
  TripSummary,
  ItineraryDay,
  ItineraryItem,
  TripStatus,
  TripTab,
  ItemType,
  ItemStatus,
} from "@/lib/api/itinerary"

// Re-export review types (Review is declared locally above)
export type {
  ReviewResponse,
  ReviewableType,
  ReviewsResponse,
} from "@/lib/api/reviews"

// Re-export messaging types (Conversation/Message are declared locally above)
export type {
  RelatedToType,
} from "@/lib/api/messages"

// Re-export verification types
export type {
  VerificationRequest,
  VerificationStatus,
  VerificationStatusInfo,
  EntityType as VerificationEntityType,
} from "@/lib/api/verification"
