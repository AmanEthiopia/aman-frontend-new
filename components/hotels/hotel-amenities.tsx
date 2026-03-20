import type React from "react"
import {
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Sparkles,
  Building2,
  Phone,
  Plane,
  Coffee,
  Shield,
  Clock,
  Luggage,
  Shirt,
  Mountain,
  Users,
} from "lucide-react"

interface HotelAmenitiesProps {
  amenities: string[]
}

const amenityConfig: Record<string, { icon: React.ElementType; label: string }> = {
  WiFi: { icon: Wifi, label: "Free WiFi" },
  Pool: { icon: Waves, label: "Swimming Pool" },
  Spa: { icon: Sparkles, label: "Spa & Wellness" },
  Restaurant: { icon: Utensils, label: "Restaurant" },
  Gym: { icon: Dumbbell, label: "Fitness Center" },
  "Conference Rooms": { icon: Building2, label: "Conference Rooms" },
  "24/7 Security": { icon: Shield, label: "24/7 Security" },
  "Airport Shuttle": { icon: Plane, label: "Airport Shuttle" },
  Parking: { icon: Car, label: "Parking" },
  "Room Service": { icon: Phone, label: "Room Service" },
  Bar: { icon: Coffee, label: "Bar" },
  "24/7 Reception": { icon: Clock, label: "24/7 Reception" },
  "Business Center": { icon: Building2, label: "Business Center" },
  "Tour Desk": { icon: Mountain, label: "Tour Desk" },
  "Luggage Storage": { icon: Luggage, label: "Luggage Storage" },
  Laundry: { icon: Shirt, label: "Laundry Service" },
  Garden: { icon: Mountain, label: "Garden" },
  "Private Beach": { icon: Waves, label: "Private Beach" },
  "Water Sports": { icon: Waves, label: "Water Sports" },
  "Conference Facilities": { icon: Users, label: "Conference Facilities" },
  "Historic Building": { icon: Building2, label: "Historic Building" },
  "City Center Location": { icon: Building2, label: "City Center Location" },
  "Shared Kitchen": { icon: Utensils, label: "Shared Kitchen" },
  "Travel Desk": { icon: Mountain, label: "Travel Desk" },
  "Traditional Coffee Ceremony": { icon: Coffee, label: "Traditional Coffee Ceremony" },
  "Guide Services": { icon: Users, label: "Guide Services" },
  "Mountain Views": { icon: Mountain, label: "Mountain Views" },
  "Panoramic Views": { icon: Mountain, label: "Panoramic Views" },
}

export function HotelAmenities({ amenities }: HotelAmenitiesProps) {
  if (!amenities || amenities.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Amenities</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {amenities.map((amenity) => {
          const config = amenityConfig[amenity] || { icon: Sparkles, label: amenity }
          const Icon = config.icon
          return (
            <div key={amenity} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm">{config.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
