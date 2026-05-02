import type { Restaurant } from "@/lib/types"

export const mockRestaurants: Restaurant[] = [
  {
    id: "rest-1",
    name: "Yod Abyssinia",
    slug: "yod-abyssinia",
    city: { id: "city-1", name: "Addis Ababa", slug: "addis-ababa" },
    city_name: "Addis Ababa",
    description:
      "Award-winning cultural restaurant featuring traditional Ethiopian cuisine, live music, and dance performances nightly.",
    address: "Bole Road, Addis Ababa",
    area: "Bole",
    cuisine_types: ["Ethiopian Traditional", "Vegetarian Friendly"],
    price_range: "moderate",
    price_min: 15,
    price_max: 40,
    is_verified: true,
    is_featured: true,
    phone: "+251 11 661 2985",
    photos: [{ id: "img-r1", url: "/ethiopian-restaurant-traditional-interior-injera.jpg", alt: "Yod Abyssinia Interior", is_primary: true }],
    average_rating: 4.7,
    review_count: 456,
  },
  {
    id: "rest-2",
    name: "Tomoca Coffee",
    slug: "tomoca-coffee",
    city: { id: "city-1", name: "Addis Ababa", slug: "addis-ababa" },
    city_name: "Addis Ababa",
    description: "Legendary coffee house since 1953, serving Ethiopia's finest Arabica coffee in a historic setting.",
    address: "Piazza, Churchill Avenue",
    area: "Piazza",
    cuisine_types: ["Coffee", "Cafe", "Ethiopian Pastries"],
    price_range: "budget",
    price_min: 2,
    price_max: 8,
    is_verified: true,
    is_featured: true,
    phone: "+251 11 111 2233",
    photos: [{ id: "img-r2", url: "/placeholder.svg?height=400&width=600", alt: "Tomoca Coffee", is_primary: true }],
    average_rating: 4.8,
    review_count: 892,
  },
  {
    id: "rest-3",
    name: "Sishu Restaurant",
    slug: "sishu-restaurant",
    city: { id: "city-1", name: "Addis Ababa", slug: "addis-ababa" },
    city_name: "Addis Ababa",
    description: "Upscale Ethiopian fusion restaurant combining traditional flavors with modern culinary techniques.",
    address: "Kazanchis, Near Hilton",
    area: "Kazanchis",
    cuisine_types: ["Ethiopian Fusion", "Fine Dining", "International"],
    price_range: "fine_dining",
    price_min: 30,
    price_max: 80,
    is_verified: true,
    is_featured: true,
    phone: "+251 11 515 9999",
    photos: [{ id: "img-r3", url: "/placeholder.svg?height=400&width=600", alt: "Sishu Restaurant", is_primary: true }],
    average_rating: 4.6,
    review_count: 234,
  },
  {
    id: "rest-4",
    name: "Desset Fish Market",
    slug: "desset-fish-market",
    city: { id: "city-2", name: "Bahir Dar", slug: "bahir-dar" },
    city_name: "Bahir Dar",
    description:
      "Fresh fish straight from Lake Tana, grilled to perfection. A Bahir Dar institution for seafood lovers.",
    address: "Lake Shore Road",
    area: "Lakefront",
    cuisine_types: ["Seafood", "Ethiopian", "Grilled Fish"],
    price_range: "budget",
    price_min: 8,
    price_max: 25,
    is_verified: true,
    is_featured: true,
    phone: "+251 58 220 4444",
    photos: [{ id: "img-r4", url: "/placeholder.svg?height=400&width=600", alt: "Desset Fish Market", is_primary: true }],
    average_rating: 4.5,
    review_count: 178,
  },
  {
    id: "rest-5",
    name: "Four Sisters Restaurant",
    slug: "four-sisters-restaurant",
    city: { id: "city-3", name: "Gondar", slug: "gondar" },
    city_name: "Gondar",
    description:
      "Family-run restaurant famous for authentic Gondar cuisine, including the region's special tibs and kitfo.",
    address: "Royal Enclosure Road",
    area: "Castle District",
    cuisine_types: ["Ethiopian Traditional", "Gondar Specialties"],
    price_range: "moderate",
    price_min: 10,
    price_max: 30,
    is_verified: true,
    is_featured: true,
    phone: "+251 58 111 5555",
    photos: [{ id: "img-r5", url: "/placeholder.svg?height=400&width=600", alt: "Four Sisters Restaurant", is_primary: true }],
    average_rating: 4.6,
    review_count: 145,
  },
  {
    id: "rest-6",
    name: "Ben Abeba",
    slug: "ben-abeba",
    city: { id: "city-4", name: "Lalibela", slug: "lalibela" },
    city_name: "Lalibela",
    description:
      "Architecturally stunning restaurant with panoramic views of Lalibela's landscape. Scottish-Ethiopian fusion cuisine.",
    address: "Above Lalibela Town",
    area: "Hilltop",
    cuisine_types: ["Fusion", "Ethiopian", "International"],
    price_range: "moderate",
    price_min: 15,
    price_max: 45,
    is_verified: true,
    is_featured: true,
    phone: "+251 33 336 1111",
    photos: [{ id: "img-r6", url: "/placeholder.svg?height=400&width=600", alt: "Ben Abeba Restaurant", is_primary: true }],
    average_rating: 4.8,
    review_count: 267,
  },
]

export function getMockRestaurantById(id: string): Restaurant | undefined {
  return mockRestaurants.find((r) => r.id === id || r.slug === id)
}

export function getMockRestaurantsByCity(citySlug: string): Restaurant[] {
  return mockRestaurants.filter((r) => r.city?.slug === citySlug || r.city_name?.toLowerCase() === citySlug.toLowerCase())
}

export function searchMockRestaurants(params: {
  city?: string
  price_range?: string
  cuisine?: string
  search?: string
}): Restaurant[] {
  let results = [...mockRestaurants]

  if (params.city && params.city !== "all") {
    results = results.filter((r) => r.city?.name.toLowerCase() === params.city?.toLowerCase())
  }

  if (params.price_range && params.price_range !== "all") {
    results = results.filter((r) => r.price_range === params.price_range)
  }

  if (params.cuisine && params.cuisine !== "all") {
    results = results.filter((r) => r.cuisine_types?.some((c) => c.toLowerCase().includes(params.cuisine!.toLowerCase())))
  }

  if (params.search) {
    const q = params.search.toLowerCase()
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.cuisine_types?.some((c) => c.toLowerCase().includes(q)),
    )
  }

  return results.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
}
