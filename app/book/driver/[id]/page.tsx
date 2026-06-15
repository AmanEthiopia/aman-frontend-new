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
import {
  ArrowLeft, MapPin, Star, Shield, Car,
  Loader2, CheckCircle, AlertCircle,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { getTransportById } from "@/lib/api/transport"
import { createDriverBooking, getMyDriverBookings } from "@/lib/api/bookings"
import type { Transport } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { getMediaUrl } from "@/lib/utils/media"
import { formatRating } from "@/lib/utils"

export default function BookDriverPage() {
  const params = useParams()
  const router = useRouter()
  const idOrSlug = params.id as string
  const { isAuthenticated, userProfile } = useAuth()

  const [transport, setTransport] = useState<Transport | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [bookingNumber, setBookingNumber] = useState<string | null>(null)
  const [existingBookings, setExistingBookings] = useState<any[]>([])
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    trip_date: "",
    pickup_time: "09:00",
    pickup_location: "",
    dropoff_location: "",
    num_passengers: 1,
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    special_requests: "",
  })

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getTransportById(idOrSlug)
        setTransport(data)
      } catch {
        setError("Transport option not found")
      } finally {
        setLoading(false)
      }
    }
    if (idOrSlug) load()
  }, [idOrSlug])

  useEffect(() => {
    if (userProfile) {
      const user = userProfile.user
      setFormData((prev) => ({
        ...prev,
        guest_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        guest_email: user.email || "",
        guest_phone: user.phone || "",
      }))
      getMyDriverBookings().then(setExistingBookings).catch(() => {})
    }
  }, [userProfile])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const rateDisplay = (() => {
    const t = transport as any
    if (!t) return null
    if (t.price_per_day) return `$${t.price_per_day} / day`
    if (t.price_per_hour) return `$${t.price_per_hour} / hour`
    if (t.pricePerTrip) return `$${t.pricePerTrip} / trip`
    if (t.pricePerDay) return `$${t.pricePerDay} / day`
    return null
  })()

  const doSubmit = async () => {
    if (!transport) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await createDriverBooking({
        driver_id: transport.id,
        trip_date: formData.trip_date,
        pickup_time: formData.pickup_time,
        pickup_location: formData.pickup_location,
        dropoff_location: formData.dropoff_location,
        num_passengers: formData.num_passengers,
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone || undefined,
        special_requests: formData.special_requests || undefined,
      })
      setBookingNumber(response.booking_number)
      setSuccess(true)
      toast.success("Booking request submitted!")
    } catch (err: any) {
      const message = err?.message || "Failed to submit booking. Please try again."
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error("Please log in to book transport")
      router.push(`/login?redirect=/book/driver/${idOrSlug}`)
      return
    }
    if (!transport) return

    if (!formData.pickup_location.trim() || !formData.dropoff_location.trim()) {
      setError("Please enter both pickup and drop-off locations.")
      return
    }

    // Duplicate check: same driver + same date
    if (formData.trip_date) {
      const duplicate = existingBookings
        .filter((b) => b.status !== "cancelled" && b.status !== "rejected")
        .find((b) => (b.driver_id === transport.id) && b.trip_date === formData.trip_date)
      if (duplicate) {
        setDuplicateWarning(
          `You already have an active booking for "${transport.name}" on ${formData.trip_date}. Are you sure you want to request another?`
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
              <div className="lg:col-span-2"><Skeleton className="h-96 w-full rounded-xl" /></div>
              <div><Skeleton className="h-64 w-full rounded-xl" /></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error && !transport) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            <h1 className="mb-2 text-2xl font-bold">Not Found</h1>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={() => router.push("/transport")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transport
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
              Your request has been sent to the driver for confirmation.
            </p>
            {bookingNumber && <p className="mb-6 font-mono text-lg">{bookingNumber}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild><Link href="/bookings">View My Bookings</Link></Button>
              <Button variant="outline" asChild><Link href="/transport">Browse More Transport</Link></Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const photoUrl = getMediaUrl((transport as any)?.cover_photo || transport?.images?.[0]?.url)
  const cityName = (transport as any)?.city_name || transport?.city?.name || "Ethiopia"

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="mb-8 text-2xl font-bold">Book Transport</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Trip Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="trip_date">Trip Date *</Label>
                        <Input
                          id="trip_date"
                          type="date"
                          value={formData.trip_date}
                          onChange={(e) => handleChange("trip_date", e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_time">Pickup Time *</Label>
                        <Input
                          id="pickup_time"
                          type="time"
                          value={formData.pickup_time}
                          onChange={(e) => handleChange("pickup_time", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickup_location">Pickup Location *</Label>
                      <Input
                        id="pickup_location"
                        placeholder="e.g. Bole International Airport"
                        value={formData.pickup_location}
                        onChange={(e) => handleChange("pickup_location", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dropoff_location">Drop-off Location *</Label>
                      <Input
                        id="dropoff_location"
                        placeholder="e.g. Sheraton Addis"
                        value={formData.dropoff_location}
                        onChange={(e) => handleChange("dropoff_location", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:max-w-[50%]">
                      <Label htmlFor="num_passengers">Passengers *</Label>
                      <Input
                        id="num_passengers"
                        type="number"
                        min={1}
                        max={20}
                        value={formData.num_passengers}
                        onChange={(e) => handleChange("num_passengers", parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>

                    <Separator />

                    {/* Guest Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Your Information</h3>
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

                    <div className="space-y-2">
                      <Label htmlFor="special_requests">Special Requests</Label>
                      <Textarea
                        id="special_requests"
                        value={formData.special_requests}
                        onChange={(e) => handleChange("special_requests", e.target.value)}
                        placeholder="Flight number, luggage, child seat, etc."
                        rows={3}
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                        <AlertCircle className="mb-1 inline h-4 w-4" /> {error}
                      </div>
                    )}

                    <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                      ) : (
                        <>Request Booking</>
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      This is a request. The driver confirms availability and the final fare.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={photoUrl || "/car-driver.jpg"}
                      alt={transport?.name || "Driver"}
                      className="h-40 w-full object-cover"
                    />
                  </div>

                  <h3 className="mb-1 font-semibold line-clamp-2">{transport?.name}</h3>

                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    {(transport?.isVerified ?? (transport as any)?.is_verified) && (
                      <span className="flex items-center gap-1 text-primary">
                        <Shield className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      {formatRating((transport as any)?.average_rating ?? transport?.rating)}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {cityName}
                    </div>
                    {((transport as any)?.vehicle_type || transport?.vehicleType) && (
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        {(transport as any)?.vehicle_type || transport?.vehicleType}
                      </div>
                    )}
                  </div>

                  {rateDisplay && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-semibold">{rateDisplay}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Final fare is confirmed by the driver based on your route.
                      </p>
                    </>
                  )}
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
