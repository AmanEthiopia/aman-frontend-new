export const FEATURES = {
  AI_CONCIERGE: false,
  AI_PLANNER: true,

  PAYMENTS: false,
  BUSINESS_MODE: false,

  PROVIDER_PORTAL: true,
  MESSAGING: true,
  REVIEWS: true,

  TRANSPORT: true,
  EXPERIENCES: true,
  RESTAURANTS: true,
  GUIDES: true,
  ATTRACTIONS: true,

  ITINERARY: true,
} as const

export type FeatureFlag = keyof typeof FEATURES

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return FEATURES[feature]
}
