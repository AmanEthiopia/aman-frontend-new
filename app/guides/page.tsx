"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search, Star, MapPin, Languages, Clock, Users, Shield,
  Camera, Car, Compass, Mountain, Mic, Sparkles, ChevronRight,
  CheckCircle, Globe, Award
} from "lucide-react"
import {
  searchGuides,
  type Guide,
  type GuideServiceType,
  type GuidePricingType,
  SERVICE_TYPE_LABELS,
  PRICING_TYPE_LABELS,
} from "@/lib/api/guides"
import { getCities, type City } from "@/lib/api/content"
import { SafeCardImage } from "@/components/ui/safe-image"
import { formatRating, toNumber } from "@/lib/utils"
import { WishlistButton } from "@/components/wishlist-button"

const API_BASE = "https://api.aman.yichalal.ai"

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  return `${API_BASE}/media/${path}`
}

const SERVICE_CATEGORIES: {
  type: GuideServiceType | "all"
  label: string
  icon: React.ElementType
  description: string
  color: string
  bgColor: string
}[] = [
  {
    type: "all",
    label: "All Services",
    icon: Compass,
    description: "Browse everything",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    type: "private_tour",
    label: "Private Tours",
    icon: Compass,
    description: "Exclusive guided tours",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    type: "group_tour",
    label: "Group Tours",
    icon: Users,
    description: "Meet other travelers",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  {
    type: "driver",
    label: "Drivers",
    icon: Car,
    description: "Safe, local drivers",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    type: "hiking_guide",
    label: "Hiking Guides",
    icon: Mountain,
    description: "Trek & adventure",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    type: "photographer",
    label: "Photographers",
    icon: Camera,
    description: "Capture memories",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    type: "cultural_guide",
    label: "Cultural Guides",
    icon: Sparkles,
    description: "Immersive culture",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    type: "interpreter",
    label: "Interpreters",
    icon: Mic,
    description: "Language support",
    color: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
  },
]

function GuideCard({ guide }: { guide: Guide }) {
  const photoUrl = guide.primary_photo?.photo_url || guide.photos?.[0]?.photo_url
  const cityNames = guide.cities?.map((c) => c.city.name).join(", ") || "Ethiopia"
  const category = SERVICE_CATEGORIES.find((c) => c.type === guide.service_type)

  return (
    <Link href={`/guides/${guide.slug}`}>
      <Card className="group h-full overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
        <SafeCardImage
          src={getMediaUrl(photoUrl) || `/placeholder.svg?height=300&width=400&query=tour guide ethiopia ${guide.service_type}`}
          alt={guide.title}
          aspectRatio="aspect-[4/3]"
          enableHoverZoom={true}
          overlay={
            <>
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                {guide.is_verified && (
                  <Badge className="flex items-center gap-1 bg-primary/90 text-primary-foreground shadow-sm">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <WishlistButton
                itemType="guide"
                itemId={guide.id}
                className="absolute right-3 top-3 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
              />
              <div className="absolute bottom-3 right-3 rounded-full bg-background/95 px-3 py-1.5 text-sm font-bold shadow-md">
                ${toNumber(guide.price).toFixed(0)}
                <span className="text-xs font-normal text-muted-foreground">
                  /{PRICING_TYPE_LABELS[guide.pricing_type].replace("Per ", "").toLowerCase()}
                </span>
              </div>
            </>
          }
        />
        <CardContent className="p-4">
          {/* Service Type Badge */}
          {category && category.type !== "all" && (
            <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${category.bgColor} ${category.color}`}>
              <category.icon className="h-3.5 w-3.5" />
              {category.label}
            </div>
          )}

          <h3 className="mb-1 line-clamp-1 font-semibold leading-snug group-hover:text-primary transition-colors">
            {guide.title}
          </h3>
          {guide.nickname && (
            <p className="mb-1.5 text-xs text-muted-foreground">{guide.nickname}</p>
          )}

          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{cityNames}</span>
            </span>
            {guide.years_experience ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {guide.years_experience} yrs
              </span>
            ) : null}
          </div>

          {/* Languages */}
          <div className="mb-3 flex flex-wrap gap-1">
            {guide.languages?.slice(0, 3).map((lang) => (
              <Badge key={lang} variant="outline" className="h-5 px-1.5 text-[11px]">
                {lang}
              </Badge>
            ))}
            {(guide.languages?.length || 0) > 3 && (
              <Badge variant="outline" className="h-5 px-1.5 text-[11px]">
                +{guide.languages.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">{formatRating(guide.average_rating)}</span>
              <span className="text-xs text-muted-foreground">({guide.review_count || 0})</span>
            </div>
            {guide.max_group_size && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Up to {guide.max_group_size}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function GuideCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-5 w-24 rounded-full" />
        <Skeleton className="mb-1 h-5 w-3/4" />
        <Skeleton className="mb-3 h-3.5 w-1/2" />
        <Skeleton className="mb-3 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

function GuidesContent() {
  const searchParams = useSearchParams()
  const [guides, setGuides] = useState<Guide[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [serviceType, setServiceType] = useState<string>(searchParams.get("service_type") || "all")
  const [city, setCity] = useState(searchParams.get("city") || "all")
  const [pricingType, setPricingType] = useState(searchParams.get("pricing_type") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [guidesRes, citiesData] = await Promise.all([
          searchGuides({
            search: searchQuery || undefined,
            service_type: serviceType !== "all" ? (serviceType as GuideServiceType) : undefined,
            city: city !== "all" ? city : undefined,
            pricing_type: pricingType !== "all" ? (pricingType as GuidePricingType) : undefined,
            sort: sortBy as any,
          }),
          getCities(),
        ])
        setGuides(guidesRes.results)
        setTotalCount(guidesRes.count)
        setCities(citiesData)
      } catch (error) {
        console.error("Failed to load guides:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [searchQuery, serviceType, city, pricingType, sortBy])

  const handleCategorySelect = (type: string) => {
    setServiceType(type)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setServiceType("all")
    setCity("all")
    setPricingType("all")
    setSortBy("newest")
  }

  const hasActiveFilters =
    searchQuery || serviceType !== "all" || city !== "all" || pricingType !== "all"

  return (
    <main className="min-h-screen bg-background">
      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1400&query=Ethiopian landscape mountains')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900/80" />
        </div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary-foreground border-primary/30 backdrop-blur">
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            Verified Local Experts
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Find Your Perfect{" "}
            <span className="text-primary">Ethiopian Guide</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">
            Explore with trusted local guides, experienced drivers, talented photographers, and cultural experts — handpicked across Ethiopia.
          </p>

          {/* Hero Search */}
          <div className="mx-auto flex max-w-2xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, skill, language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-xl pl-10 text-base shadow-lg"
              />
            </div>
            <Button size="lg" className="h-12 rounded-xl px-6 shadow-lg">
              Search
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Background-checked guides
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-blue-400" />
              20+ languages spoken
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-400" />
              Certified professionals
            </span>
          </div>
        </div>
      </section>

      {/* ─── Service Category Quick-Filters ─── */}
      <section className="border-b bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isActive = serviceType === cat.type
              return (
                <button
                  key={cat.type}
                  onClick={() => handleCategorySelect(cat.type as string)}
                  className={`flex min-w-[110px] flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all hover:border-primary/40 hover:shadow-sm ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-transparent bg-background"
                  }`}
                >
                  <div className={`rounded-full p-2.5 ${isActive ? "bg-primary/15" : cat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${isActive ? "text-primary" : cat.color}`} />
                  </div>
                  <span className={`text-center text-xs font-medium leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>
                    {cat.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Filters & Results ─── */}
      <div className="container mx-auto px-4 py-8">
        {/* Secondary Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[170px]">
              <MapPin className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={pricingType} onValueChange={setPricingType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              {Object.entries(PRICING_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[175px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating_desc">Top Rated</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                Clear filters
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${totalCount} ${totalCount === 1 ? "guide" : "guides"} found`}
            </span>
          </div>
        </div>

        {/* Active category label */}
        {serviceType !== "all" && (
          <div className="mb-5 flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {SERVICE_TYPE_LABELS[serviceType as GuideServiceType]}
            </h2>
            <Badge variant="secondary">{totalCount}</Badge>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <GuideCardSkeleton key={i} />
            ))}
          </div>
        ) : guides.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Compass className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No guides found</h3>
            <p className="mb-6 text-muted-foreground">
              Try adjusting your filters or search for something else.
            </p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Why Choose Section */}
        {!loading && guides.length > 0 && (
          <section className="mt-16 rounded-2xl bg-muted/40 p-8">
            <h2 className="mb-6 text-center text-2xl font-bold">Why Book Through AMAN?</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-green-100 p-4 dark:bg-green-950/40">
                  <Shield className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-semibold">Verified & Vetted</h3>
                <p className="text-sm text-muted-foreground">
                  Every guide is personally reviewed and background-checked before listing.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-950/40">
                  <Languages className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-semibold">Multilingual Experts</h3>
                <p className="text-sm text-muted-foreground">
                  Guides fluent in English, Amharic, French, and many more languages.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-950/40">
                  <Star className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="font-semibold">Rated & Reviewed</h3>
                <p className="text-sm text-muted-foreground">
                  Real ratings from real travelers who've experienced Ethiopia firsthand.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CTA to explore cities */}
        {!loading && (
          <div className="mt-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
            <p className="text-muted-foreground">Not sure where to start?</p>
            <Link href="/cities">
              <Button variant="outline" className="gap-2">
                Browse Destinations
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default function GuidesPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className="min-h-screen bg-background">
            <div className="bg-gradient-to-br from-slate-900 to-primary/80 py-24" />
            <div className="container mx-auto px-4 py-8">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <GuideCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </main>
        }
      >
        <GuidesContent />
      </Suspense>
      <Footer />
      <FloatingAIAssistant />
    </>
  )
}
