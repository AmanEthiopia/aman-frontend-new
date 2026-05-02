"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrustBadge } from "@/components/shared/trust-badge"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { ContactDialog } from "@/components/messaging/contact-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getHotelById, getHotelRooms } from "@/lib/api/hotels"
import { APIError } from "@/lib/api/client"
import type { Hotel, Room } from "@/lib/types"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Calendar,
  Shield,
  Star,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Sparkles,
  Heart,
  AlertCircle,
  Users,
  Clock,
  BedDouble,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useApp } from "@/lib/contexts/app-context"
import { AddToItineraryButton } from "@/components/itinerary/add-to-itinerary-button"
import { formatRating } from "@/lib/utils"
import { getMediaUrl } from "@/lib/utils/media"

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-4 w-4" />,
  Parking: <Car className="h-4 w-4" />,
  Restaurant: <Utensils className="h-4 w-4" />,
  Gym: <Dumbbell className="h-4 w-4" />,
}

export default function HotelDetailPage() {
  const params = useParams()
  const slug = params.id as string
  const [hotel, setHotel] = useState<any>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const { toggleSavedItem, isItemSaved, setIsAIAssistantOpen } = useApp()

  const loadRooms = useCallback(async (hotelId: string, ci?: string, co?: string) => {
    setRoomsLoading(true)
    try {
      const roomsData = await getHotelRooms(hotelId, ci && co ? { check_in: ci, check_out: co } : undefined)
      setRooms(roomsData || [])
    } catch {
      setRooms([])
    } finally {
      setRoomsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function loadHotel() {
      setLoading(true)
      setError(null)
      try {
        const hotelData = await getHotelById(slug)
        setHotel(hotelData)
        if (hotelData?.id) {
          await loadRooms(hotelData.id)
        }
      } catch (err) {
        console.error("[v0] Failed to load hotel:", err)
        if (err instanceof APIError) {
          setError(err.message)
        } else {
          setError("Failed to load hotel details. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }
    loadHotel()
  }, [slug, loadRooms])

  useEffect(() => {
    if (hotel?.id && checkIn && checkOut && checkOut > checkIn) {
      loadRooms(hotel.id, checkIn, checkOut)
    }
  }, [hotel?.id, checkIn, checkOut, loadRooms])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="mb-4 h-6 w-32" />
            <Skeleton className="mb-4 h-[400px] w-full rounded-xl" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Skeleton className="mb-4 h-8 w-3/4" />
                <Skeleton className="mb-2 h-5 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "Hotel not found"}</AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link href="/hotels">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Hotels
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const priceRangeLabels: Record<string, string> = {
    budget: "Budget-Friendly",
    "mid-range": "Mid-Range",
    luxury: "Luxury",
  }

  const saved = isItemSaved(hotel.id)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Back Navigation */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link
              href="/hotels"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Hotels
            </Link>
            <div className="flex items-center gap-2">
              <AddToItineraryButton
                itemType="hotel"
                itemId={hotel.id}
                itemName={hotel.name}
              />
              <Button variant="outline" size="sm" onClick={() => toggleSavedItem(hotel.id)}>
                <Heart className={`mr-1 h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                {saved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <section className="container mx-auto px-4 py-6">
          {(() => {
            // Handle different image formats from API
            const images = hotel.images || hotel.photos || []
            const coverPhoto = getMediaUrl(hotel.cover_photo || hotel.cover_photo_url)
            const mainImage = getMediaUrl(images[selectedImage]?.url || images[selectedImage]?.photo_url) || coverPhoto || "/placeholder.svg?height=500&width=800&query=hotel room"
            
            return (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-3">
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={mainImage}
                      alt={images[selectedImage]?.alt || hotel.name}
                      className="h-[400px] w-full object-cover"
                    />
                  </div>
                </div>
                <div className="hidden gap-4 md:grid">
                  {images.length > 0 ? (
                    images.slice(0, 3).map((image: any, index: number) => (
                      <button
                        key={image.id || index}
                        onClick={() => setSelectedImage(index)}
                        className={`overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImage === index ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <img
                          src={getMediaUrl(image.url || image.photo_url) || "/placeholder.svg?height=150&width=150&query=hotel"}
                          alt={image.alt || `${hotel.name} photo ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))
                  ) : coverPhoto ? (
                    <div className="overflow-hidden rounded-lg border-2 border-primary">
                      <img
                        src={coverPhoto}
                        alt={hotel.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })()}
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 pb-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {(hotel.is_verified ?? hotel.isVerified) ? (
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
                  {(hotel.is_featured ?? hotel.isFeatured) && <Badge variant="secondary">Featured</Badge>}
                  {hotel.star_rating && (
                    <Badge variant="outline">{hotel.star_rating} Star</Badge>
                  )}
                  {hotel.category && (
                    <Badge variant="outline" className="capitalize">{hotel.category}</Badge>
                  )}
                </div>
                <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">{hotel.name}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {hotel.address || hotel.area || ""}{hotel.address || hotel.area ? ", " : ""}{hotel.city_name || hotel.city?.name || ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium">{formatRating(hotel.average_rating || hotel.rating)}</span>
                    <span className="text-muted-foreground">({hotel.review_count || hotel.reviewCount || 0} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              {hotel.lastVerified && (
                <div className="mb-6">
                  <TrustBadge
                    lastVerified={hotel.lastVerified}
                    foreignTravelerCount={hotel.foreignTravelerCount}
                    disputeFreeDays={hotel.disputeFreeDays}
                  />
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h2 className="mb-3 text-lg font-semibold">About This Hotel</h2>
                <p className="leading-relaxed text-muted-foreground">{hotel.description || hotel.short_description || "No description available."}</p>
              </div>

              {/* Amenities */}
              {(hotel.amenities?.length > 0 || hotel.facilities?.length > 0) && (
                <div className="mb-8">
                  <h2 className="mb-4 text-lg font-semibold">Amenities</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(hotel.amenities || hotel.facilities || []).map((amenity: any, index: number) => {
                      // Handle both string format and object format from API
                      const amenityName = typeof amenity === 'string' 
                        ? amenity 
                        : (amenity?.amenity_type || amenity?.name || 'Unknown')
                      const amenityKey = typeof amenity === 'string' 
                        ? amenity 
                        : (amenity?.id || `amenity-${index}`)
                      const isFree = typeof amenity === 'object' && amenity?.is_free
                      
                      return (
                        <div key={amenityKey} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                          {amenityIcons[amenityName] || <Sparkles className="h-4 w-4 text-primary" />}
                          <span className="text-sm">{amenityName}</span>
                          {isFree && <Badge variant="outline" className="text-xs">Free</Badge>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Rooms */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Room Types & Availability</h2>
                  {roomsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                {/* Date range for availability check */}
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <p className="mb-3 text-sm text-muted-foreground">Select dates to check availability</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Check-in</Label>
                        <Input
                          type="date"
                          value={checkIn}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setCheckIn(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Check-out</Label>
                        <Input
                          type="date"
                          value={checkOut}
                          min={checkIn || new Date().toISOString().split("T")[0]}
                          onChange={(e) => setCheckOut(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {rooms.length > 0 ? (
                  <div className="space-y-4">
                    {rooms.map((room) => {
                      const hasDateRange = checkIn && checkOut && checkOut > checkIn
                      const available = room.available_units
                      const total = room.total_units ?? 0
                      const booked = total - (available ?? 0)
                      const allBooked = hasDateRange && available === 0
                      const canBook = !hasDateRange || (available !== null && available !== undefined && available > 0)

                      return (
                        <Card key={room.id} className={allBooked ? "opacity-60" : ""}>
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-4 md:flex-row">
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold">{room.name}</h3>
                                  {room.bed_type && (
                                    <Badge variant="outline" className="text-xs">
                                      <BedDouble className="mr-1 h-3 w-3" />
                                      {room.bed_type}
                                    </Badge>
                                  )}
                                  {allBooked && (
                                    <Badge variant="destructive" className="text-xs">
                                      <XCircle className="mr-1 h-3 w-3" />
                                      Fully Booked
                                    </Badge>
                                  )}
                                  {hasDateRange && !allBooked && available !== null && available !== undefined && (
                                    <Badge variant="secondary" className="text-xs text-green-700 bg-green-50 border-green-200">
                                      <CheckCircle2 className="mr-1 h-3 w-3" />
                                      {available} available
                                    </Badge>
                                  )}
                                </div>
                                <p className="mb-2 text-sm text-muted-foreground">{room.description}</p>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>Up to {room.max_guests} guests</span>
                                  </div>
                                  {total > 0 && (
                                    <div className="flex items-center gap-1">
                                      <BedDouble className="h-4 w-4" />
                                      <span>{total} unit{total !== 1 ? "s" : ""} total</span>
                                    </div>
                                  )}
                                </div>

                                {/* Availability unit grid */}
                                {hasDateRange && total > 0 && (
                                  <div className="mt-3">
                                    <p className="mb-1.5 text-xs text-muted-foreground">Unit availability</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {Array.from({ length: total }).map((_, i) => {
                                        const isAvail = i < (available ?? 0)
                                        return (
                                          <div
                                            key={i}
                                            title={isAvail ? "Available" : "Booked"}
                                            className={`h-6 w-6 rounded text-xs flex items-center justify-center font-medium ${
                                              isAvail
                                                ? "bg-green-100 text-green-700 border border-green-200"
                                                : "bg-red-100 text-red-600 border border-red-200"
                                            }`}
                                          >
                                            {i + 1}
                                          </div>
                                        )
                                      })}
                                    </div>
                                    {booked > 0 && (
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {booked} booked · {available ?? 0} free
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end justify-between gap-2">
                                <div className="text-right">
                                  <div className="text-2xl font-bold">${room.price_per_night}</div>
                                  <div className="text-sm text-muted-foreground">per night</div>
                                </div>
                                <Button
                                  size="sm"
                                  asChild
                                  disabled={!!allBooked}
                                  className={allBooked ? "opacity-50 pointer-events-none" : ""}
                                >
                                  <Link
                                    href={`/book/hotel/${hotel.slug || hotel.id}?room=${room.id}${checkIn ? `&check_in=${checkIn}` : ""}${checkOut ? `&check_out=${checkOut}` : ""}`}
                                  >
                                    {allBooked ? "Fully Booked" : "Book Room"}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : !roomsLoading ? (
                  <p className="text-sm text-muted-foreground">No rooms listed yet. Contact the hotel directly.</p>
                ) : null}
              </div>

              {/* Safety */}
              {(hotel.safetyScore || hotel.safety_score) && (
                <div className="mb-8">
                  <h2 className="mb-4 text-lg font-semibold">Safety Information</h2>
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-medium">Safety Score: {hotel.safetyScore || hotel.safety_score}%</span>
                      </div>
                      {(hotel.safetyNotes || hotel.safety_notes) && (
                        <p className="text-sm text-muted-foreground">{hotel.safetyNotes || hotel.safety_notes}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Check-in/Check-out Times */}
              {(hotel.check_in_time || hotel.check_out_time) && (
                <div className="mb-8">
                  <h2 className="mb-4 text-lg font-semibold">Hotel Policies</h2>
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {hotel.check_in_time && (
                          <div>
                            <span className="text-sm text-muted-foreground">Check-in Time</span>
                            <p className="font-medium">{hotel.check_in_time}</p>
                          </div>
                        )}
                        {hotel.check_out_time && (
                          <div>
                            <span className="text-sm text-muted-foreground">Check-out Time</span>
                            <p className="font-medium">{hotel.check_out_time}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Reviews Section */}
              <div className="mb-8">
                <ReviewsSection
                  contentType="hotel"
                  contentId={hotel.id}
                  averageRating={hotel.average_rating || hotel.rating || 0}
                  reviewCount={hotel.review_count || hotel.reviewCount || 0}
                />
              </div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 border-b border-border pb-4">
                      <div className="flex items-baseline gap-1">
                        {hotel.min_price ? (
                          <>
                            <span className="text-sm text-muted-foreground">From</span>
                            <span className="text-3xl font-bold">${hotel.min_price}</span>
                            <span className="text-sm text-muted-foreground">/ night</span>
                          </>
                        ) : hotel.priceMin ? (
                          <>
                            <span className="text-3xl font-bold">${hotel.priceMin}</span>
                            <span className="text-muted-foreground">- ${hotel.priceMax}</span>
                            <span className="text-sm text-muted-foreground">/ night</span>
                          </>
                        ) : (
                          <span className="text-lg font-medium">Contact for pricing</span>
                        )}
                      </div>
                    </div>

                    {/* Quick date selector in sidebar */}
                    <div className="mb-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Check-in</Label>
                          <Input
                            type="date"
                            value={checkIn}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Check-out</Label>
                          <Input
                            type="date"
                            value={checkOut}
                            min={checkIn || new Date().toISOString().split("T")[0]}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <Button size="lg" className="mb-4 w-full" asChild>
                      <Link href={`/book/hotel/${hotel.slug || hotel.id}${checkIn ? `?check_in=${checkIn}` : ""}${checkOut ? `${checkIn ? "&" : "?"}check_out=${checkOut}` : ""}`}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Now
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      className="mb-4 w-full bg-transparent"
                      onClick={() => setIsAIAssistantOpen(true)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Ask AI About This Hotel
                    </Button>

                    <p className="mb-4 text-center text-xs text-muted-foreground">
                      You won&apos;t be charged yet. Submit a request and the hotel will contact you.
                    </p>

                    {/* Contact Info */}
                    <div className="space-y-3 border-t border-border pt-4">
                      <h3 className="font-semibold">Contact Hotel</h3>
                      {(hotel.contactPhone || hotel.phone || hotel.contact_phone) && (
                        <a
                          href={`tel:${hotel.contactPhone || hotel.phone || hotel.contact_phone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Phone className="h-4 w-4" />
                          {hotel.contactPhone || hotel.phone || hotel.contact_phone}
                        </a>
                      )}
                      {(hotel.contactEmail || hotel.email || hotel.contact_email) && (
                        <a
                          href={`mailto:${hotel.contactEmail || hotel.email || hotel.contact_email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Mail className="h-4 w-4" />
                          {hotel.contactEmail || hotel.email || hotel.contact_email}
                        </a>
                      )}
                      {hotel.website && (
                        <a
                          href={hotel.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Globe className="h-4 w-4" />
                          Visit Website
                        </a>
                      )}
                      <ContactDialog
                        contextType="hotel"
                        contextId={hotel.id}
                        contextName={hotel.name}
                        trigger={
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            Send Message
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingAIAssistant />
    </div>
  )
}
