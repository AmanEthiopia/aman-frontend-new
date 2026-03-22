"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrustBadge } from "@/components/shared/trust-badge"
import { getHotelById } from "@/lib/api/hotels"
import { createHotelBooking } from "@/lib/api/bookings"
import { useAuth } from "@/contexts/auth-context"
import type { Hotel } from "@/lib/types"
import {
  Calendar,
  Loader2,
  User,
  Mail,
  Phone,
  Users,
  MessageSquare,
  ArrowLeft,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function BookHotelPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user, isAuthenticated } = useAuth()

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkInDate: "",
    checkOutDate: "",
    numGuests: 1,
    message: "",
  })

  useEffect(() => {
    async function loadHotel() {
      try {
        setLoading(true)
        const hotelData = await getHotelById(id)
        setHotel(hotelData)
      } catch (err) {
        console.error("Failed to load hotel:", err)
        setError("Failed to load hotel details")
      } finally {
        setLoading(false)
      }
    }
    loadHotel()
  }, [id])

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        guestName: user.name || "",
        guestEmail: user.email || "",
        guestPhone: user.phone || "",
      }))
    }
  }, [isAuthenticated, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hotel) return

    setIsSubmitting(true)
    setError(null)

    try {
      await createHotelBooking({
        hotel_id: hotel.id,
        check_in: formData.checkInDate,
        check_out: formData.checkOutDate,
        guests: formData.numGuests,
        special_requests: formData.message || undefined,
      })

      setSuccess(true)
    } catch (err: any) {
      console.error("Booking error:", err)
      setError(err.message || "Failed to submit booking request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]
  const minCheckOut = formData.checkInDate || today

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="mb-8 h-8 w-48" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Skeleton className="h-[500px] w-full rounded-xl" />
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

  if (!hotel) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Hotel not found</h1>
            <Button asChild>
              <Link href="/hotels">Browse Hotels</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mb-4 text-3xl font-bold">Booking Request Submitted!</h1>
              <p className="mb-6 text-muted-foreground">
                Your booking request for {hotel.name} has been submitted successfully. The hotel will review your
                request and contact you within 24-48 hours to confirm availability.
              </p>
              <Card className="mb-6 text-left">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-semibold">Booking Details</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>Hotel:</strong> {hotel.name}
                    </p>
                    <p>
                      <strong>Check-in:</strong> {formData.checkInDate}
                    </p>
                    <p>
                      <strong>Check-out:</strong> {formData.checkOutDate}
                    </p>
                    <p>
                      <strong>Guests:</strong> {formData.numGuests}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/home/bookings">View My Bookings</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/hotels">Browse More Hotels</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Back Navigation */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <Link
              href={`/hotels/${hotel.id}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {hotel.name}
            </Link>
          </div>
        </div>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <h1 className="mb-8 text-2xl font-bold md:text-3xl">Request Booking</h1>

            {!isAuthenticated && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Not logged in</p>
                    <p className="mt-1">
                      You can submit a booking request, but{" "}
                      <Link href="/login" className="underline">
                        logging in
                      </Link>{" "}
                      will help us track your bookings and provide better service.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Booking Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Booking Details
                    </CardTitle>
                    <CardDescription>
                      Submit your booking request for {hotel.name}. The hotel will contact you to confirm availability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Guest Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Guest Information</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="guestName">Full Name *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="guestName"
                                name="guestName"
                                placeholder="John Doe"
                                value={formData.guestName}
                                onChange={handleChange}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="guestEmail">Email Address *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="guestEmail"
                                name="guestEmail"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.guestEmail}
                                onChange={handleChange}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="guestPhone">Phone Number (Optional)</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="guestPhone"
                                name="guestPhone"
                                type="tel"
                                placeholder="+251 91 123 4567"
                                value={formData.guestPhone}
                                onChange={handleChange}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="numGuests">Number of Guests *</Label>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="numGuests"
                                name="numGuests"
                                type="number"
                                min="1"
                                max="10"
                                value={formData.numGuests}
                                onChange={handleChange}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stay Details */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Stay Details</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="checkInDate">Check-in Date *</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="checkInDate"
                                name="checkInDate"
                                type="date"
                                min={today}
                                value={formData.checkInDate}
                                onChange={handleChange}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="checkOutDate">Check-out Date *</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="checkOutDate"
                                name="checkOutDate"
                                type="date"
                                min={minCheckOut}
                                value={formData.checkOutDate}
                                onChange={handleChange}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <Label htmlFor="message">Special Requests (Optional)</Label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Any special requests or questions..."
                            value={formData.message}
                            onChange={handleChange}
                            className="min-h-24 pl-10"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                          <div className="flex gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                          </div>
                        </div>
                      )}

                      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting Request...
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-2 h-4 w-4" />
                            Submit Booking Request
                          </>
                        )}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground">
                        This is a booking request, not a confirmed reservation. The hotel will contact you within 24-48
                        hours.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Hotel Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-4 overflow-hidden rounded-lg">
                        <img
                          src={hotel.images?.[0]?.url || hotel.images?.[0]?.image_url || hotel.cover_photo || "/grand-hotel-exterior.png"}
                          alt={hotel.name}
                          className="h-40 w-full object-cover"
                        />
                      </div>
                      <h3 className="mb-1 font-semibold">{hotel.name}</h3>
                      <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {hotel.area}, {hotel.city?.name}
                      </div>
                      <div className="mb-4 flex items-center gap-2 text-sm">
                        {(hotel.isVerified || hotel.is_verified) && (
                          <span className="flex items-center gap-1 text-primary">
                            <Shield className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          {parseFloat(String(hotel.rating || hotel.average_rating || 0)).toFixed(1)}
                        </span>
                      </div>
                      <div className="border-t border-border pt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">${hotel.priceMin}</span>
                          <span className="text-muted-foreground">- ${hotel.priceMax}</span>
                          <span className="text-sm text-muted-foreground">/ night</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <TrustBadge
                    lastVerified={hotel.lastVerified}
                    foreignTravelerCount={hotel.foreignTravelerCount}
                    disputeFreeDays={hotel.disputeFreeDays}
                  />

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="mb-2 font-medium">Cancellation Policy</h4>
                      <p className="text-sm text-muted-foreground">
                        Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable.
                      </p>
                    </CardContent>
                  </Card>
                </div>
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
