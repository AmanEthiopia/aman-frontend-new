"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
import {
  getExperienceBySlug,
  createPackageBooking,
  type Package,
} from "@/lib/api/experiences"
import { useAuth } from "@/contexts/auth-context"
import { APIError } from "@/lib/api/client"
import { formatRating } from "@/lib/utils"
import {
  ArrowLeft,
  Calendar,
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
} from "lucide-react"

function formatCurrency(amount: string | number, currency = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

export default function BookExperiencePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string
  const { user, isAuthenticated } = useAuth()

  const [pkg, setPkg] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingNumber, setBookingNumber] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    startDate: "",
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
        
        // Pre-fill user info if authenticated
        if (user) {
          setFormData(prev => ({
            ...prev,
            guestName: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            guestEmail: user.email || "",
            guestPhone: user.phone || "",
          }))
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
  }, [slug, user])

  // Calculate pricing
  const pricePerPerson = pkg ? parseFloat(pkg.price_per_person) : 0
  const childPrice = pkg?.child_price ? parseFloat(pkg.child_price) : pricePerPerson * 0.5
  const adultTotal = pricePerPerson * formData.numAdults
  const childTotal = childPrice * formData.numChildren
  const totalPrice = adultTotal + childTotal
  const currency = pkg?.price_currency || "USD"

  // Date validation
  const today = new Date()
  const minDate = new Date(today.setDate(today.getDate() + 1)).toISOString().split("T")[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pkg || !isAuthenticated) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await createPackageBooking({
        package_id: pkg.id,
        start_date: formData.startDate,
        num_adults: formData.numAdults,
        num_children: formData.numChildren,
        guest_name: formData.guestName,
        guest_email: formData.guestEmail,
        guest_phone: formData.guestPhone || undefined,
        special_requests: formData.specialRequests || undefined,
      })

      setBookingNumber(response.booking.booking_number)
      setSuccess(true)

      // If payment is required, redirect to payment
      if (response.payment?.required && response.payment.client_secret) {
        // TODO: Integrate Stripe payment
        // For now, just show success
      }
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
                {bookingNumber && (
                  <p className="mt-4 rounded-lg bg-muted p-3 font-mono text-lg">
                    Booking #: {bookingNumber}
                  </p>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  A confirmation email has been sent to {formData.guestEmail}.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <Link href="/account/bookings">
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

  const primaryPhoto = pkg.primary_photo?.photo_url || pkg.photos?.[0]?.photo_url

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
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
                <Link href={`/auth/login?redirect=/book/experience/${slug}`} className="font-medium underline">
                  sign in
                </Link>{" "}
                to complete your booking.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Trip Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="startDate">Start Date *</FieldLabel>
                        <Input
                          id="startDate"
                          type="date"
                          min={minDate}
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {pkg.duration_days}-day experience starting on this date
                        </p>
                      </Field>

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
                              disabled={pkg.max_group_size ? formData.numAdults + formData.numChildren >= pkg.max_group_size : false}
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
                              disabled={pkg.max_group_size ? formData.numAdults + formData.numChildren >= pkg.max_group_size : false}
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
                  disabled={submitting || !isAuthenticated}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Confirm Booking - ${formatCurrency(totalPrice, currency)}`
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
                  {/* Package Preview */}
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

                  <div className="mt-4 flex items-center gap-2 text-sm">
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
                      {pkg.cities.map(c => c.city.name).join(" → ")}
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="mt-6 space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>
                        Adults ({formData.numAdults} x {formatCurrency(pricePerPerson, currency)})
                      </span>
                      <span>{formatCurrency(adultTotal, currency)}</span>
                    </div>
                    {formData.numChildren > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>
                          Children ({formData.numChildren} x {formatCurrency(childPrice, currency)})
                        </span>
                        <span>{formatCurrency(childTotal, currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(totalPrice, currency)}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
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
    </div>
  )
}
