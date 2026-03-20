"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ListingCard } from "@/components/shared/listing-card"
import { DiscoveryFilters } from "@/components/shared/discovery-filters"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { fetchExperiences } from "@/lib/api/mock-api"
import type { Experience } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

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
      const params = {
        city: searchParams.get("city") || undefined,
        category: searchParams.get("category") || undefined,
        priceRange: searchParams.get("priceRange") || undefined,
        search: searchParams.get("search") || undefined,
      }
      const response = await fetchExperiences(params)
      if (response.data) {
        setExperiences(response.data)
      }
      setLoading(false)
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
                    {experiences.map((experience) => (
                      <ListingCard
                        key={experience.id}
                        id={experience.id}
                        type="experience"
                        name={experience.name}
                        imageUrl={experience.images[0]?.url || "/tour-experience.jpg"}
                        location={experience.city?.name || ""}
                        city={experience.city?.name || ""}
                        description={experience.description}
                        priceRange={experience.priceRange}
                        priceDisplay={`$${experience.price} / person`}
                        rating={experience.rating}
                        reviewCount={experience.reviewCount}
                        isVerified={experience.isVerified}
                        isFeatured={experience.isFeatured}
                        tags={[experience.category, experience.duration]}
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
