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
  Camera, Car, Compass, Mountain, Mic, Sparkles, Filter 
} from "lucide-react"
import { 
  searchGuides, 
  type Guide, 
  type GuideServiceType, 
  type GuidePricingType,
  SERVICE_TYPE_LABELS,
  PRICING_TYPE_LABELS 
} from "@/lib/api/guides"
import { getCities, type City } from "@/lib/api/content"
import { CityStatsBar } from "@/components/shared/city-stats-bar"
import { SafeCardImage } from "@/components/ui/safe-image"
import { formatRating, formatPrice, toNumber } from "@/lib/utils"

const API_BASE = "https://api.aman.yichalal.ai"

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  return `${API_BASE}/media/${path}`
}

const SERVICE_TYPE_ICONS: Record<GuideServiceType, React.ReactNode> = {
  private_tour: <Compass className="h-4 w-4" />,
  group_tour: <Users className="h-4 w-4" />,
  driver: <Car className="h-4 w-4" />,
  photographer: <Camera className="h-4 w-4" />,
  hiking_guide: <Mountain className="h-4 w-4" />,
  cultural_guide: <Sparkles className="h-4 w-4" />,
  interpreter: <Mic className="h-4 w-4" />,
  custom: <Sparkles className="h-4 w-4" />,
}

function GuideCard({ guide }: { guide: Guide }) {
  const photoUrl = guide.primary_photo?.photo_url || guide.photos?.[0]?.photo_url
  const cityNames = guide.cities?.map(c => c.city.name).join(", ") || "Ethiopia"
  
  return (
    <Link href={`/guides/${guide.slug}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
        <SafeCardImage
          src={getMediaUrl(photoUrl) || "/placeholder.svg?height=300&width=400&query=tour guide ethiopia"}
          alt={guide.title}
          aspectRatio="aspect-[4/3]"
          enableHoverZoom={true}
          overlay={
            <>
              <div className="absolute left-3 top-3 flex gap-2">
                {guide.is_verified && (
                  <Badge className="flex items-center gap-1 bg-primary text-primary-foreground">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                <Badge variant="secondary" className="flex items-center gap-1">
                  {SERVICE_TYPE_ICONS[guide.service_type]}
                  {SERVICE_TYPE_LABELS[guide.service_type]}
                </Badge>
              </div>
              <div className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-1.5 text-sm font-semibold">
                ${toNumber(guide.price).toFixed(0)}
                <span className="text-xs text-muted-foreground">/{PRICING_TYPE_LABELS[guide.pricing_type].replace("Per ", "").toLowerCase()}</span>
              </div>
            </>
          }
        />
        <CardContent className="p-4">
          <h3 className="mb-1 line-clamp-1 font-semibold group-hover:text-primary">{guide.title}</h3>
          {guide.nickname && (
            <p className="mb-2 text-sm text-muted-foreground">{guide.nickname}</p>
          )}
          
          <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {cityNames}
            </span>
            {guide.years_experience && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {guide.years_experience} yrs
              </span>
            )}
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {guide.languages?.slice(0, 3).map((lang) => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
            {guide.languages?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{guide.languages.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-medium">{formatRating(guide.average_rating)}</span>
              <span className="text-sm text-muted-foreground">({guide.review_count || 0})</span>
            </div>
            {guide.max_group_size && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
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

function GuidesContent() {
  const searchParams = useSearchParams()
  const [guides, setGuides] = useState<Guide[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [serviceType, setServiceType] = useState(searchParams.get("service_type") || "all")
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
            service_type: serviceType !== "all" ? serviceType as GuideServiceType : undefined,
            city: city !== "all" ? city : undefined,
            pricing_type: pricingType !== "all" ? pricingType as GuidePricingType : undefined,
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

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Tour Guides & Services</h1>
          <p className="text-muted-foreground">
            Find experienced local guides, drivers, photographers, and interpreters for your Ethiopian adventure
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={pricingType} onValueChange={setPricingType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              {Object.entries(PRICING_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating_desc">Top Rated</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* City Stats Bar */}
        {city !== "all" && (
          <CityStatsBar citySlug={city} activeStat="guides" className="mb-6" />
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {loading ? "Loading..." : `${totalCount} guide${totalCount !== 1 ? "s" : ""} found`}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="mb-3 h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : guides.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Compass className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">No guides found</h3>
            <p className="mb-4 text-muted-foreground">
              Try adjusting your filters or search criteria
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("")
              setServiceType("all")
              setCity("all")
              setPricingType("all")
            }}>
              Clear Filters
            </Button>
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
      <Suspense fallback={
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="mb-8 h-10 w-64" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      }>
        <GuidesContent />
      </Suspense>
      <Footer />
      <FloatingAIAssistant />
    </>
  )
}
