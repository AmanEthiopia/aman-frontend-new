"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCityDetail, getAttractions, getSafetyInfo, type CityDetail, type Attraction, type SafetyInfo } from "@/lib/api/content"
import { searchHotels } from "@/lib/api/hotels"
import { getRestaurantsPaginated } from "@/lib/api/restaurants"
import { getExperiencesPaginated } from "@/lib/api/experiences"
import { ArrowLeft, Hotel, Utensils, Compass, Shield, MapPin, Loader2, Car } from "lucide-react"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { notFound } from "next/navigation"

const API_BASE = "https://api.aman.yichalal.ai"

// Live counts fetched using the same endpoints as listing pages
interface LiveCounts {
  hotels: number
  restaurants: number
  experiences: number
  attractions: number
}

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  if (!path.startsWith("/")) return `${API_BASE}/media/${path}`
  return `${API_BASE}${path}`
}

export default function CityDetailPage() {
  const params = useParams()
  const slug = params.id as string
  
  const [city, setCity] = useState<CityDetail | null>(null)
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [safetyInfo, setSafetyInfo] = useState<SafetyInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveCounts, setLiveCounts] = useState<LiveCounts>({
    hotels: 0,
    restaurants: 0,
    experiences: 0,
    attractions: 0,
  })
  const [countsLoading, setCountsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setCountsLoading(true)
        const cityData = await getCityDetail(slug)
        setCity(cityData)
        
        // Load attractions and safety info for this city using slug for consistent filtering
        const [attractionsData, safetyData] = await Promise.all([
          getAttractions({ city: slug }).catch(() => []),
          getSafetyInfo({ city: slug }).catch(() => [])
        ])
        
        setAttractions(attractionsData)
        setSafetyInfo(safetyData)
        
        // Set initial counts from city detail (may be cached/stale)
        setLiveCounts({
          hotels: cityData.hotels_count || 0,
          restaurants: cityData.restaurants_count || 0,
          experiences: cityData.experiences_count || 0,
          attractions: attractionsData.length,
        })
        setCountsLoading(false)
        
        // Fetch live counts from the same endpoints used by listing pages
        // This ensures counts match what users see when they click through
        fetchLiveCounts(slug)
      } catch (err) {
        setError("City not found")
      } finally {
        setLoading(false)
      }
    }
    
    if (slug) {
      loadData()
    }
  }, [slug])
  
  // Fetch live counts using the same API endpoints as listing pages
  async function fetchLiveCounts(citySlug: string) {
    try {
      const [hotelsRes, restaurantsRes, experiencesRes] = await Promise.all([
        searchHotels({ city: citySlug }).catch(() => ({ count: 0 })),
        getRestaurantsPaginated({ city: citySlug }).catch(() => ({ count: 0 })),
        getExperiencesPaginated({ city: citySlug }).catch(() => ({ count: 0 })),
      ])
      
      setLiveCounts(prev => ({
        ...prev,
        hotels: hotelsRes.count ?? 0,
        restaurants: restaurantsRes.count ?? 0,
        experiences: experiencesRes.count ?? 0,
      }))
    } catch {
      // Keep the counts from city detail if live fetch fails
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !city) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[400px] overflow-hidden">
          <img 
            src={getMediaUrl(city.cover_photo_url) || "/placeholder.svg"}
            alt={city.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <Link
                href="/cities"
                className="mb-4 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                All Cities
              </Link>
              <h1 className="text-4xl font-bold text-white md:text-5xl">{city.name}</h1>
              {city.nickname && (
                <p className="text-xl font-medium text-white/90">{city.nickname}</p>
              )}
              <p className="mt-2 max-w-2xl text-white/70">{city.description || city.short_description}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/hotels?city=${city.slug}`}
                  className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/30"
                >
                  <Hotel className="h-4 w-4" />
                  {countsLoading ? (
                    <span className="inline-block h-4 w-6 animate-pulse rounded bg-white/30" />
                  ) : (
                    <span className="font-medium">{liveCounts.hotels}</span>
                  )}
                  <span>Hotels</span>
                </Link>
                <Link
                  href={`/restaurants?city=${city.slug}`}
                  className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/30"
                >
                  <Utensils className="h-4 w-4" />
                  {countsLoading ? (
                    <span className="inline-block h-4 w-6 animate-pulse rounded bg-white/30" />
                  ) : (
                    <span className="font-medium">{liveCounts.restaurants}</span>
                  )}
                  <span>Restaurants</span>
                </Link>
                <Link
                  href={`/experiences?city=${city.slug}`}
                  className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/30"
                >
                  <Compass className="h-4 w-4" />
                  {countsLoading ? (
                    <span className="inline-block h-4 w-6 animate-pulse rounded bg-white/30" />
                  ) : (
                    <span className="font-medium">{liveCounts.experiences}</span>
                  )}
                  <span>Experiences</span>
                </Link>
                {liveCounts.attractions > 0 && (
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{liveCounts.attractions}</span>
                    <span>Attractions</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="attractions" className="w-full">
              <TabsList className="mb-8 grid w-full grid-cols-4 lg:w-[500px]">
                <TabsTrigger value="attractions" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Attractions
                </TabsTrigger>
                <TabsTrigger value="hotels" className="gap-2">
                  <Hotel className="h-4 w-4" />
                  Hotels
                </TabsTrigger>
                <TabsTrigger value="restaurants" className="gap-2">
                  <Utensils className="h-4 w-4" />
                  Restaurants
                </TabsTrigger>
                <TabsTrigger value="experiences" className="gap-2">
                  <Compass className="h-4 w-4" />
                  Experiences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attractions">
                {attractions.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <h3 className="mb-2 text-lg font-semibold">No attractions yet</h3>
                    <p className="text-muted-foreground">We&apos;re working on adding attractions in {city.name}.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {attractions.map((attraction) => (
                      <Link
                        key={attraction.id}
                        href={`/attractions/${attraction.slug}`}
                        className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                      >
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={getMediaUrl(attraction.photo_url) || "/placeholder.svg"}
                            alt={attraction.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <span className="mb-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            {attraction.category}
                          </span>
                          <h3 className="font-semibold">{attraction.name}</h3>
                          {attraction.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{attraction.description}</p>
                          )}
                          {attraction.entry_fee && (
                            <p className="mt-2 text-sm font-medium text-primary">{attraction.entry_fee}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hotels">
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <Hotel className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-semibold">Hotels in {city.name}</h3>
                  <p className="text-muted-foreground">
                    {countsLoading ? (
                      <span className="inline-block h-4 w-48 animate-pulse rounded bg-muted" />
                    ) : liveCounts.hotels > 0 ? (
                      `Explore ${liveCounts.hotels} verified hotels in ${city.name}.`
                    ) : (
                      `We're working on adding hotels in ${city.name}.`
                    )}
                  </p>
                  {liveCounts.hotels > 0 && (
                    <Link 
                      href={`/hotels?city=${city.slug}`}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Browse Hotels
                    </Link>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="restaurants">
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <Utensils className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-semibold">Restaurants in {city.name}</h3>
                  <p className="text-muted-foreground">
                    {countsLoading ? (
                      <span className="inline-block h-4 w-48 animate-pulse rounded bg-muted" />
                    ) : liveCounts.restaurants > 0 ? (
                      `Discover ${liveCounts.restaurants} restaurants in ${city.name}.`
                    ) : (
                      `We're working on adding restaurants in ${city.name}.`
                    )}
                  </p>
                  {liveCounts.restaurants > 0 && (
                    <Link 
                      href={`/restaurants?city=${city.slug}`}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Browse Restaurants
                    </Link>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="experiences">
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <Compass className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-semibold">Experiences in {city.name}</h3>
                  <p className="text-muted-foreground">
                    {countsLoading ? (
                      <span className="inline-block h-4 w-48 animate-pulse rounded bg-muted" />
                    ) : liveCounts.experiences > 0 ? (
                      `Find ${liveCounts.experiences} unique experiences in ${city.name}.`
                    ) : (
                      `We're working on adding experiences in ${city.name}.`
                    )}
                  </p>
                  {liveCounts.experiences > 0 && (
                    <Link 
                      href={`/experiences?city=${city.slug}`}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Browse Experiences
                    </Link>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Safety Info */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-2xl font-bold">Safety Information</h2>
            {safetyInfo.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {safetyInfo.map((info) => (
                  <div key={info.id} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        info.safety_level === "safe" ? "bg-green-100" :
                        info.safety_level === "caution" ? "bg-amber-100" : "bg-red-100"
                      }`}>
                        <Shield className={`h-5 w-5 ${
                          info.safety_level === "safe" ? "text-green-600" :
                          info.safety_level === "caution" ? "text-amber-600" : "text-red-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{info.title}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            info.safety_level === "safe" ? "bg-green-100 text-green-800" :
                            info.safety_level === "caution" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                          }`}>
                            {info.safety_level}
                          </span>
                        </div>
                        {info.area_name && (
                          <p className="text-sm text-muted-foreground">{info.area_name}</p>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground">{info.description}</p>
                        {info.tips && info.tips.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {info.tips.slice(0, 3).map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-primary">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">Safety Information for {city.name}</h3>
                    <p className="text-muted-foreground">
                      {city.name} is generally safe for tourists. We recommend staying in verified accommodations, using
                      trusted transport services, and keeping valuables secure. Our listings are verified for safety, and
                      our AI assistant can provide specific safety tips for any location.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">Tourist-Friendly</span>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">English Spoken</span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                        Local Currency: ETB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* City Reviews */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <ReviewsSection
              contentType="city"
              contentId={city.id}
              averageRating={city.average_rating || 0}
              reviewCount={city.review_count || 0}
            />
          </div>
        </section>
      </main>
      <Footer />
      <FloatingAIAssistant />
    </div>
  )
}
