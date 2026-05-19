"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ListingCard } from "@/components/shared/listing-card"
import { DiscoveryFilters } from "@/components/shared/discovery-filters"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { searchHotels } from "@/lib/api/hotels"
import { mediaUrl } from "@/lib/api/client"
import { APIError } from "@/lib/api/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
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

  const city = searchParams.get("city") || ""
  const search = searchParams.get("search") || ""
  const priceMin = searchParams.get("priceMin") || ""
  const priceMax = searchParams.get("priceMax") || ""
  const verified = searchParams.get("verified") || ""

  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const prevFilterRef = useRef([city, search, priceMin, priceMax, verified].join("|"))

  useEffect(() => {
    const filterStr = [city, search, priceMin, priceMax, verified].join("|")
    const filtersChanged = filterStr !== prevFilterRef.current
    prevFilterRef.current = filterStr

    const isFirstPage = filtersChanged || page === 1
    let cancelled = false

    async function load() {
      if (isFirstPage) {
        setLoading(true)
        if (filtersChanged) setHotels([])
      } else {
        setLoadingMore(true)
      }
      setError(null)

      try {
        const params = {
          city: city || undefined,
          search: search || undefined,
          price_min: priceMin ? Number(priceMin) : undefined,
          price_max: priceMax ? Number(priceMax) : undefined,
          verified: verified === "true" ? true : undefined,
          page: filtersChanged ? 1 : page,
          page_size: 20,
        }

        const response = await searchHotels(params)

        if (!cancelled) {
          const results = response.results || []
          if (isFirstPage) {
            setHotels(results)
          } else {
            setHotels((prev) => [...prev, ...results])
          }
          setTotalCount(response.count)
          setHasMore(!!response.next)
          if (filtersChanged) setPage(1)
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof APIError) {
            setError(err.message)
          } else {
            setError("Failed to load hotels. Please try again.")
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, search, priceMin, priceMax, verified, page])

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
                    {hotels.length < totalCount
                      ? `Showing ${hotels.length} of ${totalCount} hotel${totalCount !== 1 ? "s" : ""}`
                      : `${totalCount} hotel${totalCount !== 1 ? "s" : ""} found`}
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {hotels.map((hotel: any) => (
                      <ListingCard
                        key={hotel.id}
                        id={hotel.id}
                        slug={hotel.slug}
                        type="hotel"
                        name={hotel.name}
                        imageUrl={
                          mediaUrl(hotel.cover_photo) ||
                          mediaUrl(hotel.images?.[0]?.url) ||
                          mediaUrl(hotel.images?.[0]?.photo_url) ||
                          "/placeholder.svg"
                        }
                        location={hotel.area || hotel.address || ""}
                        city={hotel.city_name || hotel.city?.name || ""}
                        description={hotel.description || hotel.short_description || ""}
                        priceRange={hotel.price_range || hotel.priceRange}
                        priceDisplay={
                          hotel.min_price
                            ? `From $${hotel.min_price} / night`
                            : hotel.priceMin
                              ? `$${hotel.priceMin} - $${hotel.priceMax} / night`
                              : "Contact for price"
                        }
                        rating={hotel.average_rating ? parseFloat(hotel.average_rating) : hotel.rating || 0}
                        reviewCount={hotel.review_count || hotel.reviewCount || 0}
                        isVerified={hotel.is_verified ?? hotel.isVerified ?? false}
                        isFeatured={hotel.is_featured ?? hotel.isFeatured ?? false}
                        tags={
                          hotel.amenities?.slice(0, 4) ||
                          [hotel.category, hotel.star_rating ? `${hotel.star_rating} Star` : null].filter(Boolean)
                        }
                        safetyScore={hotel.safetyScore}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-10 flex justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        disabled={loadingMore}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More Hotels"
                        )}
                      </Button>
                    </div>
                  )}
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
