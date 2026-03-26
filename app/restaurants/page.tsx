"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ListingCard } from "@/components/shared/listing-card"
import { DiscoveryFilters } from "@/components/shared/discovery-filters"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { getRestaurants } from "@/lib/api/restaurants"
import type { Restaurant } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { CityStatsBar } from "@/components/shared/city-stats-bar"

const cuisineOptions = [
  { value: "ethiopian", label: "Ethiopian" },
  { value: "international", label: "International" },
  { value: "fusion", label: "Fusion" },
  { value: "seafood", label: "Seafood" },
  { value: "coffee", label: "Coffee & Cafe" },
]

function RestaurantsLoading() {
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

function RestaurantsContent() {
  const searchParams = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRestaurants() {
      setLoading(true)
      try {
        // City filter uses slug from URL params
        const data = await getRestaurants({
          city: searchParams.get("city") || undefined,
          priceRange: searchParams.get("priceRange") || undefined,
          cuisine: searchParams.get("cuisine") || undefined,
          search: searchParams.get("search") || undefined,
        })
        setRestaurants(data)
      } catch (error) {
        console.error("[v0] Failed to load restaurants:", error)
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }
    loadRestaurants()
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">Restaurants</h1>
            <p className="text-muted-foreground">
              Discover verified restaurants and dining experiences across Ethiopia
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <DiscoveryFilters
              basePath="/restaurants"
              additionalFilters={[{ name: "cuisine", label: "Cuisine Type", options: cuisineOptions }]}
            />

            <CityStatsBar
              citySlug={searchParams.get("city")}
              activeStat="restaurants"
              className="mt-4"
            />

            <div className="mt-8">
              {loading ? (
                <RestaurantsLoading />
              ) : restaurants.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <h3 className="mb-2 text-lg font-semibold">No restaurants found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                <>
                  <p className="mb-6 text-muted-foreground">
                    Showing {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""}
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {restaurants.map((restaurant: any) => (
                      <ListingCard
                        key={restaurant.id}
                        id={restaurant.id}
                        slug={restaurant.slug}
                        type="restaurant"
                        name={restaurant.name}
                        imageUrl={restaurant.cover_photo || restaurant.images?.[0]?.url || "/cozy-italian-restaurant.png"}
                        location={restaurant.area || restaurant.address || ""}
                        city={restaurant.city_name || restaurant.city?.name || ""}
                        description={restaurant.description || restaurant.short_description || ""}
                        priceRange={restaurant.priceRange || restaurant.price_range}
                        priceDisplay={restaurant.price_min ? `$${restaurant.price_min} - $${restaurant.price_max} / person` : "Contact for prices"}
                        rating={restaurant.average_rating ? parseFloat(restaurant.average_rating) : restaurant.rating || 0}
                        reviewCount={restaurant.review_count || restaurant.reviewCount || 0}
                        isVerified={restaurant.is_verified ?? restaurant.isVerified ?? true}
                        isFeatured={restaurant.is_featured ?? restaurant.isFeatured ?? false}
                        tags={restaurant.cuisine_types || restaurant.cuisineTypes || []}
                        safetyScore={restaurant.safetyScore}
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

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col"><main className="flex-1 py-8"><div className="container mx-auto px-4"><RestaurantsLoading /></div></main></div>}>
      <RestaurantsContent />
    </Suspense>
  )
}
