import type { Experience } from "@/lib/types"
import { mockCities } from "./cities"

export const mockExperiences: Experience[] = [
  {
    id: "exp-1",
    name: "Traditional Coffee Ceremony",
    cityId: "city-1",
    city: mockCities[0],
    description:
      "Experience the authentic Ethiopian coffee ceremony in a traditional home. Learn about coffee's Ethiopian origins while enjoying three rounds of freshly roasted coffee.",
    duration: "2 hours",
    priceRange: "budget",
    price: 25,
    category: "cultural",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 91 555 1234",
    images: [{ id: "img-e1", url: "/placeholder.svg?height=400&width=600", alt: "Coffee Ceremony", isPrimary: true }],
    rating: 4.9,
    reviewCount: 312,
    maxGroupSize: 8,
    included: ["Three rounds of coffee", "Traditional snacks", "Cultural explanation", "Photo opportunities"],
    safetyScore: 98,
  },
  {
    id: "exp-2",
    name: "Addis Ababa Food Tour",
    cityId: "city-1",
    city: mockCities[0],
    description:
      "Explore Addis Ababa's culinary scene with a local food expert. Visit hidden gems, street food vendors, and traditional restaurants.",
    duration: "4 hours",
    priceRange: "mid-range",
    price: 65,
    category: "food",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 91 666 7890",
    images: [{ id: "img-e2", url: "/placeholder.svg?height=400&width=600", alt: "Food Tour", isPrimary: true }],
    rating: 4.8,
    reviewCount: 189,
    maxGroupSize: 6,
    included: ["6+ food tastings", "Local guide", "Market visit", "Recipe booklet"],
    safetyScore: 94,
  },
  {
    id: "exp-3",
    name: "Blue Nile Falls Day Trip",
    cityId: "city-2",
    city: mockCities[1],
    description:
      "Visit the spectacular 'Smoking Waters' of the Blue Nile Falls. Includes scenic boat ride and hike through rural villages.",
    duration: "6 hours",
    priceRange: "mid-range",
    price: 85,
    category: "nature",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 58 220 7777",
    images: [{ id: "img-e3", url: "/placeholder.svg?height=400&width=600", alt: "Blue Nile Falls", isPrimary: true }],
    rating: 4.7,
    reviewCount: 234,
    maxGroupSize: 10,
    included: ["Transport", "Guide", "Boat crossing", "Entrance fees", "Lunch"],
    safetyScore: 90,
  },
  {
    id: "exp-4",
    name: "Lake Tana Monastery Tour",
    cityId: "city-2",
    city: mockCities[1],
    description:
      "Discover ancient island monasteries on Lake Tana. Visit centuries-old churches with stunning murals and religious artifacts.",
    duration: "5 hours",
    priceRange: "mid-range",
    price: 75,
    category: "historical",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 58 220 6666",
    images: [{ id: "img-e4", url: "/placeholder.svg?height=400&width=600", alt: "Island Monastery", isPrimary: true }],
    rating: 4.8,
    reviewCount: 167,
    maxGroupSize: 8,
    included: ["Boat transport", "Guide", "Monastery entrance fees", "Coffee break"],
    safetyScore: 92,
  },
  {
    id: "exp-5",
    name: "Lalibela Rock Churches Guided Tour",
    cityId: "city-4",
    city: mockCities[3],
    description:
      "Expert-guided tour of all 11 rock-hewn churches of Lalibela. Early morning start to avoid crowds and capture the best light.",
    duration: "8 hours",
    priceRange: "mid-range",
    price: 95,
    category: "historical",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 33 336 2222",
    images: [{ id: "img-e5", url: "/placeholder.svg?height=400&width=600", alt: "Lalibela Churches", isPrimary: true }],
    rating: 4.9,
    reviewCount: 456,
    maxGroupSize: 6,
    included: ["Expert guide", "Church entrance fees", "Lunch", "Hotel pickup"],
    safetyScore: 96,
  },
  {
    id: "exp-6",
    name: "Simien Mountains Trek",
    cityId: "city-3",
    city: mockCities[2],
    description:
      "One-day trek in the Simien Mountains National Park. See endemic Gelada baboons, dramatic escarpments, and stunning views.",
    duration: "10 hours",
    priceRange: "luxury",
    price: 150,
    category: "adventure",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 58 111 8888",
    images: [{ id: "img-e6", url: "/placeholder.svg?height=400&width=600", alt: "Simien Mountains", isPrimary: true }],
    rating: 4.9,
    reviewCount: 178,
    maxGroupSize: 8,
    included: ["Transport", "Scout", "Guide", "Park fees", "Packed lunch", "Walking poles"],
    safetyScore: 88,
  },
  {
    id: "exp-7",
    name: "Hyena Feeding Harar",
    cityId: "city-8",
    city: mockCities[7],
    description:
      "Witness the famous hyena men of Harar feed wild spotted hyenas by hand. A unique tradition passed down through generations.",
    duration: "1.5 hours",
    priceRange: "budget",
    price: 30,
    category: "cultural",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 25 666 3333",
    images: [{ id: "img-e7", url: "/placeholder.svg?height=400&width=600", alt: "Hyena Feeding", isPrimary: true }],
    rating: 4.6,
    reviewCount: 289,
    maxGroupSize: 15,
    included: ["Local guide", "Hyena man fee", "Photo opportunities"],
    safetyScore: 85,
  },
]

export function getExperienceById(id: string): Experience | undefined {
  return mockExperiences.find((e) => e.id === id)
}

export function getExperiencesByCity(cityId: string): Experience[] {
  return mockExperiences.filter((e) => e.cityId === cityId)
}

export function searchExperiences(params: {
  city?: string
  category?: string
  priceRange?: string
  search?: string
}): Experience[] {
  let results = [...mockExperiences]

  if (params.city && params.city !== "all") {
    results = results.filter((e) => e.city?.name.toLowerCase() === params.city?.toLowerCase())
  }

  if (params.category && params.category !== "all") {
    results = results.filter((e) => e.category === params.category)
  }

  if (params.priceRange && params.priceRange !== "all") {
    results = results.filter((e) => e.priceRange === params.priceRange)
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase()
    results = results.filter(
      (e) => e.name.toLowerCase().includes(searchLower) || e.description.toLowerCase().includes(searchLower),
    )
  }

  return results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
}
