"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ListingCard } from "@/components/shared/listing-card"
import { DiscoveryFilters } from "@/components/shared/discovery-filters"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { getExperiences } from "@/lib/api/experiences"
import type { Experience } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { CityStatsBar } from "@/components/shared/city-stats-bar"

const categoryOptions = [
  { value: "cultural", label: "Cultural" },
  { value: "adventure", label: "Adventure" },
  { value: "food", label: "Food & Drink" },
  { value: "nature", label: "Nature" },
  { value: "historical", label: "Historical" },
]

function ExperiencesLoading() {
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

export default function ExperiencesPage() {
  const searchParams = useSearchParams()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadExperiences() {
      setLoading(true)
      try {
        // City filter uses slug from URL params
        const data = await getExperiences({
          city: searchParams.get("city") || undefined,
          category: searchParams.get("category") || undefined,
          search: searchParams.get("search") || undefined,
        })
        setExperiences(data)
      } catch (error) {
        console.error("[v0] Failed to load experiences:", error)
        setExperiences([])
      } finally {
        setLoading(false)
      }
    }
    loadExperiences()
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">Experiences</h1>
            <p className="text-muted-foreground">Discover unique tours and activities across Ethiopia</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <DiscoveryFilters
              basePath="/experiences"
              additionalFilters={[{ name: "category", label: "Category", options: categoryOptions }]}
            />

            <CityStatsBar
              citySlug={searchParams.get("city")}
              activeStat="experiences"
              className="mt-4"
            />

            <div className="mt-8">
              {loading ? (
                <ExperiencesLoading />
              ) : experiences.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <h3 className="mb-2 text-lg font-semibold">No experiences found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                <>
                  <p className="mb-6 text-muted-foreground">
                    Showing {experiences.length} experience{experiences.length !== 1 ? "s" : ""}
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {experiences.map((experience: any) => (
                      <ListingCard
                        key={experience.id}
                        id={experience.id}
                        slug={experience.slug}
                        type="experience"
                        name={experience.name}
                        imageUrl={experience.cover_photo || experience.images?.[0]?.url || "/tour-experience.jpg"}
                        location={experience.city_name || experience.city?.name || ""}
                        city={experience.city_name || experience.city?.name || ""}
                        description={experience.description || experience.short_description || ""}
                        priceRange={experience.priceRange || experience.price_range}
                        priceDisplay={
                          experience.price_per_person ? `$${experience.price_per_person} / person` :
                          experience.price ? `$${experience.price} / person` :
                          "Contact for price"
                        }
                        rating={experience.average_rating ? parseFloat(experience.average_rating) : experience.rating || 0}
                        reviewCount={experience.review_count || experience.reviewCount || 0}
                        isVerified={experience.is_verified ?? experience.isVerified ?? true}
                        isFeatured={experience.is_featured ?? experience.isFeatured ?? false}
                        tags={[experience.trip_type || experience.category, experience.duration_days ? `${experience.duration_days} days` : experience.duration].filter(Boolean)}
                        safetyScore={experience.safetyScore}
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
