"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Compass, Loader2, AlertCircle } from "lucide-react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getCities, type City } from "@/lib/api/content"

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `https://api.aman.yichalal.ai/${path}`
  if (!path.startsWith("/")) return `https://api.aman.yichalal.ai/media/${path}`
  return `https://api.aman.yichalal.ai/${path}`
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCities()
  }, [])

  async function loadCities() {
    try {
      setLoading(true)
      setError(null)
      const data = await getCities()
      setCities(data)
    } catch (err: any) {
      setError(err.message || "Failed to load cities")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">Explore Ethiopian Cities</h1>
            <p className="text-muted-foreground">
              Discover hotels, restaurants, and experiences in Ethiopia&apos;s most popular destinations
            </p>
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
                        src={
                          getMediaUrl(city.cover_photo_url) ||
                          "/placeholder.svg?height=400&width=600&query=ethiopian city" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={city.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/vibrant-city-skyline.png"
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="text-2xl font-bold text-white">{city.name}</h2>
                      {city.nickname && (
                        <p className="text-sm font-medium text-white/90">{city.nickname}</p>
                      )}
                      <p className="text-white/80">{city.country}</p>
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
          </div>
        </section>
      </main>
      <Footer />
      <FloatingAIAssistant />
    </div>
  )
}
