import type { Review } from "@/lib/types"

export const mockReviews: Review[] = [
  {
    id: "rev-1",
    type: "hotel",
    itemId: "hotel-1",
    userName: "Jennifer Miller",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comment:
      "Exceptional stay! The staff went above and beyond to make our anniversary special. The gardens are stunning and the Ethiopian coffee at breakfast is the best I've ever had.",
    isVerifiedStay: true,
    createdAt: "2025-01-05T12:00:00Z",
    response: {
      text: "Thank you so much for your kind words, Jennifer! We were honored to be part of your anniversary celebration. We hope to welcome you back soon!",
      createdAt: "2025-01-06T09:30:00Z",
    },
  },
  {
    id: "rev-2",
    type: "hotel",
    itemId: "hotel-1",
    userName: "Robert Anderson",
    rating: 4,
    comment:
      "Great location and excellent service. The pool area is beautiful. Only minor issue was slow WiFi in my room, but staff quickly helped resolve it.",
    isVerifiedStay: true,
    createdAt: "2025-01-02T15:30:00Z",
  },
  {
    id: "rev-3",
    type: "hotel",
    itemId: "hotel-4",
    userName: "Lisa Thompson",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comment:
      "Paradise on Lake Tana! The sunset views from our room were incredible. The boat tour to the monasteries arranged by the hotel was the highlight of our Ethiopia trip.",
    isVerifiedStay: true,
    createdAt: "2024-12-28T10:15:00Z",
  },
  {
    id: "rev-4",
    type: "experience",
    itemId: "exp-5",
    userName: "Marcus Weber",
    rating: 5,
    comment:
      "Our guide Alemayehu was incredibly knowledgeable. Starting early meant we had the churches almost to ourselves. A spiritual and historical experience I'll never forget.",
    isVerifiedStay: true,
    createdAt: "2025-01-04T18:45:00Z",
  },
  {
    id: "rev-5",
    type: "restaurant",
    itemId: "rest-1",
    userName: "Priya Sharma",
    rating: 5,
    comment:
      "The cultural show was amazing! Traditional dancers and musicians while enjoying authentic injera and doro wat. A must-visit in Addis Ababa.",
    isVerifiedStay: true,
    createdAt: "2024-12-30T21:00:00Z",
  },
  {
    id: "rev-6",
    type: "transport",
    itemId: "trans-1",
    userName: "James Wilson",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comment:
      "Getachew was waiting at arrivals with a sign. Clean car, knew the city well, and gave great recommendations. Already booked him for our departure too!",
    isVerifiedStay: true,
    createdAt: "2025-01-01T08:30:00Z",
  },
]

export function getReviewsByItem(type: Review["type"], itemId: string): Review[] {
  return mockReviews.filter((r) => r.type === type && r.itemId === itemId)
}

export function getRecentReviews(limit = 5): Review[] {
  return [...mockReviews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}
