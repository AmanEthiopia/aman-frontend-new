"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ListingCard } from "@/components/shared/listing-card"
import { DiscoveryFilters } from "@/components/shared/discovery-filters"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { searchHotels } from "@/lib/api/hotels"
import { APIError } from "@/lib/api/client"
import type { Hotel } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { CityStatsBar } from "@/components/shared/city-stats-bar"

function HotelsLoading() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card">
          <Skeleton className="aspect-[4/3]" />
          <div className="p-4">
            <Skeleton className="mb-2 h-5 w-3/4" />
            <Skeleton className="mb-2 h-4 w-1/2" />
            <Skeleton className="mb-3 h-12" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function HotelsContent() {
  const searchParams = useSearchParams()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHotels() {
      setLoading(true)
      setError(null)

      try {
        const params = {
          city: searchParams.get("city") || undefined,
          price_min: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined,
          price_max: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined,
          verified: searchParams.get("verified") === "true" ? true : undefined,
          search: searchParams.get("search") || undefined,
          guests: searchParams.get("guests") ? Number(searchParams.get("guests")) : undefined,
        }

        const response = await searchHotels(params)
        setHotels(response.results || [])
      } catch (err) {
        console.error("[v0] Failed to load hotels:", err)
        if (err instanceof APIError) {
          setError(err.message)
        } else {
          setError("Failed to load hotels. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadHotels()
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">Hotels & Stays</h1>
            <p className="text-muted-foreground">Discover verified hotels across Ethiopia</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <DiscoveryFilters basePath="/hotels" />

            {/* Live city stats — only visible when a city filter is active */}
            <CityStatsBar
              citySlug={searchParams.get("city")}
              activeStat="hotels"
              className="mt-4"
            />

            <div className="mt-8">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <HotelsLoading />
              ) : hotels.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <h3 className="mb-2 text-lg font-semibold">No hotels found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                <>
                  <p className="mb-6 text-muted-foreground">
                    Showing {hotels.length} hotel{hotels.length !== 1 ? "s" : ""}
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {hotels.map((hotel: any) => (
                      <ListingCard
                        key={hotel.id}
                        id={hotel.id}
                        slug={hotel.slug}
                        type="hotel"
                        name={hotel.name}
                        imageUrl={hotel.cover_photo || hotel.images?.[0]?.url || "/grand-hotel-exterior.png"}
                        location={hotel.area || hotel.address || ""}
                        city={hotel.city_name || hotel.city?.name || ""}
                        description={hotel.description || hotel.short_description || ""}
                        priceRange={hotel.priceRange}
                        priceDisplay={hotel.min_price ? `From $${hotel.min_price} / night` : hotel.priceMin ? `$${hotel.priceMin} - $${hotel.priceMax} / night` : "Contact for price"}
                        rating={hotel.average_rating ? parseFloat(hotel.average_rating) : hotel.rating || 0}
                        reviewCount={hotel.review_count || hotel.reviewCount || 0}
                        isVerified={hotel.is_verified ?? hotel.isVerified ?? false}
                        isFeatured={hotel.is_featured ?? hotel.isFeatured ?? false}
                        tags={hotel.amenities?.slice(0, 4) || [hotel.category, `${hotel.star_rating || 0} Star`].filter(Boolean)}
                        safetyScore={hotel.safetyScore}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingAIAssistant />
    </div>
  )
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col"><main className="flex-1 py-8"><div className="container mx-auto px-4"><HotelsLoading /></div></main></div>}>
      <HotelsContent />
    </Suspense>
  )
}
