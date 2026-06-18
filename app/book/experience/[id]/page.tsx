"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import {
  getExperienceBySlug,
  createPackageBooking,
  getMyPackageBookings,
  type Package,
  type Departure,
} from "@/lib/api/experiences"
import { useAuth } from "@/contexts/auth-context"
import { APIError } from "@/lib/api/client"
import { getMediaUrl } from "@/lib/utils/media"
import { formatRating } from "@/lib/utils"
import {
  ArrowLeft,
  CalendarDays,
  Users,
  AlertCircle,
  CheckCircle,
  MapPin,
  Clock,
  Minus,
  Plus,
  Star,
  Shield,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function formatCurrency(amount: string | number, currency = "ETB"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function BookExperiencePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.id as string
  const departureId = searchParams.get("departure")
  const { userProfile, isAuthenticated } = useAuth()

  const [pkg, setPkg] = useState<Package | null>(null)
  const [departure, setDeparture] = useState<Departure | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingNumber, setBookingNumber] = useState<string | null>(null)
  const [existingBookings, setExistingBookings] = useState<any[]>([])
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  // Flexible (no fixed departure) request: traveler proposes a preferred date.
  const [flexibleDate, setFlexibleDate] = useState("")

  const [formData, setFormData] = useState({
    numAdults: 1,
    numChildren: 0,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
  })

  useEffect(() => {
    async function loadPackage() {
      setLoading(true)
      setError(null)
      try {
        const data = await getExperienceBySlug(slug)
        setPkg(data)

        if (departureId && data.departures) {
          const dep = data.departures.find((d) => d.id === departureId)
          if (dep) setDeparture(dep)
        }

        if (userProfile?.user) {
          const u = userProfile.user
          setFormData((prev) => ({
            ...prev,
            guestName: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
            guestEmail: u.email || "",
            guestPhone: u.phone || "",
          }))
          getMyPackageBookings().then(setExistingBookings).catch(() => {})
        }
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message)
        } else {
          setError("Failed to load experience. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadPackage()
  }, [slug, userProfile, departureId])

  const pricePerPerson = pkg ? parseFloat(pkg.price_per_person) : 0
  const childPrice = pkg?.child_price ? parseFloat(pkg.child_price) : pricePerPerson * 0.5
  const adultTotal = pricePerPerson * formData.numAdults
  const childTotal = childPrice * formData.numChildren
  const totalPrice = adultTotal + childTotal
  const currency = pkg?.price_currency || "ETB"

  const maxSeats = departure?.available_seats ?? Infinity
  const totalPax = formData.numAdults + formData.numChildren

  const doSubmit = async () => {
    if (!pkg || (!departure && !flexibleDate)) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await createPackageBooking({
        package_id: pkg.id,
        ...(departure ? { departure_id: departure.id } : { start_date: flexibleDate }),
        num_adults: formData.numAdults,
        num_children: formData.numChildren,
        guest_name: formData.guestName,
        guest_email: formData.guestEmail,
        guest_phone: formData.guestPhone || undefined,
        special_requests: formData.specialRequests || undefined,
      })
      setBookingNumber(response.booking.booking_number)
      setSuccess(true)
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError("Failed to create booking. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pkg || !isAuthenticated) return
    if (!departure && !flexibleDate) {
      setError("Please choose your preferred date.")
      return
    }

    // Duplicate check: same package + same departure already booked
    const duplicate = existingBookings
      .filter((b) => b.status !== "cancelled" && b.status !== "rejected")
      .find((b) => (departure && b.departure_id === departure.id) || b.package_id === pkg.id)

    if (duplicate) {
      const tripName = (duplicate as any).package?.title ?? pkg.title
      const depDate = (duplicate as any).departure?.start_date ?? ""
      setDuplicateWarning(
        `You already have an active booking for "${tripName}"${depDate ? ` (departure: ${formatDate(depDate)})` : ""}. Are you sure you want to book again?`
      )
      return
    }

    await doSubmit()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="mb-6 h-8 w-48" />
            <div className="grid gap-8 lg:grid-cols-3">
              <Skeleton className="h-[600px] lg:col-span-2" />
              <Skeleton className="h-[400px]" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !pkg) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <Link href="/experiences" className="mb-6 flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Experiences
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

  if (!pkg) return null

  if (success) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <Card className="mx-auto max-w-lg">
              <CardContent className="pt-8 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h1 className="mt-4 text-2xl font-bold">Booking Confirmed!</h1>
                <p className="mt-2 text-muted-foreground">
                  Your booking for <strong>{pkg.title}</strong> has been submitted.
                </p>
                {departure && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Departure: {formatDate(departure.start_date)} – {formatDate(departure.end_date)}
                  </p>
                )}
                {bookingNumber && (
                  <p className="mt-4 rounded-lg bg-muted p-3 font-mono text-lg">
                    Booking #: {bookingNumber}
                  </p>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  A confirmation email has been sent to {formData.guestEmail}.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <Link href="/bookings">
                    <Button className="w-full">View My Bookings</Button>
                  </Link>
                  <Link href="/experiences">
                    <Button variant="outline" className="w-full">
                      Explore More Experiences
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const primaryPhoto = getMediaUrl(pkg.primary_photo?.photo_url || pkg.photos?.[0]?.photo_url)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Link
            href={`/experiences/${pkg.slug}`}
            className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {pkg.title}
          </Link>

          <h1 className="mb-8 text-3xl font-bold">Book Your Experience</h1>

          {!isAuthenticated && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please{" "}
                <Link href={`/auth/login?redirect=/book/experience/${slug}?departure=${departureId}`} className="font-medium underline">
                  sign in
                </Link>{" "}
                to complete your booking.
              </AlertDescription>
            </Alert>
          )}

          {!departure && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a <strong>flexible booking request</strong> — pick your preferred date below and the
                organizer will confirm the final plan with you.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {/* Selected Departure */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      {departure ? "Selected Departure" : "Preferred Date"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {departure ? (
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">
                              {formatDate(departure.start_date)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              to {formatDate(departure.end_date)}
                            </p>
                          </div>
                          {departure.available_seats <= 3 ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {departure.available_seats} seats left
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              {departure.available_seats} seats available
                            </Badge>
                          )}
                        </div>
                        {departure.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">{departure.notes}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="flexibleDate">Your preferred start date *</Label>
                        <Input
                          id="flexibleDate"
                          type="date"
                          value={flexibleDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setFlexibleDate(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          The organizer will confirm availability and the final itinerary with you.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Travelers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                          <FieldLabel>Adults *</FieldLabel>
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={formData.numAdults <= 1}
                              onClick={() => setFormData({ ...formData, numAdults: formData.numAdults - 1 })}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center text-lg font-semibold">{formData.numAdults}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={
                                (pkg.max_group_size ? totalPax >= pkg.max_group_size : false) ||
                                totalPax >= maxSeats
                              }
                              onClick={() => setFormData({ ...formData, numAdults: formData.numAdults + 1 })}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatCurrency(pricePerPerson, currency)} per adult
                          </p>
                        </Field>

                        <Field>
                          <FieldLabel>Children</FieldLabel>
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={formData.numChildren <= 0}
                              onClick={() => setFormData({ ...formData, numChildren: formData.numChildren - 1 })}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center text-lg font-semibold">{formData.numChildren}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={
                                (pkg.max_group_size ? totalPax >= pkg.max_group_size : false) ||
                                totalPax >= maxSeats
                              }
                              onClick={() => setFormData({ ...formData, numChildren: formData.numChildren + 1 })}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatCurrency(childPrice, currency)} per child
                          </p>
                        </Field>
                      </div>
                      {departure && totalPax > departure.available_seats && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Only {departure.available_seats} seats available for this departure.
                          </AlertDescription>
                        </Alert>
                      )}
                    </FieldGroup>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="guestName">Full Name *</FieldLabel>
                        <Input
                          id="guestName"
                          required
                          value={formData.guestName}
                          onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </Field>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="guestEmail">Email *</FieldLabel>
                          <Input
                            id="guestEmail"
                            type="email"
                            required
                            value={formData.guestEmail}
                            onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                            placeholder="your@email.com"
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="guestPhone">Phone</FieldLabel>
                          <Input
                            id="guestPhone"
                            type="tel"
                            value={formData.guestPhone}
                            onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                            placeholder="+251 9xx xxx xxx"
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor="specialRequests">Special Requests</FieldLabel>
                        <Textarea
                          id="specialRequests"
                          rows={3}
                          value={formData.specialRequests}
                          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                          placeholder="Dietary requirements, accessibility needs, etc."
                        />
                      </Field>
                    </FieldGroup>
                  </CardContent>
                </Card>

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={
                    submitting ||
                    !isAuthenticated ||
                    (!departure && !flexibleDate) ||
                    (departure ? totalPax > departure.available_seats : false)
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Confirm Booking — ${formatCurrency(totalPrice, currency)}`
                  )}
                </Button>

                {pkg.cancellation_policy && (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    {pkg.cancellation_policy}
                  </p>
                )}
              </form>
            </div>

            {/* Booking Summary */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="pt-6">
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={primaryPhoto || "/placeholder.svg?height=200&width=400&query=travel experience"}
                      alt={pkg.title}
                      className="h-40 w-full object-cover"
                    />
                  </div>

                  <h3 className="font-semibold">{pkg.title}</h3>
                  {pkg.nickname && (
                    <p className="text-sm text-muted-foreground">{pkg.nickname}</p>
                  )}

                  <div className="mt-3 flex items-center gap-3 text-sm">
                    {pkg.average_rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        {formatRating(pkg.average_rating)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {pkg.duration_days} Days
                    </span>
                  </div>

                  {pkg.cities && pkg.cities.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {pkg.cities.map((c) => c.city.name).join(" → ")}
                    </div>
                  )}

                  {departure ? (
                    <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(departure.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" – "}
                      {new Date(departure.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  ) : flexibleDate ? (
                    <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Preferred: {new Date(flexibleDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  ) : null}

                  {/* Price Breakdown */}
                  <div className="mt-6 space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Adults ({formData.numAdults} × {formatCurrency(pricePerPerson, currency)})</span>
                      <span>{formatCurrency(adultTotal, currency)}</span>
                    </div>
                    {formData.numChildren > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Children ({formData.numChildren} × {formatCurrency(childPrice, currency)})</span>
                        <span>{formatCurrency(childTotal, currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(totalPrice, currency)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Secure booking with instant confirmation</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <FloatingAIAssistant />
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
    </div>
  )
}
