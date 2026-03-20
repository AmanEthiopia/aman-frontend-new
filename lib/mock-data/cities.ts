import type { City } from "@/lib/types"

export const mockCities: City[] = [
  {
    id: "city-1",
    name: "Addis Ababa",
    nameAmharic: "አዲስ አበባ",
    description:
      "Ethiopia's vibrant capital, a modern metropolis with rich history, excellent cuisine, and gateway to the country's wonders.",
    imageUrl: "/addis-ababa-ethiopia-cityscape-modern-buildings.jpg",
    hotelsCount: 52,
    restaurantsCount: 78,
    experiencesCount: 24,
  },
  {
    id: "city-2",
    name: "Bahir Dar",
    nameAmharic: "ባህር ዳር",
    description:
      "Gateway to Lake Tana and the Blue Nile Falls, offering stunning natural beauty and island monasteries.",
    imageUrl: "/bahir-dar-lake-tana-ethiopia-sunset.jpg",
    hotelsCount: 18,
    restaurantsCount: 25,
    experiencesCount: 12,
  },
  {
    id: "city-3",
    name: "Gondar",
    nameAmharic: "ጎንደር",
    description: "The 'Camelot of Africa' featuring medieval castles, ancient churches, and rich royal heritage.",
    imageUrl: "/gondar-castles-ethiopia-historic.jpg",
    hotelsCount: 14,
    restaurantsCount: 18,
    experiencesCount: 15,
  },
  {
    id: "city-4",
    name: "Lalibela",
    nameAmharic: "ላሊበላ",
    description: "Home to UNESCO World Heritage rock-hewn churches, a spiritual center and architectural marvel.",
    imageUrl: "/lalibela-rock-churches-ethiopia.jpg",
    hotelsCount: 12,
    restaurantsCount: 10,
    experiencesCount: 8,
  },
  {
    id: "city-5",
    name: "Hawassa",
    nameAmharic: "ሐዋሳ",
    description: "A beautiful lakeside city known for its fish market, birdlife, and relaxed atmosphere.",
    imageUrl: "/hawassa-lake-ethiopia-scenic.jpg",
    hotelsCount: 10,
    restaurantsCount: 22,
    experiencesCount: 6,
  },
  {
    id: "city-6",
    name: "Dire Dawa",
    nameAmharic: "ድሬ ዳዋ",
    description: "A diverse trading city with French colonial architecture and vibrant markets.",
    imageUrl: "/dire-dawa-ethiopia-architecture.jpg",
    hotelsCount: 8,
    restaurantsCount: 15,
    experiencesCount: 5,
  },
  {
    id: "city-7",
    name: "Axum",
    nameAmharic: "አክሱም",
    description:
      "Ancient capital of the Aksumite Empire, home to towering obelisks and the legendary Ark of the Covenant.",
    imageUrl: "/axum-ethiopia-ancient-obelisks.jpg",
    hotelsCount: 8,
    restaurantsCount: 12,
    experiencesCount: 10,
  },
  {
    id: "city-8",
    name: "Harar",
    nameAmharic: "ሐረር",
    description: "A walled UNESCO city with 82 mosques, colorful markets, and famous hyena feeding tradition.",
    imageUrl: "/harar-ethiopia-old-walled-city.jpg",
    hotelsCount: 6,
    restaurantsCount: 14,
    experiencesCount: 9,
  },
]

export function getCityById(id: string): City | undefined {
  return mockCities.find((city) => city.id === id)
}

export function getCityByName(name: string): City | undefined {
  return mockCities.find((city) => city.name.toLowerCase() === name.toLowerCase())
}
