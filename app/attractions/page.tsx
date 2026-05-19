"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ListingCard } from "@/components/shared/listing-card"
import { DiscoveryFilters } from "@/components/shared/discovery-filters"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { getAttractions, type Attraction } from "@/lib/api/content"
import { getMediaUrl } from "@/lib/utils/media"
import { Skeleton } from "@/components/ui/skeleton"
import { CityStatsBar } from "@/components/shared/city-stats-bar"

const categoryOptions = [
  { value: "historical", label: "Historical" },
  { value: "religious", label: "Religious" },
  { value: "natural", label: "Natural" },
  { value: "cultural", label: "Cultural" },
  { value: "archaeological", label: "Archaeological" },
]

function AttractionsLoading() {
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

function AttractionsContent() {
  const searchParams = useSearchParams()
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAttractions() {
      setLoading(true)
      try {
        const data = await getAttractions({
          city: searchParams.get("city") || undefined,
          search: searchParams.get("search") || undefined,
        })
        setAttractions(data)
      } catch (error) {
        console.error("[v0] Failed to load attractions:", error)
        setAttractions([])
      } finally {
        setLoading(false)
      }
    }
    loadAttractions()
  }, [searchParams])

  return (
    <>
      <DiscoveryFilters basePath="/attractions" />

      <CityStatsBar
        citySlug={searchParams.get("city")}
        activeStat="attractions"
        className="mt-4"
      />

      <div className="mt-8">
        {loading ? (
          <AttractionsLoading />
        ) : attractions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">No attractions found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-muted-foreground">
              Showing {attractions.length} attraction{attractions.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {attractions.map((attraction) => (
                <ListingCard
                  key={attraction.id}
                  id={attraction.id}
                  slug={attraction.slug}
                  type="attraction"
                  name={attraction.name}
                  imageUrl={getMediaUrl(attraction.image) || "/placeholder.svg?height=300&width=400&query=attraction"}
                  location={attraction.city || ""}
                  city={attraction.city || ""}
                  description={attraction.description || ""}
                  priceDisplay={attraction.entry_fee ? `Entry: ${attraction.entry_fee}` : "Free"}
                  rating={attraction.rating || 0}
                  reviewCount={0}
                  isVerified={true}
                  tags={[attraction.category].filter(Boolean)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default function AttractionsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">Attractions</h1>
            <p className="text-muted-foreground">
              Discover historical sites, natural landmarks, and cultural attractions across Ethiopia
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <Suspense fallback={<AttractionsLoading />}>
              <AttractionsContent />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingAIAssistant />
    </div>
  )
}
