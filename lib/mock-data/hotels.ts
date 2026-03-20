import type { Hotel } from "@/lib/types"
import { mockCities } from "./cities"

export const mockHotels: Hotel[] = [
  {
    id: "hotel-1",
    name: "Sheraton Addis",
    cityId: "city-1",
    city: mockCities[0],
    description:
      "Luxury hotel set in landscaped gardens with multiple restaurants, a spa, and stunning city views. A landmark of Addis Ababa hospitality.",
    address: "Taitu Street, Piazza",
    area: "Piazza",
    priceRange: "luxury",
    priceMin: 250,
    priceMax: 600,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Business Center", "Airport Shuttle", "Concierge"],
    safetyNotes:
      "24/7 security, CCTV, secure parking. Located in a well-lit central area with easy access to embassies.",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 11 517 1717",
    contactEmail: "reservations@sheratonaddis.com",
    website: "https://sheratonaddis.com",
    images: [
      { id: "img-1", url: "/luxury-hotel-lobby-addis-ababa-marble.jpg", alt: "Sheraton Addis Lobby", isPrimary: true },
      { id: "img-2", url: "/luxury-hotel-room-king-bed-city-view.jpg", alt: "Deluxe Room", isPrimary: false },
      { id: "img-3", url: "/hotel-infinity-pool-garden-africa.jpg", alt: "Pool Area", isPrimary: false },
    ],
    rating: 4.8,
    reviewCount: 324,
    safetyScore: 98,
    lastVerified: "2025-12-01",
    foreignTravelerCount: 156,
    disputeFreeDays: 180,
  },
  {
    id: "hotel-2",
    name: "Capital Hotel & Spa",
    cityId: "city-1",
    city: mockCities[0],
    description:
      "Modern boutique hotel near Bole International Airport with contemporary rooms and excellent Ethiopian cuisine.",
    address: "Bole Road, Near Airport",
    area: "Bole",
    priceRange: "mid-range",
    priceMin: 95,
    priceMax: 180,
    amenities: ["WiFi", "Restaurant", "Spa", "Airport Shuttle", "Gym", "Parking"],
    safetyNotes: "Gated compound with security. 5-minute drive from airport. Popular with business travelers.",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 11 661 8888",
    contactEmail: "info@capitalhotelspa.com",
    images: [
      { id: "img-4", url: "/modern-hotel-exterior-addis-ababa.jpg", alt: "Capital Hotel Exterior", isPrimary: true },
      { id: "img-5", url: "/contemporary-hotel-room-modern.jpg", alt: "Standard Room", isPrimary: false },
    ],
    rating: 4.5,
    reviewCount: 189,
    safetyScore: 94,
    lastVerified: "2025-11-15",
    foreignTravelerCount: 89,
    disputeFreeDays: 120,
  },
  {
    id: "hotel-3",
    name: "Jupiter Hotel",
    cityId: "city-1",
    city: mockCities[0],
    description:
      "Affordable and clean hotel in the heart of Kazanchis business district. Great value for budget-conscious travelers.",
    address: "Kazanchis, Near AU HQ",
    area: "Kazanchis",
    priceRange: "budget",
    priceMin: 35,
    priceMax: 65,
    amenities: ["WiFi", "Restaurant", "Parking", "24h Reception"],
    safetyNotes:
      "Secure building with reception desk. Located near African Union headquarters in a busy but safe area.",
    isVerified: true,
    isFeatured: false,
    contactPhone: "+251 11 515 2020",
    contactEmail: "booking@jupiterhotel.et",
    images: [{ id: "img-6", url: "/clean-budget-hotel-room-africa.jpg", alt: "Jupiter Hotel Room", isPrimary: true }],
    rating: 4.1,
    reviewCount: 87,
    safetyScore: 88,
    lastVerified: "2025-10-20",
    foreignTravelerCount: 42,
    disputeFreeDays: 90,
  },
  {
    id: "hotel-4",
    name: "Kuriftu Resort Bahir Dar",
    cityId: "city-2",
    city: mockCities[1],
    description: "Stunning lakeside resort with private beach, water sports, and breathtaking views of Lake Tana.",
    address: "Lake Tana Shore",
    area: "Lake Tana",
    priceRange: "luxury",
    priceMin: 200,
    priceMax: 450,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Water Sports", "Private Beach", "Boat Tours"],
    safetyNotes:
      "Private resort compound with 24/7 security. Isolated but safe location with resort transportation available.",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 58 220 3030",
    contactEmail: "bahirdar@kurifturesorts.com",
    images: [
      { id: "img-7", url: "/lakeside-resort-ethiopia-sunset.jpg", alt: "Kuriftu Resort View", isPrimary: true },
      { id: "img-8", url: "/luxury-cottage-lake-view-africa.jpg", alt: "Lake View Cottage", isPrimary: false },
    ],
    rating: 4.7,
    reviewCount: 156,
    safetyScore: 96,
    lastVerified: "2025-11-28",
    foreignTravelerCount: 78,
    disputeFreeDays: 365,
  },
  {
    id: "hotel-5",
    name: "Blue Nile Hotel",
    cityId: "city-2",
    city: mockCities[1],
    description: "Central hotel with comfortable rooms and rooftop restaurant offering views of the city and lake.",
    address: "Main Street, Bahir Dar",
    area: "City Center",
    priceRange: "mid-range",
    priceMin: 60,
    priceMax: 120,
    amenities: ["WiFi", "Restaurant", "Rooftop Bar", "Parking", "Tour Desk"],
    safetyNotes: "City center location with good lighting. Staff can arrange safe transportation for lake tours.",
    isVerified: true,
    isFeatured: false,
    contactPhone: "+251 58 220 1111",
    contactEmail: "info@bluenilehotel.com",
    images: [{ id: "img-9", url: "/hotel-rooftop-restaurant-view.jpg", alt: "Rooftop Restaurant", isPrimary: true }],
    rating: 4.3,
    reviewCount: 92,
    safetyScore: 90,
    lastVerified: "2025-11-10",
    foreignTravelerCount: 45,
    disputeFreeDays: 150,
  },
  {
    id: "hotel-6",
    name: "Goha Hotel",
    cityId: "city-3",
    city: mockCities[2],
    description:
      "Perched on a hill overlooking the Royal Enclosure, offering panoramic views of Gondar's historic castles.",
    address: "Goha Hill",
    area: "Goha Hill",
    priceRange: "mid-range",
    priceMin: 70,
    priceMax: 140,
    amenities: ["WiFi", "Restaurant", "Bar", "Parking", "Castle Views", "Garden"],
    safetyNotes:
      "Hilltop location with spectacular views. Hotel provides transportation to and from the castle compound.",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 58 111 2020",
    contactEmail: "reservations@gohahotel.com",
    images: [{ id: "img-10", url: "/hotel-castle-view-gondar-ethiopia.jpg", alt: "View of Gondar Castles", isPrimary: true }],
    rating: 4.4,
    reviewCount: 78,
    safetyScore: 92,
    lastVerified: "2025-11-05",
    foreignTravelerCount: 52,
    disputeFreeDays: 200,
  },
  {
    id: "hotel-7",
    name: "Mountain View Hotel",
    cityId: "city-4",
    city: mockCities[3],
    description:
      "Traditional-style hotel with stunning mountain views, just minutes from the famous rock-hewn churches.",
    address: "Near St. George Church",
    area: "Church District",
    priceRange: "mid-range",
    priceMin: 55,
    priceMax: 110,
    amenities: ["WiFi", "Restaurant", "Traditional Coffee", "Garden", "Church Tours"],
    safetyNotes: "Peaceful area near the churches. Local guides available through the hotel for safe exploration.",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 33 336 0000",
    contactEmail: "info@mountainviewlalibela.com",
    images: [{ id: "img-11", url: "/traditional-hotel-lalibela-ethiopia-mountains.jpg", alt: "Mountain View Hotel", isPrimary: true }],
    rating: 4.5,
    reviewCount: 134,
    safetyScore: 94,
    lastVerified: "2025-12-10",
    foreignTravelerCount: 98,
    disputeFreeDays: 240,
  },
  {
    id: "hotel-8",
    name: "Lewi Resort Hawassa",
    cityId: "city-5",
    city: mockCities[4],
    description:
      "Lakefront resort with private cabins, excellent fish restaurant, and water activities on Lake Hawassa.",
    address: "Lake Hawassa Shore",
    area: "Lakefront",
    priceRange: "mid-range",
    priceMin: 80,
    priceMax: 160,
    amenities: ["WiFi", "Restaurant", "Lakefront", "Kayaks", "Birdwatching", "Fish Market Tours"],
    safetyNotes: "Secure lakefront compound. Famous for fresh fish and birdwatching. Family-friendly environment.",
    isVerified: true,
    isFeatured: true,
    contactPhone: "+251 46 220 5050",
    contactEmail: "hawassa@lewiresort.com",
    images: [{ id: "img-12", url: "/lakefront-resort-cabin-hawassa-ethiopia.jpg", alt: "Lakefront Cabin", isPrimary: true }],
    rating: 4.6,
    reviewCount: 112,
    safetyScore: 93,
    lastVerified: "2025-11-22",
    foreignTravelerCount: 61,
    disputeFreeDays: 180,
  },
]

export function getHotelById(id: string): Hotel | undefined {
  return mockHotels.find((hotel) => hotel.id === id)
}

export function getHotelsByCity(cityId: string): Hotel[] {
  return mockHotels.filter((hotel) => hotel.cityId === cityId)
}

export function getFeaturedHotels(): Hotel[] {
  return mockHotels.filter((hotel) => hotel.isFeatured)
}

export function getVerifiedHotels(): Hotel[] {
  return mockHotels.filter((hotel) => hotel.isVerified)
}

export function searchHotels(params: {
  city?: string
  priceRange?: string
  search?: string
  verified?: boolean
}): Hotel[] {
  let results = [...mockHotels]

  if (params.city && params.city !== "all") {
    results = results.filter((h) => h.city?.name.toLowerCase() === params.city?.toLowerCase())
  }

  if (params.priceRange && params.priceRange !== "all") {
    results = results.filter((h) => h.priceRange === params.priceRange)
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase()
    results = results.filter(
      (h) =>
        h.name.toLowerCase().includes(searchLower) ||
        h.description.toLowerCase().includes(searchLower) ||
        h.area.toLowerCase().includes(searchLower),
    )
  }

  if (params.verified) {
    results = results.filter((h) => h.isVerified)
  }

  return results.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1
    if (a.isVerified && !b.isVerified) return -1
    if (!a.isVerified && b.isVerified) return 1
    return 0
  })
}
