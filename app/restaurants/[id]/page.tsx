"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getRestaurantById } from "@/lib/api/restaurants"
import { ContactDialog } from "@/components/messaging/contact-dialog"
import { getRestaurantMenu } from "@/lib/api/restaurants"
import type { MenuCategory } from "@/lib/api/restaurants"
import { createRestaurantReservation } from "@/lib/api/bookings"
import type { RestaurantReservation } from "@/lib/api/bookings"
import { getMediaUrl } from "@/lib/utils/media"
import { APIError } from "@/lib/api/client"
import type { Restaurant } from "@/lib/types"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Heart,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Wifi,
  ParkingCircle,
  Truck,
  CalendarCheck,
  Star,
  Utensils,
  Shield,
  Minus,
  Plus,
  CheckCircle2,
  Flame,
  ShoppingBag,
} from "lucide-react"
import { useApp } from "@/lib/contexts/app-context"
import { AddToItineraryButton } from "@/components/itinerary/add-to-itinerary-button"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { toast } from "sonner"

// ─── helpers ────────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "3 hours", value: 180 },
  { label: "4 hours", value: 240 },
]

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const totalMin = 7 * 60 + i * 30
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  const label = `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`
  const value = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  return { label, value }
})

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  const period = nh < 12 ? "AM" : "PM"
  const display = `${nh % 12 === 0 ? 12 : nh % 12}:${nm.toString().padStart(2, "0")} ${period}`
  return display
}

function priceRangeDisplay(range?: string) {
  const map: Record<string, string> = {
    budget: "$",
    moderate: "$$",
    mid_range: "$$",
    upscale: "$$$",
    fine_dining: "$$$$",
    luxury: "$$$$",
  }
  return map[range ?? ""] ?? range ?? ""
}

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
}

// ─── MenuSection ─────────────────────────────────────────────────────────────

function MenuSection({ slug }: { slug: string }) {
  const [menu, setMenu] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("")
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getRestaurantMenu(slug)
      .then((data) => {
        setMenu(data.categories ?? [])
        if (data.categories?.[0]) setActiveTab(data.categories[0].category)
      })
      .catch(() => setMenu([]))
      .finally(() => setLoading(false))
  }, [slug])

  const scrollToCategory = (cat: string) => {
    setActiveTab(cat)
    categoryRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
      </div>
    )
  }

  if (menu.length === 0) return null

  return (
    <div>
      {/* Sticky category tabs */}
      <div
        ref={tabsRef}
        className="sticky top-16 z-10 -mx-4 mb-6 flex gap-2 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur-sm"
      >
        {menu.map((cat) => (
          <button
            key={cat.category}
            onClick={() => scrollToCategory(cat.category)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === cat.category
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Category sections */}
      <div className="space-y-8">
        {menu.map((cat) => (
          <div
            key={cat.category}
            ref={(el) => { categoryRefs.current[cat.category] = el }}
          >
            <h3 className="mb-4 text-lg font-semibold">{cat.category}</h3>
            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-4 rounded-xl border p-3 transition-opacity ${
                    item.is_available ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.photo_url ? (
                      <img
                        src={getMediaUrl(item.photo_url) || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Utensils className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    {!item.is_available && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                        <span className="text-xs font-semibold text-white">Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium leading-tight">{item.name}</span>
                        {item.is_popular && (
                          <Badge className="shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                            <Flame className="mr-1 h-3 w-3" />
                            Popular
                          </Badge>
                        )}
                        {!item.is_available && (
                          <Badge variant="secondary" className="shrink-0 text-xs">Sold Out</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                      {item.dietary_tags && item.dietary_tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.dietary_tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                              {tag === "vegan" ? "🌱" : tag === "vegetarian" ? "🥦" : "✓"} {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-right font-semibold text-sm">
                      {item.currency} {parseFloat(item.price).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ReservationForm ──────────────────────────────────────────────────────────

function ReservationForm({ restaurant }: { restaurant: Restaurant }) {
  const today = new Date().toISOString().split("T")[0]
  const [date, setDate] = useState(today)
  const [time, setTime] = useState("19:00")
  const [duration, setDuration] = useState(90)
  const [partySize, setPartySize] = useState(2)
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<RestaurantReservation | null>(null)

  const endTime = addMinutes(time, duration)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName || !guestEmail) {
      toast.error("Please fill in your name and email")
      return
    }
    setSubmitting(true)
    try {
      const result = await createRestaurantReservation({
        restaurant_id: restaurant.id,
        reservation_date: date,
        reservation_time: time,
        duration_minutes: duration,
        party_size: partySize,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || undefined,
        special_requests: specialRequests || undefined,
      })
      setConfirmed(result.reservation)
      toast.success("Reservation submitted!")
    } catch (err) {
      toast.error(err instanceof APIError ? err.message : "Failed to submit reservation")
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-lg font-semibold">Reservation Submitted!</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reservation #</span>
              <span className="font-mono font-semibold">{confirmed.reservation_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400">
                Pending — awaiting confirmation
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date &amp; Time</span>
              <span className="font-medium">{confirmed.reservation_date} at {confirmed.reservation_time?.slice(0, 5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Party Size</span>
              <span className="font-medium">{confirmed.party_size} guests</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            The restaurant will confirm your reservation. Check your bookings page for updates.
          </p>
          <Link href="/bookings">
            <Button variant="outline" size="sm" className="mt-3 w-full">
              View My Bookings
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Reserve a Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Time */}
          <div>
            <Label>Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div>
            <Label>Duration</Label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((d) => (
                  <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              Ends at {endTime}
            </p>
          </div>

          {/* Party size */}
          <div>
            <Label>Party Size</Label>
            <div className="mt-1 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setPartySize((p) => Math.max(1, p - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{partySize}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setPartySize((p) => Math.min(50, p + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">guests</span>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div>
              <Label>Your Name</Label>
              <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full name" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+251..." />
            </div>
            <div>
              <Label>Special Requests (optional)</Label>
              <Textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Window seat, dietary needs, celebration..."
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Request Reservation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RestaurantDetailPage() {
  const params = useParams()
  const slug = params.id as string
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const { toggleSavedItem, isItemSaved } = useApp()

  useEffect(() => {
    setLoading(true)
    setError(null)
    getRestaurantById(slug)
      .then(setRestaurant)
      .catch((err) => setError(err instanceof APIError ? err.message : "Failed to load restaurant."))
      .finally(() => setLoading(false))
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
  const photos: string[] = [
    getMediaUrl(restaurant.cover_photo) || getMediaUrl(restaurant.cover_photo_url) || "",
    ...(restaurant.photos ?? []).map((p) => getMediaUrl(p.url ?? p.photo_url) || ""),
  ].filter(Boolean)
  const heroPhoto = photos[photoIndex] || "/placeholder.svg?height=500&width=900&text=Restaurant"
  const rating = restaurant.average_rating ? parseFloat(String(restaurant.average_rating)) : undefined

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back link */}
          <Link href="/restaurants" className="mb-6 flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Restaurants
          </Link>

          {/* Title + actions */}
          <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                {restaurant.is_verified && (
                  <Badge className="flex items-center gap-1 bg-primary text-primary-foreground">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {restaurant.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {restaurant.address}{restaurant.city_name ? `, ${restaurant.city_name}` : ""}
                  </span>
                )}
                {rating !== undefined && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {rating.toFixed(1)}
                    {restaurant.review_count ? ` (${restaurant.review_count})` : ""}
                  </span>
                )}
                {restaurant.price_range && (
                  <span className="font-semibold text-foreground">{priceRangeDisplay(restaurant.price_range)}</span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {restaurant.cuisine_types?.map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => toggleSavedItem(`restaurant-${restaurant.id}`)}>
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current text-red-500" : ""}`} />
              </Button>
              <AddToItineraryButton itemType="restaurant" itemId={restaurant.id} itemName={restaurant.name} />
            </div>
          </div>

          {/* Hero carousel */}
          <div className="relative mb-8 overflow-hidden rounded-xl bg-muted">
            <img
              src={heroPhoto}
              alt={restaurant.name}
              className="h-72 w-full object-cover md:h-96"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`h-2 w-2 rounded-full transition-colors ${i === photoIndex ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Feature badges */}
          <div className="mb-8 flex flex-wrap gap-3">
            {restaurant.has_wifi && (
              <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
                <Wifi className="h-4 w-4 text-primary" /> Free WiFi
              </div>
            )}
            {restaurant.has_parking && (
              <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
                <ParkingCircle className="h-4 w-4 text-primary" /> Parking
              </div>
            )}
            {restaurant.delivery_available && (
              <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
                <Truck className="h-4 w-4 text-primary" /> Delivery
              </div>
            )}
            {restaurant.accepts_reservations && (
              <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
                <CalendarCheck className="h-4 w-4 text-primary" /> Reservations
              </div>
            )}
            {restaurant.has_dine_in && (
              <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
                <Utensils className="h-4 w-4 text-primary" /> Dine-in
              </div>
            )}
            {restaurant.has_takeaway && (
              <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
                <ShoppingBag className="h-4 w-4 text-primary" /> Takeaway
              </div>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-8 lg:col-span-2">
              {/* About */}
              {restaurant.description && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="mb-3 text-xl font-semibold">About</h2>
                    <p className="whitespace-pre-line text-muted-foreground">{restaurant.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Info strip */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="mb-4 text-xl font-semibold">Info</h2>
                  <div className="space-y-3 text-sm">
                    {restaurant.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>{restaurant.address}{restaurant.city_name ? `, ${restaurant.city_name}` : ""}</span>
                      </div>
                    )}
                    {restaurant.phone && (
                      <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Phone className="h-4 w-4 shrink-0" />
                        {restaurant.phone}
                      </a>
                    )}
                    {restaurant.email && (
                      <a href={`mailto:${restaurant.email}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Mail className="h-4 w-4 shrink-0" />
                        {restaurant.email}
                      </a>
                    )}
                    {restaurant.website && (
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <Globe className="h-4 w-4 shrink-0" />
                        Website
                      </a>
                    )}
                    {restaurant.seating_capacity && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Utensils className="h-4 w-4 shrink-0" />
                        Seats {restaurant.seating_capacity}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Opening hours */}
              {restaurant.opening_hours && Object.keys(restaurant.opening_hours).length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                      <Clock className="h-5 w-5" /> Opening Hours
                    </h2>
                    <div className="space-y-2">
                      {DAY_ORDER.map((day) => {
                        const hours = restaurant.opening_hours?.[day]
                        if (!hours) return null
                        return (
                          <div key={day} className="flex items-center justify-between text-sm">
                            <span className="w-12 font-medium capitalize">{DAY_LABELS[day]}</span>
                            <span className="text-muted-foreground">{hours}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Menu */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                    <Utensils className="h-5 w-5" /> Menu
                  </h2>
                  <MenuSection slug={slug} />
                </CardContent>
              </Card>

              {/* Reviews */}
              <ReviewsSection
                contentType="restaurant"
                contentId={restaurant.id}
                averageRating={rating ?? 0}
                reviewCount={restaurant.review_count ?? 0}
              />
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Reservation form — shown unless explicitly disabled */}
              {restaurant.accepts_reservations !== false && (
                <ReservationForm restaurant={restaurant} />
              )}
              {restaurant.accepts_reservations === false && (
                <Card>
                  <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                    <CalendarCheck className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    This restaurant does not accept online reservations. Please call to book.
                    {restaurant.phone && (
                      <a href={`tel:${restaurant.phone}`} className="mt-2 block font-medium text-primary hover:underline">
                        {restaurant.phone}
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contact */}
              {restaurant.provider_id ? (
                <ContactDialog
                  recipientId={restaurant.provider_id}
                  recipientName={restaurant.name}
                  relatedToType="restaurant"
                  relatedToId={restaurant.id}
                  relatedToName={restaurant.name}
                >
                  <Button variant="outline" size="lg" className="w-full">
                    Send Message
                  </Button>
                </ContactDialog>
              ) : (
                <Link href="/messages">
                  <Button variant="outline" size="lg" className="w-full">
                    Send Message
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
      <FloatingAIAssistant />
      <Footer />
    </div>
  )
}
