"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, Loader2, Hotel, Utensils, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCities, getCityDetail, type City } from "@/lib/api/content"
import { searchHotels } from "@/lib/api/hotels"
import { getRestaurants } from "@/lib/api/restaurants"
import { getExperiences } from "@/lib/api/experiences"

const API_BASE = "https://api.aman.yichalal.ai"

// Live counts for each city
interface CityCounts {
  hotels: number
  restaurants: number
  experiences: number
  loading: boolean
}

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  if (!path.startsWith("/")) return `${API_BASE}/media/${path}`
  return `${API_BASE}${path}`
}

export function CitiesSection() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [liveCounts, setLiveCounts] = useState<Record<string, CityCounts>>({})

  // Fetch live counts for a single city using the same APIs as listing pages
  const fetchCityCounts = useCallback(async (city: City) => {
    const citySlug = city.slug
    
    // Initialize with loading state and backend counts as fallback
    setLiveCounts(prev => ({
      ...prev,
      [citySlug]: {
        hotels: city.hotels_count || 0,
        restaurants: city.restaurants_count || 0,
        experiences: city.experiences_count || 0,
        loading: true,
      }
    }))

    try {
      // Fetch from the same endpoints used by listing pages for consistency
      const [hotelsRes, restaurants, experiences] = await Promise.all([
        searchHotels({ city: citySlug, page_size: 1 }).catch(() => ({ count: 0 })),
        getRestaurants({ city: citySlug }).catch(() => []),
        getExperiences({ city: citySlug }).catch(() => []),
      ])

      setLiveCounts(prev => ({
        ...prev,
        [citySlug]: {
          hotels: hotelsRes.count ?? city.hotels_count ?? 0,
          restaurants: Array.isArray(restaurants) ? restaurants.length : (city.restaurants_count ?? 0),
          experiences: Array.isArray(experiences) ? experiences.length : (city.experiences_count ?? 0),
          loading: false,
        }
      }))
    } catch {
      // Keep backend counts if live fetch fails
      setLiveCounts(prev => ({
        ...prev,
        [citySlug]: {
          ...prev[citySlug],
          loading: false,
        }
      }))
    }
  }, [])

  useEffect(() => {
    async function loadCities() {
      try {
        const data = await getCities({ is_popular: true })
        const displayCities = data.slice(0, 6) // Show first 6 popular cities
        setCities(displayCities)
        
        // Fetch live counts for each city in parallel
        displayCities.forEach(city => fetchCityCounts(city))
      } catch (err) {
        // Silent fail - cities just won't show
      } finally {
        setLoading(false)
      }
    }
    loadCities()
  }, [fetchCityCounts])

  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Explore
            </span>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Featured Cities</h2>
            <p className="mt-2 text-muted-foreground">
              Discover hotels, restaurants, and experiences in Ethiopia&apos;s most popular destinations
            </p>
          </div>
          <Button variant="outline" asChild className="hidden bg-transparent sm:flex">
            <Link href="/cities">
              View All Cities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : cities.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No cities available yet</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/cities/${city.slug}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={getMediaUrl(city.cover_photo_url) || "/vibrant-city-skyline.png"}
                    alt={city.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/vibrant-city-skyline.png"
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white">{city.name}</h3>
                  {city.nickname && (
                    <p className="text-sm font-medium text-white/90">{city.nickname}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
                    {liveCounts[city.slug]?.loading ? (
                      <>
                        <span className="inline-flex items-center gap-1">
                          <Hotel className="h-3 w-3" />
                          <span className="inline-block h-3 w-4 animate-pulse rounded bg-white/30" />
                        </span>
                        <span className="text-white/50">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Utensils className="h-3 w-3" />
                          <span className="inline-block h-3 w-4 animate-pulse rounded bg-white/30" />
                        </span>
                        <span className="text-white/50">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Compass className="h-3 w-3" />
                          <span className="inline-block h-3 w-4 animate-pulse rounded bg-white/30" />
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1">
                          <Hotel className="h-3 w-3" />
                          {liveCounts[city.slug]?.hotels ?? city.hotels_count ?? 0} Hotels
                        </span>
                        <span className="text-white/50">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Utensils className="h-3 w-3" />
                          {liveCounts[city.slug]?.restaurants ?? city.restaurants_count ?? 0} Restaurants
                        </span>
                        <span className="text-white/50">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Compass className="h-3 w-3" />
                          {liveCounts[city.slug]?.experiences ?? city.experiences_count ?? 0} Experiences
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild className="bg-transparent">
            <Link href="/cities">
              View All Cities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
