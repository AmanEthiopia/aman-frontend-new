"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2, Hotel, Shield, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { searchHotels } from "@/lib/api/hotels"
import { getMediaUrl } from "@/lib/utils/media"
import type { Hotel as HotelType } from "@/lib/types"

function HotelFeatureCard({ hotel }: { hotel: HotelType }) {
  const primaryImage = hotel.images?.[0]?.image_url
  const imgSrc = getMediaUrl(primaryImage) || "/placeholder.svg?height=280&width=400"

  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-xl"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={imgSrc}
          alt={hotel.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />

      {/* Top badges */}
      <div className="absolute left-3 top-3 flex gap-2">
        {hotel.is_verified && (
          <Badge className="flex items-center gap-1 bg-primary text-primary-foreground text-xs">
            <Shield className="h-3 w-3" />
            Verified
          </Badge>
        )}
        {hotel.is_featured && (
          <Badge variant="secondary" className="text-xs">Featured</Badge>
        )}
      </div>

      {/* Price range chip */}
      {hotel.price_min != null && (
        <div className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground">
          From ${hotel.price_min}/night
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-bold text-white line-clamp-1 text-base group-hover:underline">
          {hotel.name}
        </h3>
        {(hotel.area || (hotel as any).city?.name) && (
          <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {[hotel.area, (hotel as any).city?.name].filter(Boolean).join(", ")}
          </div>
        )}
        {hotel.average_rating != null && Number(hotel.average_rating) > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-yellow-300">
            <Star className="h-3 w-3 fill-yellow-300" />
            {Number(hotel.average_rating).toFixed(1)}
            {hotel.review_count != null && hotel.review_count > 0 && (
              <span className="text-white/70 ml-0.5">({hotel.review_count})</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export function FeaturedHotelsSection() {
  const [hotels, setHotels] = useState<HotelType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    searchHotels({ page_size: 6 })
      .then((res) => {
        // Sort: featured first, then verified, then rest
        const sorted = [...res.results].sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1
          if (!a.is_featured && b.is_featured) return 1
          if (a.is_verified && !b.is_verified) return -1
          if (!a.is_verified && b.is_verified) return 1
          return 0
        })
        setHotels(sorted.slice(0, 6))
      })
      .catch(() => {/* silent — section just stays hidden */})
      .finally(() => setLoading(false))
  }, [])

  // Don't render the section if there are no hotels
  if (!loading && hotels.length === 0) return null

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Stay
            </span>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Featured Hotels</h2>
            <p className="mt-2 text-muted-foreground">
              Verified properties across Ethiopia — from boutique lodges to luxury resorts
            </p>
          </div>
          <Button variant="outline" asChild className="hidden bg-transparent sm:flex">
            <Link href="/hotels">
              Explore All Hotels
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelFeatureCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild className="bg-transparent">
            <Link href="/hotels">
              Explore All Hotels
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
