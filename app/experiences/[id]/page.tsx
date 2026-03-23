"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getExperienceBySlug, type Package, type PackageDay, type PackageDayItem } from "@/lib/api/experiences"
import { APIError } from "@/lib/api/client"
import {
  MapPin,
  ArrowLeft,
  Heart,
  Share2,
  AlertCircle,
  Clock,
  DollarSign,
  Users,
  Star,
  Calendar,
  Check,
  X,
  Hotel,
  Utensils,
  Landmark,
  Activity,
  Globe,
  ChevronRight,
  Backpack,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useApp } from "@/lib/contexts/app-context"
import { AddToItineraryButton } from "@/components/itinerary/add-to-itinerary-button"

const CATEGORY_LABELS: Record<string, string> = {
  city_tour: "City Tour",
  multi_city: "Multi-City",
  adventure: "Adventure",
  culture: "Cultural",
  food: "Food & Culinary",
  nature: "Nature",
  spiritual: "Spiritual",
  historical: "Historical",
}

const ITEM_TYPE_ICONS: Record<string, React.ReactNode> = {
  hotel: <Hotel className="h-4 w-4" />,
  restaurant: <Utensils className="h-4 w-4" />,
  attraction: <Landmark className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />,
}

function formatCurrency(amount: string | number, currency = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

function DayItemCard({ item }: { item: PackageDayItem }) {
  const icon = ITEM_TYPE_ICONS[item.item_type] || <Activity className="h-4 w-4" />
  
  let title = item.title
  let subtitle: string | undefined
  let link: string | undefined
  
  if (item.item_type === "hotel" && item.hotel) {
    title = item.hotel.name
    subtitle = item.hotel.address
    link = `/hotels/${item.hotel.slug}`
  } else if (item.item_type === "restaurant" && item.restaurant) {
    title = item.restaurant.name
    subtitle = item.restaurant.cuisine_type
    link = `/restaurants/${item.restaurant.slug}`
  } else if (item.item_type === "attraction" && item.attraction) {
    title = item.attraction.name
    subtitle = item.attraction.category
    link = `/attractions/${item.attraction.slug}`
  }

  const content = (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{title}</p>
          {item.duration_minutes && (
            <Badge variant="secondary" className="shrink-0">
              {item.duration_minutes} min
            </Badge>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground capitalize">{subtitle}</p>}
        {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
        {item.notes && <p className="mt-1 text-xs text-muted-foreground italic">{item.notes}</p>}
      </div>
      {link && <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
    </div>
  )

  if (link) {
    return <Link href={link}>{content}</Link>
  }
  return content
}

function ItineraryDay({ day, dayNumber }: { day: PackageDay; dayNumber: number }) {
  return (
    <div className="relative">
      {/* Timeline connector */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
      
      <div className="flex gap-4">
        {/* Day number circle */}
        <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
          {dayNumber}
        </div>
        
        <div className="flex-1 pb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{day.title}</h3>
            {day.city && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {day.city.name}
              </p>
            )}
            {day.description && (
              <p className="mt-2 text-muted-foreground">{day.description}</p>
            )}
          </div>
          
          {/* Day items */}
          <div className="space-y-3">
            {day.items
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <DayItemCard key={item.id} item={item} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExperienceDetailPage() {
  const params = useParams()
  const slug = params.id as string
  const [pkg, setPkg] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toggleSavedItem, isItemSaved } = useApp()

  useEffect(() => {
    async function loadPackage() {
      setLoading(true)
      setError(null)

      try {
        const data = await getExperienceBySlug(slug)
        setPkg(data)
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message)
        } else {
          setError("Failed to load experience details. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadPackage()
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

  const isSaved = isItemSaved(`experience-${pkg.id}`)
  const sortedDays = pkg.days?.sort((a, b) => a.day_number - b.day_number) || []
  const primaryPhoto = pkg.primary_photo?.photo_url || pkg.photos?.[0]?.photo_url
  const priceDisplay = formatCurrency(pkg.price_per_person, pkg.price_currency)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative h-[50vh] min-h-[400px]">
          <img
            src={primaryPhoto || "/placeholder.svg?height=600&width=1200&query=travel experience"}
            alt={pkg.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <Link href="/experiences" className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to Experiences
              </Link>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary">{CATEGORY_LABELS[pkg.category] || pkg.category}</Badge>
                {pkg.average_rating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {parseFloat(pkg.average_rating).toFixed(1)}
                    {pkg.review_count && <span className="text-muted-foreground">({pkg.review_count})</span>}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold text-white">{pkg.title}</h1>
              {pkg.nickname && <p className="text-xl text-white/80">{pkg.nickname}</p>}
              
              {/* Quick stats */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {pkg.duration_days} Days
                </span>
                {pkg.cities && pkg.cities.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {pkg.cities.map(c => c.city.name).join(" → ")}
                  </span>
                )}
                {pkg.languages && pkg.languages.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {pkg.languages.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6 w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Description */}
                  {(pkg.description || pkg.short_description) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>About This Experience</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line text-muted-foreground">
                          {pkg.description || pkg.short_description}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* What's Included / Excluded */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {pkg.what_included && pkg.what_included.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">What's Included</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {pkg.what_included.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    {pkg.what_excluded && pkg.what_excluded.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">What's Not Included</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {pkg.what_excluded.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* What to Bring */}
                  {pkg.what_to_bring && pkg.what_to_bring.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Backpack className="h-5 w-5" />
                          What to Bring
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {pkg.what_to_bring.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Cities covered */}
                  {pkg.cities && pkg.cities.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Destinations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          {pkg.cities
                            .sort((a, b) => a.order - b.order)
                            .map((cityEntry) => (
                              <Link
                                key={cityEntry.id}
                                href={`/cities/${cityEntry.city.slug}`}
                                className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 transition-colors hover:bg-muted"
                              >
                                <MapPin className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="font-medium">{cityEntry.city.name}</p>
                                  {cityEntry.night_count > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      {cityEntry.night_count} night{cityEntry.night_count > 1 ? "s" : ""}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="itinerary" className="space-y-6">
                  {sortedDays.length > 0 ? (
                    <div className="space-y-2">
                      {sortedDays.map((day) => (
                        <ItineraryDay key={day.id} day={day} dayNumber={day.day_number} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">Itinerary Coming Soon</h3>
                        <p className="text-muted-foreground">
                          The detailed day-by-day itinerary will be available shortly.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                      <CardContent className="flex items-center gap-4 pt-6">
                        <Clock className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-lg font-semibold">{pkg.duration_days} Days</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {pkg.max_group_size && (
                      <Card>
                        <CardContent className="flex items-center gap-4 pt-6">
                          <Users className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Group Size</p>
                            <p className="text-lg font-semibold">
                              {pkg.min_group_size ? `${pkg.min_group_size} - ` : "Up to "}
                              {pkg.max_group_size} people
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {pkg.meeting_point && (
                      <Card className="sm:col-span-2">
                        <CardContent className="flex items-center gap-4 pt-6">
                          <MapPin className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Meeting Point</p>
                            <p className="text-lg font-semibold">{pkg.meeting_point}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Cancellation Policy */}
                  {pkg.cancellation_policy && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Cancellation Policy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{pkg.cancellation_policy}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Organizer */}
                  {pkg.organizer && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Organized By</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">{pkg.organizer.name}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Booking Card */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="text-3xl font-bold">
                      {priceDisplay}
                      <span className="text-base font-normal text-muted-foreground"> / person</span>
                    </p>
                    {pkg.child_price && parseFloat(pkg.child_price) > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Children: {formatCurrency(pkg.child_price, pkg.price_currency)}
                      </p>
                    )}
                  </div>

                  <div className="mb-6 space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{pkg.duration_days} Days</span>
                    </div>
                    {pkg.max_group_size && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Max Group</span>
                        <span className="font-medium">{pkg.max_group_size} people</span>
                      </div>
                    )}
                    {pkg.languages && pkg.languages.length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Languages</span>
                        <span className="font-medium">{pkg.languages.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleSavedItem(`experience-${pkg.id}`)}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? "fill-current text-red-500" : ""}`} />
                    </Button>
<Button variant="outline" size="icon">
<Share2 className="h-4 w-4" />
</Button>
<AddToItineraryButton
  itemType="experience"
  itemId={pkg.id}
  itemName={pkg.title}
/>
</div>

<Link href={`/book/experience/${pkg.slug}`}>
                    <Button className="w-full" size="lg">
                      Book Now
                    </Button>
                  </Link>

                  {!pkg.payment_required && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      No upfront payment required
                    </p>
                  )}
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
