"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCities, type City } from "@/lib/api/content"

const API_BASE = "https://api.aman.yichalal.ai"

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

  useEffect(() => {
    async function loadCities() {
      try {
        const data = await getCities({ is_popular: true })
        setCities(data.slice(0, 6)) // Show first 6 popular cities
      } catch (err) {
        console.error("Failed to load cities:", err)
      } finally {
        setLoading(false)
      }
    }
    loadCities()
  }, [])

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
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
                    <span>{city.hotels_count || 0} Hotels</span>
                    <span>•</span>
                    <span>{city.restaurants_count || 0} Restaurants</span>
                    <span>•</span>
                    <span>{city.experiences_count || 0} Experiences</span>
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
