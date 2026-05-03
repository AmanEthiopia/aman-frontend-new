"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Car,
  MapPin,
  Users,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  Loader2,
  Phone,
  MessageSquare,
  Shield,
} from "lucide-react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactDialog } from "@/components/messaging/contact-dialog"
import { getTransportById } from "@/lib/api/transport"
import { getMediaUrl } from "@/lib/utils/media"
import type { Transport } from "@/lib/types"

const vehicleTypeLabels: Record<string, string> = {
  sedan: "Sedan",
  suv: "SUV",
  van: "Van",
  minibus: "Minibus",
  bus: "Bus",
  motorcycle: "Motorcycle",
}

const serviceLabels: Record<string, string> = {
  airport_pickup: "Airport Pickup",
  airport_dropoff: "Airport Drop-off",
  city_tour: "City Tour",
  intercity: "Intercity",
  hourly_rental: "Hourly Rental",
  daily_rental: "Daily Rental",
  hotel_transfer: "Hotel Transfer",
}

export default function TransportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [transport, setTransport] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getTransportById(id)
        setTransport(data)
      } catch {
        setTransport(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!transport) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Transport service not found</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  const coverUrl =
    getMediaUrl(transport.cover_photo_url ?? transport.cover_photo ?? transport.images?.[0]?.url) ||
    "/car-driver.jpg"

  const rating = transport.average_rating
    ? parseFloat(String(transport.average_rating))
    : transport.rating ?? 0

  const services: string[] = transport.services ?? []
  const languages: string[] = transport.languages ?? []

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="relative h-72 w-full overflow-hidden bg-muted md:h-96">
          <img src={coverUrl} alt={transport.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <div className="mb-2 flex flex-wrap gap-2">
              {transport.is_verified && (
                <Badge className="bg-green-500 text-white">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
              {transport.vehicle_type && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {vehicleTypeLabels[transport.vehicle_type] ?? transport.vehicle_type}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">{transport.name}</h1>
            {(transport.city_name ?? transport.city?.name) && (
              <div className="mt-1 flex items-center gap-1 text-white/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{transport.city_name ?? transport.city?.name}</span>
              </div>
            )}
          </div>
          <div className="absolute left-4 top-4">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/40 text-white hover:bg-black/60"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main */}
            <div className="space-y-6 lg:col-span-2">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    About This Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{transport.description}</p>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {transport.vehicle_type && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Vehicle Type</p>
                        <p className="mt-0.5 font-semibold capitalize">
                          {vehicleTypeLabels[transport.vehicle_type] ?? transport.vehicle_type}
                        </p>
                      </div>
                    )}
                    {transport.vehicle_make && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Make</p>
                        <p className="mt-0.5 font-semibold">{transport.vehicle_make}</p>
                      </div>
                    )}
                    {transport.vehicle_model && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Model</p>
                        <p className="mt-0.5 font-semibold">{transport.vehicle_model}</p>
                      </div>
                    )}
                    {transport.vehicle_year && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Year</p>
                        <p className="mt-0.5 font-semibold">{transport.vehicle_year}</p>
                      </div>
                    )}
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Max Passengers</p>
                      <p className="mt-0.5 font-semibold">{transport.max_passengers ?? "—"}</p>
                    </div>
                    {transport.address && (
                      <div className="rounded-lg bg-muted/50 p-3 sm:col-span-2">
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="mt-0.5 font-semibold">{transport.address}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              {services.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {services.map((s) => (
                        <Badge key={s} variant="secondary">
                          {serviceLabels[s] ?? s}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        {transport.is_airport_pickup ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>Airport Pickup</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {transport.is_available_24h ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>Available 24/7</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Languages */}
              {languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Languages Spoken
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Rating */}
              {rating > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xl font-bold text-primary">{rating.toFixed(1)}</span>
                      </div>
                      <div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {transport.review_count ?? 0} reviews
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {transport.price_per_km != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per km</span>
                      <span className="font-semibold">${transport.price_per_km}</span>
                    </div>
                  )}
                  {transport.price_per_hour != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per hour</span>
                      <span className="font-semibold">${transport.price_per_hour}</span>
                    </div>
                  )}
                  {transport.price_per_day != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per day</span>
                      <span className="font-semibold">${transport.price_per_day}</span>
                    </div>
                  )}
                  {transport.pricePerTrip != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per trip</span>
                      <span className="font-semibold">${transport.pricePerTrip}</span>
                    </div>
                  )}
                  {transport.price_per_km == null &&
                    transport.price_per_hour == null &&
                    transport.price_per_day == null &&
                    transport.pricePerTrip == null && (
                      <p className="text-muted-foreground">Contact for pricing</p>
                    )}
                </CardContent>
              </Card>

              {/* Contact / Message */}
              <Card>
                <CardContent className="space-y-3 pt-6">
                  {transport.provider_id && (
                    <ContactDialog
                      recipientId={transport.provider_id}
                      recipientName={transport.name}
                      relatedToType="general"
                      relatedToId={transport.id}
                      relatedToName={transport.name}
                    >
                      <Button className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message Driver
                      </Button>
                    </ContactDialog>
                  )}
                  {transport.contactPhone && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${transport.contactPhone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        {transport.contactPhone}
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
