import type React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, MapPin, Wifi, Car, Utensils } from "lucide-react"
import type { Hotel, City } from "@/lib/types"
import { SafeCardImage } from "@/components/ui/safe-image"
import { getMediaUrl } from "@/lib/utils/media"

interface HotelCardProps {
  hotel: Hotel & { city?: City }
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3.5 w-3.5" />,
  Parking: <Car className="h-3.5 w-3.5" />,
  Restaurant: <Utensils className="h-3.5 w-3.5" />,
}

const priceRangeLabels: Record<string, { label: string; color: string }> = {
  budget: { label: "Budget", color: "bg-green-100 text-green-800" },
  "mid-range": { label: "Mid-Range", color: "bg-blue-100 text-blue-800" },
  luxury: { label: "Luxury", color: "bg-amber-100 text-amber-800" },
}

export function HotelCard({ hotel }: HotelCardProps) {
  const priceInfo = priceRangeLabels[hotel.price_range] || priceRangeLabels["mid-range"]
  const displayAmenities = hotel.amenities?.slice(0, 4) || []

  return (
    <Link href={`/hotels/${hotel.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
        <SafeCardImage
          src={getMediaUrl(hotel.images?.[0]?.image_url) || "/placeholder.svg?height=300&width=400&query=hotel room interior"}
          alt={hotel.name}
          aspectRatio="aspect-[4/3]"
          enableHoverZoom={true}
          overlay={
            <>
              <div className="absolute left-3 top-3 flex gap-2">
                {hotel.is_verified && (
                  <Badge className="flex items-center gap-1 bg-primary text-primary-foreground">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {hotel.is_featured && <Badge variant="secondary">Featured</Badge>}
              </div>
              <div className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${priceInfo.color}`}>
                {priceInfo.label}
              </div>
            </>
          }
        />
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold text-foreground group-hover:text-primary">{hotel.name}</h3>
          </div>

          {hotel.city && (
            <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {hotel.area}, {hotel.city.name}
              </span>
            </div>
          )}

          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{hotel.description}</p>

          {/* Amenities */}
          {displayAmenities.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {displayAmenities.map((amenity: any, index: number) => {
                // Handle both string format and object format from API
                const amenityName = typeof amenity === 'string' 
                  ? amenity 
                  : (amenity?.amenity_type || amenity?.name || 'Unknown')
                const amenityKey = typeof amenity === 'string' 
                  ? amenity 
                  : (amenity?.id || `amenity-${index}`)
                
                return (
                  <span key={amenityKey} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                    {amenityIcons[amenityName] || null}
                    {amenityName}
                  </span>
                )
              })}
              {hotel.amenities && hotel.amenities.length > 4 && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">+{hotel.amenities.length - 4} more</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1 border-t border-border pt-3">
            <span className="text-lg font-bold text-foreground">
              ${hotel.price_min || 0} - ${hotel.price_max || 0}
            </span>
            <span className="text-sm text-muted-foreground">/ night</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
