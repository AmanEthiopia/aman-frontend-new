import type { Restaurant } from "@/lib/types"
import { mockCities } from "./cities"

export const mockRestaurants: Restaurant[] = [
  {
    id: "rest-1",
    name: "Yod Abyssinia",
    cityId: "city-1",
    city: mockCities[0],
    description:
      "Award-winning cultural restaurant featuring traditional Ethiopian cuisine, live music, and dance performances nightly.",
    address: "Bole Road, Addis Ababa",
    area: "Bole",
    cuisineTypes: ["Ethiopian Traditional", "Vegetarian Friendly"],
    priceRange: "mid-range",
    priceMin: 15,
    priceMax: 40,
    amenities: ["Live Music", "Cultural Shows", "Group Seating", "Vegetarian Options", "Private Events"],
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 11 661 2985",
    images: [{ id: "img-r1", url: "/ethiopian-restaurant-traditional-interior-injera.jpg", alt: "Yod Abyssinia Interior", isPrimary: true }],
    rating: 4.7,
    reviewCount: 456,
    openingHours: "11:00 AM - 11:00 PM",
    safetyScore: 96,
  },
  {
    id: "rest-2",
    name: "Tomoca Coffee",
    cityId: "city-1",
    city: mockCities[0],
    description: "Legendary coffee house since 1953, serving Ethiopia's finest Arabica coffee in a historic setting.",
    address: "Piazza, Churchill Avenue",
    area: "Piazza",
    cuisineTypes: ["Coffee", "Cafe", "Ethiopian Pastries"],
    priceRange: "budget",
    priceMin: 2,
    priceMax: 8,
    amenities: ["Historic Setting", "Fresh Roasted Coffee", "Takeaway"],
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 11 111 2233",
    images: [{ id: "img-r2", url: "/placeholder.svg?height=400&width=600", alt: "Tomoca Coffee", isPrimary: true }],
    rating: 4.8,
    reviewCount: 892,
    openingHours: "6:00 AM - 8:00 PM",
    safetyScore: 94,
  },
  {
    id: "rest-3",
    name: "Sishu Restaurant",
    cityId: "city-1",
    city: mockCities[0],
    description: "Upscale Ethiopian fusion restaurant combining traditional flavors with modern culinary techniques.",
    address: "Kazanchis, Near Hilton",
    area: "Kazanchis",
    cuisineTypes: ["Ethiopian Fusion", "Fine Dining", "International"],
    priceRange: "luxury",
    priceMin: 30,
    priceMax: 80,
    amenities: ["Fine Dining", "Wine Selection", "Private Dining", "Outdoor Terrace"],
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 11 515 9999",
    images: [{ id: "img-r3", url: "/placeholder.svg?height=400&width=600", alt: "Sishu Restaurant", isPrimary: true }],
    rating: 4.6,
    reviewCount: 234,
    openingHours: "12:00 PM - 10:30 PM",
    safetyScore: 98,
  },
  {
    id: "rest-4",
    name: "Desset Fish Market",
    cityId: "city-2",
    city: mockCities[1],
    description:
      "Fresh fish straight from Lake Tana, grilled to perfection. A Bahir Dar institution for seafood lovers.",
    address: "Lake Shore Road",
    area: "Lakefront",
    cuisineTypes: ["Seafood", "Ethiopian", "Grilled Fish"],
    priceRange: "budget",
    priceMin: 8,
    priceMax: 25,
    amenities: ["Lake Views", "Fresh Daily Catch", "Outdoor Seating"],
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 58 220 4444",
    images: [
      { id: "img-r4", url: "/placeholder.svg?height=400&width=600", alt: "Desset Fish Market", isPrimary: true },
    ],
    rating: 4.5,
    reviewCount: 178,
    openingHours: "10:00 AM - 9:00 PM",
    safetyScore: 90,
  },
  {
    id: "rest-5",
    name: "Four Sisters Restaurant",
    cityId: "city-3",
    city: mockCities[2],
    description:
      "Family-run restaurant famous for authentic Gondar cuisine, including the region's special tibs and kitfo.",
    address: "Royal Enclosure Road",
    area: "Castle District",
    cuisineTypes: ["Ethiopian Traditional", "Gondar Specialties"],
    priceRange: "mid-range",
    priceMin: 10,
    priceMax: 30,
    amenities: ["Traditional Setting", "Family Recipes", "Garden Seating"],
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 58 111 5555",
    images: [
      { id: "img-r5", url: "/placeholder.svg?height=400&width=600", alt: "Four Sisters Restaurant", isPrimary: true },
    ],
    rating: 4.6,
    reviewCount: 145,
    openingHours: "11:00 AM - 10:00 PM",
    safetyScore: 92,
  },
  {
    id: "rest-6",
    name: "Ben Abeba",
    cityId: "city-4",
    city: mockCities[3],
    description:
      "Architecturally stunning restaurant with panoramic views of Lalibela's landscape. Scottish-Ethiopian fusion cuisine.",
    address: "Above Lalibela Town",
    area: "Hilltop",
    cuisineTypes: ["Fusion", "Ethiopian", "International"],
    priceRange: "mid-range",
    priceMin: 15,
    priceMax: 45,
    amenities: ["Panoramic Views", "Unique Architecture", "Sunset Dining"],
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 33 336 1111",
    images: [
      { id: "img-r6", url: "/placeholder.svg?height=400&width=600", alt: "Ben Abeba Restaurant", isPrimary: true },
    ],
    rating: 4.8,
    reviewCount: 267,
    openingHours: "8:00 AM - 9:00 PM",
    safetyScore: 94,
  },
]

export function getRestaurantById(id: string): Restaurant | undefined {
  return mockRestaurants.find((r) => r.id === id)
}

export function getRestaurantsByCity(cityId: string): Restaurant[] {
  return mockRestaurants.filter((r) => r.cityId === cityId)
}

export function searchRestaurants(params: {
  city?: string
  priceRange?: string
  cuisine?: string
  search?: string
}): Restaurant[] {
  let results = [...mockRestaurants]

  if (params.city && params.city !== "all") {
    results = results.filter((r) => r.city?.name.toLowerCase() === params.city?.toLowerCase())
  }

  if (params.priceRange && params.priceRange !== "all") {
    results = results.filter((r) => r.priceRange === params.priceRange)
  }

  if (params.cuisine && params.cuisine !== "all") {
    results = results.filter((r) => r.cuisineTypes.some((c) => c.toLowerCase().includes(params.cuisine!.toLowerCase())))
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase()
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.cuisineTypes.some((c) => c.toLowerCase().includes(searchLower)),
    )
  }

  return results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
}
