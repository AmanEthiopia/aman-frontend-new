"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { Compass, Loader2, AlertCircle, Hotel, Utensils, Map, Search } from "lucide-react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCities, type City } from "@/lib/api/content"
import { searchHotels } from "@/lib/api/hotels"
import { getRestaurantsPaginated } from "@/lib/api/restaurants"
import { getExperiencesPaginated } from "@/lib/api/experiences"
import { searchGuides } from "@/lib/api/guides"

interface CityCounts {
  hotels: number
  restaurants: number
  experiences: number
  guides: number
  loading: boolean
}

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `https://api.aman.yichalal.ai/${path}`
  if (!path.startsWith("/")) return `https://api.aman.yichalal.ai/media/${path}`
  return `https://api.aman.yichalal.ai/${path}`
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveCounts, setLiveCounts] = useState<Record<string, CityCounts>>({})
  const rawCities = useRef<City[]>([])

  const filteredCities = query.trim()
    ? cities.filter((c) => {
        const q = query.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          (c.nickname ?? "").toLowerCase().includes(q) ||
          (c.country ?? "").toLowerCase().includes(q)
        )
      })
    : cities

  const fetchCityCounts = useCallback(async (city: City) => {
    const citySlug = city.slug

    setLiveCounts(prev => ({
      ...prev,
      [citySlug]: {
        hotels: city.hotels_count || 0,
        restaurants: city.restaurants_count || 0,
        experiences: city.experiences_count || 0,
        guides: city.guides_count || 0,
        loading: true,
      }
    }))

    try {
      const [hotelsRes, restaurantsRes, experiencesRes, guidesRes] = await Promise.all([
        searchHotels({ city: citySlug }).catch(() => ({ count: 0 })),
        getRestaurantsPaginated({ city: citySlug }).catch(() => ({ count: 0 })),
        getExperiencesPaginated({ city: citySlug }).catch(() => ({ count: 0 })),
        searchGuides({ city: citySlug }).catch(() => ({ count: 0, results: [] })),
      ])

      setLiveCounts(prev => ({
        ...prev,
        [citySlug]: {
          hotels: hotelsRes.count ?? city.hotels_count ?? 0,
          restaurants: restaurantsRes.count ?? city.restaurants_count ?? 0,
          experiences: experiencesRes.count ?? city.experiences_count ?? 0,
          guides: guidesRes.count ?? city.guides_count ?? 0,
          loading: false,
        }
      }))
    } catch {
      setLiveCounts(prev => ({
        ...prev,
        [citySlug]: { ...prev[citySlug], loading: false }
      }))
    }
  }, [])

  useEffect(() => {
    loadCities()
  }, [])

  async function loadCities() {
    try {
      setLoading(true)
      setError(null)
      const data = await getCities()
      rawCities.current = data
      setCities(shuffleArray(data))
      data.forEach(city => fetchCityCounts(city))
    } catch (err: any) {
      setError(err.message || "Failed to load cities")
    } finally {
      setLoading(false)
    }
  }

  function reshuffle() {
    setCities(shuffleArray(rawCities.current))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">Explore Ethiopian Cities</h1>
                <p className="text-muted-foreground">
                  Discover hotels, restaurants, guides, and experiences in Ethiopia&apos;s most popular destinations
                </p>
              </div>
              {!loading && cities.length > 0 && (
                <Button variant="outline" size="sm" onClick={reshuffle} className="shrink-0">
                  Shuffle
                </Button>
              )}
            </div>
            {!loading && cities.length > 0 && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search cities..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={loadCities} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : cities.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <Compass className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No cities found</h3>
                  <p className="text-sm text-muted-foreground">Cities will appear here once added by admin</p>
                </div>
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                  <h3 className="mb-1 text-lg font-semibold">No cities match &ldquo;{query}&rdquo;</h3>
                  <p className="text-sm text-muted-foreground">Try a different name or clear the search</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCities.map((city) => {
                  const counts = liveCounts[city.slug]
                  return (
                    <Link
                      key={city.id}
                      href={`/cities/${city.slug}`}
                      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-xl"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={getMediaUrl(city.cover_photo_url) || "/placeholder.svg"}
                          alt={city.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h2 className="text-2xl font-bold text-white">{city.name}</h2>
                        {city.nickname && (
                          <p className="text-sm font-medium text-white/90">{city.nickname}</p>
                        )}
                        <p className="text-white/80">{city.country}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
                          {counts?.loading ? (
                            <>
                              {[Hotel, Utensils, Compass, Map].map((Icon, i) => (
                                <span key={i} className="inline-flex items-center gap-1">
                                  {i > 0 && <span className="text-white/50 -ml-1">•</span>}
                                  <Icon className="h-3 w-3" />
                                  <span className="inline-block h-3 w-4 animate-pulse rounded bg-white/30" />
                                </span>
                              ))}
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1">
                                <Hotel className="h-3 w-3" />
                                {counts?.hotels ?? city.hotels_count ?? 0} Hotels
                              </span>
                              <span className="text-white/50">•</span>
                              <span className="inline-flex items-center gap-1">
                                <Utensils className="h-3 w-3" />
                                {counts?.restaurants ?? city.restaurants_count ?? 0} Restaurants
                              </span>
                              <span className="text-white/50">•</span>
                              <span className="inline-flex items-center gap-1">
                                <Compass className="h-3 w-3" />
                                {counts?.experiences ?? city.experiences_count ?? 0} Experiences
                              </span>
                              <span className="text-white/50">•</span>
                              <span className="inline-flex items-center gap-1">
                                <Map className="h-3 w-3" />
                                {counts?.guides ?? city.guides_count ?? 0} Guides
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingAIAssistant />
    </div>
  )
}
