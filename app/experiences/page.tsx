"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ListingCard } from "@/components/shared/listing-card"
import { DiscoveryFilters } from "@/components/shared/discovery-filters"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { getExperiences, type Package } from "@/lib/api/experiences"
import { getMediaUrl } from "@/lib/utils/media"
import { Skeleton } from "@/components/ui/skeleton"
import { CityStatsBar } from "@/components/shared/city-stats-bar"
import { toast } from "sonner"

const categoryOptions = [
  { value: "city_tour", label: "City Tour" },
  { value: "multi_city", label: "Multi-City" },
  { value: "adventure", label: "Adventure" },
  { value: "culture", label: "Cultural" },
  { value: "food", label: "Food & Culinary" },
  { value: "nature", label: "Nature" },
  { value: "spiritual", label: "Spiritual" },
  { value: "historical", label: "Historical" },
]

const CATEGORY_LABELS: Record<string, string> = {
  city_tour: "City Tour",
  multi_city: "Multi-City",
  adventure: "Adventure",
  culture: "Cultural",
  food: "Food & Culinary",
  nature: "Nature",
  spiritual: "Spiritual",
  historical: "Historical",
}

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

function ExperiencesContent() {
  const searchParams = useSearchParams()
  const [experiences, setExperiences] = useState<Package[]>([])
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
        toast.error("We couldn't load the experiences. Please refresh the page.")
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
                    {experiences.map((pkg) => (
                      <ListingCard
                        key={pkg.id}
                        id={pkg.id}
                        slug={pkg.slug}
                        type="experience"
                        name={pkg.title}
                        imageUrl={getMediaUrl(pkg.primary_photo?.photo_url || pkg.photos?.[0]?.photo_url) || "/tour-experience.jpg"}
                        location={pkg.cities?.map(c => c.city.name).join(" → ") || ""}
                        city={pkg.cities?.[0]?.city.name || ""}
                        description={pkg.short_description || pkg.description || ""}
                        priceDisplay={`$${pkg.price_per_person} / person`}
                        rating={pkg.average_rating ? parseFloat(pkg.average_rating) : 0}
                        reviewCount={pkg.review_count || 0}
                        isVerified={pkg.is_published}
                        isFeatured={false}
                        tags={[
                          CATEGORY_LABELS[pkg.category] || pkg.category,
                          `${pkg.duration_days} days`,
                          pkg.next_departure
                            ? `Next: ${new Date(pkg.next_departure.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : null,
                          pkg.next_departure && pkg.next_departure.available_seats <= 3
                            ? `${pkg.next_departure.available_seats} seats left`
                            : null,
                        ].filter(Boolean) as string[]}
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

export default function ExperiencesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col"><main className="flex-1 py-8"><div className="container mx-auto px-4"><ExperiencesLoading /></div></main></div>}>
      <ExperiencesContent />
    </Suspense>
  )
}
