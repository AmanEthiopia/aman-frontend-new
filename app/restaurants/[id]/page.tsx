"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getRestaurantsPaginated } from "@/lib/api/restaurants"
import { APIError } from "@/lib/api/client"
import type { Restaurant } from "@/lib/types"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Heart,
  Share2,
  AlertCircle,
  Clock,
  DollarSign,
  Users,
  Star,
  Utensils,
  Shield,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useApp } from "@/lib/contexts/app-context"
import { AddToItineraryButton } from "@/components/itinerary/add-to-itinerary-button"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { ContactDialog } from "@/components/messaging/contact-dialog"

export default function RestaurantDetailPage() {
  const params = useParams()
  const slug = params.id as string
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toggleSavedItem, isItemSaved } = useApp()

  useEffect(() => {
    async function loadRestaurant() {
      setLoading(true)
      setError(null)

      try {
        const response = await getRestaurantsPaginated({ search: slug })
        const found = response.results?.find((r: Restaurant) => 
          r.slug === slug || r.id === slug || r.name?.toLowerCase().includes(slug.toLowerCase())
        )
        
        if (!found) {
          throw new APIError(404, "Restaurant not found")
        }
        
        setRestaurant(found)
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message)
        } else {
          setError("Failed to load restaurant details. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="mb-4 h-6 w-32" />
            <Skeleton className="mb-4 h-[400px] w-full rounded-xl" />
            <div className="grid gap-8 lg:grid-cols-3">
              <Skeleton className="h-96 lg:col-span-2" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <Link href="/restaurants" className="mb-6 flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Restaurants
            </Link>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!restaurant) return null

  const isSaved = isItemSaved(`restaurant-${restaurant.id}`)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Link href="/restaurants" className="mb-6 flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Restaurants
          </Link>

          {/* Header with Title and Actions */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold">{restaurant.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {restaurant.isVerified ? (
                  <Badge className="flex items-center gap-1 bg-primary text-primary-foreground">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 border-muted-foreground/30 bg-background/80 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
                {restaurant.cuisine && (
                  Array.isArray(restaurant.cuisine)
                    ? restaurant.cuisine.map((c: string) => (
                        <Badge key={c} variant="secondary">{c}</Badge>
                      ))
                    : <Badge variant="secondary">{restaurant.cuisine}</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleSavedItem(`restaurant-${restaurant.id}`)}
              >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current text-red-500" : ""}`} />
              </Button>
<Button variant="outline" size="icon">
<Share2 className="h-4 w-4" />
</Button>
<AddToItineraryButton
  itemType="restaurant"
  itemId={restaurant.id}
  itemName={restaurant.name}
/>
</div>
</div>

{/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {/* Hero Image */}
              <div className="mb-8 overflow-hidden rounded-xl">
                <img
                  src={restaurant.image || "/placeholder.svg?height=400&width=800&query=restaurant"}
                  alt={restaurant.name}
                  className="h-96 w-full object-cover"
                />
              </div>

              {/* Description */}
              {restaurant.description && (
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <h2 className="mb-4 text-xl font-semibold">About</h2>
                    <p className="whitespace-pre-line text-muted-foreground">{restaurant.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Restaurant Details */}
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                {restaurant.price_range && (
                  <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <DollarSign className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Price Range</p>
                        <p className="text-lg font-semibold">{restaurant.price_range}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {restaurant.working_hours && (
                  <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <Clock className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Hours</p>
                        <p className="text-lg font-semibold">{restaurant.working_hours}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Column - Reservation Card */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{restaurant.location || restaurant.city || "Not specified"}</p>
                    </div>
                    {restaurant.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{restaurant.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-2 border-t pt-4">
                    {restaurant.phone && (
                      <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Phone className="h-4 w-4" />
                        {restaurant.phone}
                      </a>
                    )}
                    {restaurant.email && (
                      <a href={`mailto:${restaurant.email}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Mail className="h-4 w-4" />
                        {restaurant.email}
                      </a>
                    )}
                    {restaurant.website && (
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>

                  <Button className="w-full" size="lg">
                    Make Reservation
                  </Button>
                  
                  <ContactDialog
                    contextType="restaurant"
                    contextId={restaurant.id}
                    contextName={restaurant.name}
                    trigger={
                      <Button variant="outline" size="lg" className="w-full mt-3">
                        Send Message
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </div>

            {/* Reviews Section */}
            <div className="lg:col-span-2 mt-8">
              <ReviewsSection
                contentType="restaurant"
                contentId={restaurant.id}
                averageRating={restaurant.rating || 0}
                reviewCount={restaurant.review_count || 0}
              />
            </div>
          </div>
        </div>
      </main>
      <FloatingAIAssistant />
      <Footer />
    </div>
  )
}
