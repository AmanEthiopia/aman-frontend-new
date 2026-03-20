import type { Transport } from "@/lib/types"
import { mockCities } from "./cities"

export const mockTransport: Transport[] = [
  {
    id: "trans-1",
    name: "Getachew - Airport Transfer Specialist",
    type: "airport-pickup",
    cityId: "city-1",
    city: mockCities[0],
    description:
      "Professional airport pickup and drop-off service. Clean, air-conditioned vehicles with meet & greet at arrivals.",
    priceRange: "mid-range",
    pricePerTrip: 35,
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 91 234 5678",
    images: [
      { id: "img-t1", url: "/placeholder.svg?height=400&width=600", alt: "Airport Transfer Vehicle", isPrimary: true },
    ],
    rating: 4.9,
    reviewCount: 234,
    languages: ["English", "Amharic", "French"],
    vehicleType: "Toyota Land Cruiser",
    safetyScore: 98,
  },
  {
    id: "trans-2",
    name: "Solomon - Personal Driver",
    type: "driver",
    cityId: "city-1",
    city: mockCities[0],
    description:
      "Experienced personal driver for city tours, business meetings, and day trips. 15 years of experience with foreign visitors.",
    priceRange: "mid-range",
    pricePerDay: 80,
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 91 876 5432",
    images: [{ id: "img-t2", url: "/placeholder.svg?height=400&width=600", alt: "Solomon's Vehicle", isPrimary: true }],
    rating: 4.8,
    reviewCount: 156,
    languages: ["English", "Amharic", "Italian"],
    vehicleType: "Toyota Corolla",
    safetyScore: 96,
  },
  {
    id: "trans-3",
    name: "Historical Route Tours",
    type: "tour-vehicle",
    cityId: "city-1",
    city: mockCities[0],
    description:
      "Multi-day tour vehicle service for the Northern Historic Route. Comfortable 4x4 with experienced guide-driver.",
    priceRange: "luxury",
    pricePerDay: 180,
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 11 551 2020",
    images: [{ id: "img-t3", url: "/placeholder.svg?height=400&width=600", alt: "Tour Vehicle", isPrimary: true }],
    rating: 4.9,
    reviewCount: 89,
    languages: ["English", "Amharic", "German"],
    vehicleType: "Toyota Land Cruiser 4x4",
    safetyScore: 98,
  },
  {
    id: "trans-4",
    name: "Lake Tana Boat Tours",
    type: "tour-vehicle",
    cityId: "city-2",
    city: mockCities[1],
    description:
      "Traditional tankwa and motorboat tours of Lake Tana's island monasteries. Half-day and full-day options available.",
    priceRange: "mid-range",
    pricePerTrip: 60,
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 58 220 8888",
    images: [{ id: "img-t4", url: "/placeholder.svg?height=400&width=600", alt: "Lake Tana Boat", isPrimary: true }],
    rating: 4.7,
    reviewCount: 178,
    languages: ["English", "Amharic"],
    vehicleType: "Traditional Tankwa Boat",
    safetyScore: 92,
  },
  {
    id: "trans-5",
    name: "Addis Car Rental",
    type: "car-rental",
    cityId: "city-1",
    city: mockCities[0],
    description:
      "Self-drive car rental with GPS, insurance, and 24/7 roadside assistance. Perfect for independent travelers.",
    priceRange: "mid-range",
    pricePerDay: 65,
    isVerified: true,
    isFeatured: false,
    contactPhone: "+251 11 661 9999",
    images: [{ id: "img-t5", url: "/placeholder.svg?height=400&width=600", alt: "Rental Cars", isPrimary: true }],
    rating: 4.4,
    reviewCount: 67,
    languages: ["English", "Amharic"],
    vehicleType: "Various - Sedan to SUV",
    safetyScore: 90,
  },
]

export function getTransportById(id: string): Transport | undefined {
  return mockTransport.find((t) => t.id === id)
}

export function getTransportByCity(cityId: string): Transport[] {
  return mockTransport.filter((t) => t.cityId === cityId)
}

export function searchTransport(params: {
  city?: string
  type?: string
  search?: string
}): Transport[] {
  let results = [...mockTransport]

  if (params.city && params.city !== "all") {
    results = results.filter((t) => t.city?.name.toLowerCase() === params.city?.toLowerCase())
  }

  if (params.type && params.type !== "all") {
    results = results.filter((t) => t.type === params.type)
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase()
    results = results.filter(
      (t) => t.name.toLowerCase().includes(searchLower) || t.description.toLowerCase().includes(searchLower),
    )
  }

  return results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
}
