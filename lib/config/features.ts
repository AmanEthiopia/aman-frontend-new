// Feature flags for controlled rollout
// These allow smooth demo control and team alignment
// Set to false to disable features in demo or production

export const FEATURES = {
  // AI Features - simulated in MVP, async-ready for backend
  AI_CONCIERGE: true, // Floating AI assistant (demo responses)
  AI_PLANNER: true, // Trip planner UI (simulated itineraries)

  // Payment & Commerce - disabled until Stripe integration
  PAYMENTS: false,

  // Business/Diplomat mode - premium tier
  BUSINESS_MODE: false,

  // Core platform features
  PROVIDER_PORTAL: true, // Host/provider dashboard
  MESSAGING: true, // In-app messaging UI
  REVIEWS: true, // Review system

  // Discovery categories
  TRANSPORT: true,
  EXPERIENCES: true,
  RESTAURANTS: true,
  GUIDES: true, // Tour guides, interpreters, drivers
  ATTRACTIONS: true, // Tourist attractions
} as const

export type FeatureFlag = keyof typeof FEATURES

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return FEATURES[feature]
}

// API endpoint placeholders for backend integration
// These will be replaced with actual Django REST endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",

  // Discovery
  HOTELS: "/api/hotels",
  RESTAURANTS: "/api/restaurants",
  TRANSPORT: "/api/transport",
  EXPERIENCES: "/api/experiences",
  GUIDES: "/api/guides",
  ATTRACTIONS: "/api/attractions",
  CITIES: "/api/cities",

  // Bookings
  BOOKINGS: "/api/bookings",
  BOOKING_REQUEST: "/api/bookings/request",

  // AI (async-ready)
  AI_QUERY: "/api/ai/query",
  AI_PLAN: "/api/ai/plan",

  // Provider
  PROVIDER_LISTINGS: "/api/provider/listings",
  PROVIDER_BOOKINGS: "/api/provider/bookings",
  PROVIDER_EARNINGS: "/api/provider/earnings",

  // Messaging
  CONVERSATIONS: "/api/messages/conversations",
  MESSAGES: "/api/messages",

  // Reviews
  REVIEWS: "/api/reviews",
} as const
