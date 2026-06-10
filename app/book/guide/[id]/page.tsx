"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Calendar, Clock, Users, MapPin, Star, Shield,
  Loader2, CheckCircle, AlertCircle, Compass
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getGuideBySlug,
  createGuideBooking,
  getMyGuideBookings,
  type Guide,
  SERVICE_TYPE_LABELS,
  PRICING_TYPE_LABELS,
  calculateTotalPrice
} from "@/lib/api/guides"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { formatRating, formatPrice } from "@/lib/utils"

const API_BASE = "https://api.aman.yichalal.ai"

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  return `${API_BASE}/media/${path}`
}

export default function BookGuidePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string
  const { isAuthenticated, userProfile } = useAuth()

  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [bookingNumber, setBookingNumber] = useState<string | null>(null)
  const [existingBookings, setExistingBookings] = useState<any[]>([])
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    booking_date: "",
    start_time: "09:00",
    hours_requested: 4,
    num_adults: 1,
    num_children: 0,
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    special_requests: "",
  })

  useEffect(() => {
    async function loadGuide() {
      try {
        setLoading(true)
        const data = await getGuideBySlug(slug)
        setGuide(data)
      } catch (err) {
        setError("Guide not found")
      } finally {
        setLoading(false)
      }
    }
    if (slug) loadGuide()
  }, [slug])

  useEffect(() => {
    if (userProfile) {
      const user = userProfile.user
      setFormData(prev => ({
        ...prev,
        guest_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        guest_email: user.email || "",
        guest_phone: user.phone || "",
      }))
      getMyGuideBookings().then(setExistingBookings).catch(() => {})
    }
  }, [userProfile])

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const totalPrice = guide ? calculateTotalPrice(
    parseFloat(guide.price),
    guide.pricing_type,
    {
      hoursRequested: formData.hours_requested,
      numAdults: formData.num_adults,
      numChildren: formData.num_children,
    }
  ) : 0

  const doSubmit = async () => {
    if (!guide) return
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        guide_id: guide.id,
        booking_date: formData.booking_date,
        start_time: formData.start_time,
        hours_requested: guide.pricing_type === "hourly" ? formData.hours_requested : undefined,
        num_adults: formData.num_adults,
        num_children: formData.num_children,
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone || undefined,
        special_requests: formData.special_requests || undefined,
      }
      const response = await createGuideBooking(payload)
      setSuccess(true)
      setBookingNumber(response.booking_number)
      toast.success("Booking submitted successfully!")
    } catch (err: any) {
      const message = err.message || "Failed to submit booking"
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error("Please log in to book a guide")
      router.push(`/login?redirect=/book/guide/${slug}`)
      return
    }

    if (!guide) return

    // Duplicate check: same guide + same date
    if (formData.booking_date) {
      const duplicate = existingBookings
        .filter((b) => b.status !== "cancelled" && b.status !== "rejected")
        .find((b) => (b.guide_id === guide.id || b.guide?.id === guide.id) && b.booking_date === formData.booking_date)

      if (duplicate) {
        setDuplicateWarning(
          `You already have an active booking for "${guide.title}" on ${formData.booking_date}. Are you sure you want to request another?`
        )
        return
      }
    }

    await doSubmit()
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <Skeleton className="mb-6 h-8 w-32" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error && !guide) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            <h1 className="mb-2 text-2xl font-bold">Guide Not Found</h1>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={() => router.push("/guides")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guides
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="max-w-md text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-2 text-2xl font-bold">Booking Submitted!</h1>
            <p className="mb-2 text-muted-foreground">
              Your booking request has been sent to the guide for confirmation.
            </p>
            {bookingNumber && (
              <p className="mb-6 font-mono text-lg">{bookingNumber}</p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/dashboard/bookings">View My Bookings</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/guides">Browse More Guides</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const photoUrl = guide?.primary_photo?.photo_url || guide?.photos?.[0]?.photo_url
  const cityNames = guide?.cities?.map(c => c.city.name).join(", ") || "Ethiopia"

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="mb-8 text-2xl font-bold">Book Guide</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Date & Time */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="booking_date">Date *</Label>
                        <Input
                          id="booking_date"
                          type="date"
                          value={formData.booking_date}
                          onChange={(e) => handleChange("booking_date", e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => handleChange("start_time", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Hours (for hourly pricing) */}
                    {guide?.pricing_type === "hourly" && (
                      <div className="space-y-2">
                        <Label htmlFor="hours_requested">Hours Requested *</Label>
                        <Input
                          id="hours_requested"
                          type="number"
                          min={1}
                          max={12}
                          value={formData.hours_requested}
                          onChange={(e) => handleChange("hours_requested", parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                    )}

                    {/* Group Size */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="num_adults">Adults *</Label>
                        <Input
                          id="num_adults"
                          type="number"
                          min={1}
                          max={guide?.max_group_size || 20}
                          value={formData.num_adults}
                          onChange={(e) => handleChange("num_adults", parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="num_children">Children</Label>
                        <Input
                          id="num_children"
                          type="number"
                          min={0}
                          max={10}
                          value={formData.num_children}
                          onChange={(e) => handleChange("num_children", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Guest Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Guest Information</h3>
                      <div className="space-y-2">
                        <Label htmlFor="guest_name">Full Name *</Label>
                        <Input
                          id="guest_name"
                          value={formData.guest_name}
                          onChange={(e) => handleChange("guest_name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="guest_email">Email *</Label>
                          <Input
                            id="guest_email"
                            type="email"
                            value={formData.guest_email}
                            onChange={(e) => handleChange("guest_email", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guest_phone">Phone</Label>
                          <Input
                            id="guest_phone"
                            type="tel"
                            value={formData.guest_phone}
                            onChange={(e) => handleChange("guest_phone", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div className="space-y-2">
                      <Label htmlFor="special_requests">Special Requests</Label>
                      <Textarea
                        id="special_requests"
                        value={formData.special_requests}
                        onChange={(e) => handleChange("special_requests", e.target.value)}
                        placeholder="Any special requirements or requests..."
                        rows={3}
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                        <AlertCircle className="mb-1 inline h-4 w-4" /> {error}
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>Confirm Booking - ${formatPrice(totalPrice)}</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Guide Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  {/* Guide Photo */}
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={getMediaUrl(photoUrl) || "/placeholder.svg?height=200&width=300&query=tour guide"}
                      alt={guide?.title || "Guide"}
                      className="h-40 w-full object-cover"
                    />
                  </div>

                  {/* Guide Info */}
                  <h3 className="mb-1 font-semibold line-clamp-2">{guide?.title}</h3>
                  
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    {guide?.is_verified && (
                      <span className="flex items-center gap-1 text-primary">
                        <Shield className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      {formatRating(guide?.average_rating)}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {cityNames}
                    </div>
                    <div className="flex items-center gap-2">
                      <Compass className="h-4 w-4" />
                      {SERVICE_TYPE_LABELS[guide?.service_type || "private_tour"]}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Price</span>
                      <span>${formatPrice(guide?.price)} {PRICING_TYPE_LABELS[guide?.pricing_type || "daily"].toLowerCase()}</span>
                    </div>
                    {guide?.pricing_type === "hourly" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours</span>
                        <span>{formData.hours_requested}</span>
                      </div>
                    )}
                    {guide?.pricing_type === "per_person" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guests</span>
                        <span>{formData.num_adults + formData.num_children}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Duplicate booking warning */}
      <Dialog open={!!duplicateWarning} onOpenChange={(open) => { if (!open) setDuplicateWarning(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Duplicate Booking
            </DialogTitle>
            <DialogDescription>{duplicateWarning}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDuplicateWarning(null)}>Go Back</Button>
            <Button onClick={() => { setDuplicateWarning(null); doSubmit() }}>Book Anyway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
