"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ListingCard } from "@/components/shared/listing-card"
import { DiscoveryFilters } from "@/components/shared/discovery-filters"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { getTransports } from "@/lib/api/transport"
import type { Transport } from "@/lib/types"
import { getMediaUrl } from "@/lib/utils/media"
import { Skeleton } from "@/components/ui/skeleton"
import { CityStatsBar } from "@/components/shared/city-stats-bar"

const transportTypeOptions = [
  { value: "airport-pickup", label: "Airport Pickup" },
  { value: "driver", label: "Personal Driver" },
  { value: "tour-vehicle", label: "Tour Vehicle" },
  { value: "car-rental", label: "Car Rental" },
]

function TransportLoading() {
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

function TransportContent() {
  const searchParams = useSearchParams()
  const [transport, setTransport] = useState<Transport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTransport() {
      setLoading(true)
      try {
        // City filter uses slug from URL params
        const data = await getTransports({
          city: searchParams.get("city") || undefined,
          service_type: searchParams.get("type") || undefined,
          search: searchParams.get("search") || undefined,
        })
        setTransport(data)
      } catch (error) {
        console.error("[v0] Failed to load transport:", error)
        setTransport([])
      } finally {
        setLoading(false)
      }
    }
    loadTransport()
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">Transport</h1>
            <p className="text-muted-foreground">
              Find verified drivers, airport transfers, and tour vehicles across Ethiopia
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <DiscoveryFilters
              basePath="/transport"
              additionalFilters={[{ name: "type", label: "Transport Type", options: transportTypeOptions }]}
            />

            <CityStatsBar
              citySlug={searchParams.get("city")}
              activeStat="transport"
              className="mt-4"
            />

            <div className="mt-8">
              {loading ? (
                <TransportLoading />
              ) : transport.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <h3 className="mb-2 text-lg font-semibold">No transport options found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                <>
                  <p className="mb-6 text-muted-foreground">
                    Showing {transport.length} transport option{transport.length !== 1 ? "s" : ""}
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {transport.map((item: any) => (
                      <ListingCard
                        key={item.id}
                        id={item.id}
                        slug={item.slug}
                        type="transport"
                        name={item.name}
                        imageUrl={getMediaUrl(item.cover_photo || item.images?.[0]?.url) || "/car-driver.jpg"}
                        location={item.city_name || item.city?.name || ""}
                        city={item.city_name || item.city?.name || ""}
                        description={item.description || ""}
                        priceRange={item.priceRange || item.price_range}
                        priceDisplay={
                          item.price_per_day ? `$${item.price_per_day} / day` :
                          item.price_per_hour ? `$${item.price_per_hour} / hour` :
                          item.pricePerTrip ? `$${item.pricePerTrip} / trip` :
                          item.pricePerDay ? `$${item.pricePerDay} / day` :
                          "Contact for price"
                        }
                        rating={item.average_rating ? parseFloat(item.average_rating) : item.rating || 0}
                        reviewCount={item.review_count || item.reviewCount || 0}
                        isVerified={item.is_verified ?? item.isVerified ?? true}
                        isFeatured={item.is_featured ?? item.isFeatured ?? false}
                        tags={[item.vehicle_type || item.type, ...(item.languages || []).slice(0, 2)].filter(Boolean)}
                        safetyScore={item.safetyScore}
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

export default function TransportPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col"><main className="flex-1 py-8"><div className="container mx-auto px-4"><TransportLoading /></div></main></div>}>
      <TransportContent />
    </Suspense>
  )
}
