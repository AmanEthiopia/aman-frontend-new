"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, MapPin, Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/contexts/app-context"

interface ListingCardProps {
  id: string
  slug?: string // Use slug for URL if available
  type: "hotel" | "restaurant" | "transport" | "experience"
  name: string
  imageUrl: string
  location: string
  city: string
  description: string
  priceRange?: "budget" | "mid-range" | "luxury"
  priceDisplay: string
  rating: number
  reviewCount: number
  isVerified: boolean
  isFeatured?: boolean
  tags?: string[]
  safetyScore?: number
}

const priceRangeLabels: Record<string, { label: string; color: string }> = {
  budget: { label: "Budget", color: "bg-green-100 text-green-800" },
  "mid-range": { label: "Mid-Range", color: "bg-blue-100 text-blue-800" },
  luxury: { label: "Luxury", color: "bg-amber-100 text-amber-800" },
}

export function ListingCard({
  id,
  slug,
  type,
  name,
  imageUrl,
  location,
  city,
  description,
  priceRange,
  priceDisplay,
  rating,
  reviewCount,
  isVerified,
  isFeatured,
  tags,
  safetyScore,
}: ListingCardProps) {
  const { toggleSavedItem, isItemSaved } = useApp()
  const priceInfo = priceRange ? priceRangeLabels[priceRange] : priceRangeLabels["mid-range"]
  // Use slug for URL if available, fallback to id
  const href = `/${type}s/${slug || id}`
  const saved = isItemSaved(id)

  return (
    <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={href}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg?height=300&width=400&query=travel destination"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-2">
            {isVerified && (
              <Badge className="flex items-center gap-1 bg-primary text-primary-foreground">
                <Shield className="h-3 w-3" />
                Verified
              </Badge>
            )}
            {isFeatured && <Badge variant="secondary">Featured</Badge>}
          </div>
          {/* Price Badge */}
          <div className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${priceInfo.color}`}>
            {priceInfo.label}
          </div>
          {/* Safety Score */}
          {safetyScore && safetyScore >= 90 && (
            <div className="absolute bottom-3 left-3 rounded-full bg-green-500/90 px-2 py-1 text-xs font-medium text-white">
              Safety: {safetyScore}%
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link href={href}>
            <h3 className="line-clamp-1 font-semibold text-foreground group-hover:text-primary">{name}</h3>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.preventDefault()
              toggleSavedItem(id)
            }}
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {location}, {city}
          </span>
        </div>

        {/* Rating */}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{description}</p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs">
                {tag}
              </span>
            ))}
            {tags.length > 3 && <span className="rounded-md bg-muted px-2 py-0.5 text-xs">+{tags.length - 3}</span>}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1 border-t border-border pt-3">
          <span className="text-lg font-bold text-foreground">{priceDisplay}</span>
        </div>
      </CardContent>
    </Card>
  )
}
