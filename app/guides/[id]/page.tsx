"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, Star, MapPin, Languages, Clock, Users, Shield, 
  Camera, Car, Compass, Mountain, Mic, Sparkles, CheckCircle,
  Calendar, DollarSign, Award, MessageSquare, ChevronLeft, ChevronRight
} from "lucide-react"
import { 
  getGuideBySlug, 
  type Guide, 
  type GuideServiceType,
  SERVICE_TYPE_LABELS,
  PRICING_TYPE_LABELS 
} from "@/lib/api/guides"
import { SafeImage } from "@/components/ui/safe-image"
import { AddToItineraryButton } from "@/components/itinerary/add-to-itinerary-button"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { ContactDialog } from "@/components/messaging/contact-dialog"

const API_BASE = "https://api.aman.yichalal.ai"

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  return `${API_BASE}/media/${path}`
}

const SERVICE_TYPE_ICONS: Record<GuideServiceType, React.ReactNode> = {
  private_tour: <Compass className="h-5 w-5" />,
  group_tour: <Users className="h-5 w-5" />,
  driver: <Car className="h-5 w-5" />,
  photographer: <Camera className="h-5 w-5" />,
  hiking_guide: <Mountain className="h-5 w-5" />,
  cultural_guide: <Sparkles className="h-5 w-5" />,
  interpreter: <Mic className="h-5 w-5" />,
  custom: <Sparkles className="h-5 w-5" />,
}

export default function GuideDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string
  
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  useEffect(() => {
    async function loadGuide() {
      try {
        setLoading(true)
        const data = await getGuideBySlug(slug)
        setGuide(data)
      } catch (err) {
        setError("Guide not found")
      } finally {
        setLoading(false)
      }
    }
    if (slug) loadGuide()
  }, [slug])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="mb-6 h-8 w-32" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Skeleton className="mb-4 aspect-video w-full rounded-xl" />
                <Skeleton className="mb-2 h-8 w-3/4" />
                <Skeleton className="mb-4 h-4 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !guide) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <Compass className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
            <h1 className="mb-2 text-2xl font-bold">Guide Not Found</h1>
            <p className="mb-4 text-muted-foreground">The guide you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/guides")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guides
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const photos = guide.photos || []
  const currentPhoto = photos[currentPhotoIndex]
  const cityNames = guide.cities?.map(c => c.city.name).join(", ") || "Ethiopia"

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Photo Gallery */}
              {photos.length > 0 ? (
                <div className="relative mb-6 overflow-hidden rounded-xl">
                  <SafeImage
                    src={getMediaUrl(currentPhoto?.photo_url)}
                    alt={guide.title}
                    className="aspect-video w-full object-cover"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentPhotoIndex(i => (i - 1 + photos.length) % photos.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg transition-colors hover:bg-background"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentPhotoIndex(i => (i + 1) % photos.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg transition-colors hover:bg-background"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                        {photos.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPhotoIndex(i)}
                            className={`h-2 w-2 rounded-full transition-colors ${
                              i === currentPhotoIndex ? "bg-primary" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {currentPhoto?.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-sm text-white">{currentPhoto.caption}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6 flex aspect-video items-center justify-center rounded-xl bg-muted">
                  <Compass className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}

              {/* Title & Badges */}
              <div className="mb-6">
                <div className="mb-3 flex flex-wrap items-start gap-2">
                  {guide.is_verified && (
                    <Badge className="flex items-center gap-1 bg-primary">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {SERVICE_TYPE_ICONS[guide.service_type]}
                    {SERVICE_TYPE_LABELS[guide.service_type]}
                  </Badge>
                </div>
                <h1 className="mb-2 text-3xl font-bold">{guide.title}</h1>
                {guide.nickname && (
                  <p className="mb-3 text-lg text-muted-foreground">{guide.nickname}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {cityNames}
                  </span>
                  {guide.years_experience && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {guide.years_experience} years experience
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    {parseFloat(guide.average_rating || "0").toFixed(1)} ({guide.review_count || 0} reviews)
                  </span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Description */}
              {guide.description && (
                <div className="mb-8">
                  <h2 className="mb-3 text-xl font-semibold">About</h2>
                  <p className="whitespace-pre-wrap text-muted-foreground">{guide.description}</p>
                </div>
              )}

              {/* Languages */}
              {guide.languages && guide.languages.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-3 text-xl font-semibold flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Languages
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {guide.languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-sm">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Operating Cities */}
              {guide.cities && guide.cities.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-3 text-xl font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Operating Locations
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {guide.cities.map((cityEntry) => (
                      <Link key={cityEntry.id} href={`/cities/${cityEntry.city.slug}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                          {cityEntry.city.name}
                          {cityEntry.city.nickname && ` (${cityEntry.city.nickname})`}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {guide.certifications && guide.certifications.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-3 text-xl font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </h2>
                  <ul className="space-y-2">
                    {guide.certifications.map((cert, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cancellation Policy */}
              {guide.cancellation_policy && (
                <div className="mb-8">
                  <h2 className="mb-3 text-xl font-semibold">Cancellation Policy</h2>
                  <p className="text-muted-foreground">{guide.cancellation_policy}</p>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      ${parseFloat(guide.price).toFixed(0)}
                      <span className="text-base font-normal text-muted-foreground">
                        /{PRICING_TYPE_LABELS[guide.pricing_type].replace("Per ", "").toLowerCase()}
                      </span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick Info */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Service Type</span>
                      <span className="font-medium">{SERVICE_TYPE_LABELS[guide.service_type]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pricing</span>
                      <span className="font-medium">{PRICING_TYPE_LABELS[guide.pricing_type]}</span>
                    </div>
                    {guide.max_group_size && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Max Group Size</span>
                        <span className="font-medium">{guide.max_group_size} people</span>
                      </div>
                    )}
                    {guide.min_group_size && guide.min_group_size > 1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Min Group Size</span>
                        <span className="font-medium">{guide.min_group_size} people</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Book Button */}
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/book/guide/${guide.slug}`}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Book This Guide
                    </Link>
                  </Button>

{/* Contact Button */}
<ContactDialog
  contextType="guide"
  contextId={guide.id}
  contextName={guide.title || guide.nickname || "Guide"}
  trigger={
    <Button variant="outline" size="lg" className="w-full">
      <MessageSquare className="mr-2 h-4 w-4" />
      Contact Guide
    </Button>
  }
/>

{/* Add to Itinerary */}
<AddToItineraryButton
  itemType="guide"
  itemId={guide.id}
  itemName={guide.title || guide.nickname || "Guide"}
  variant="outline"
  size="lg"
  className="w-full"
/>

                  {/* Guide Info */}
                  {guide.organizer && (
                    <div className="mt-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Compass className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{guide.organizer.name}</p>
                        <p className="text-sm text-muted-foreground">Your Guide</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Reviews Section */}
            <div className="lg:col-span-2 mt-8">
              <ReviewsSection
                contentType="guide"
                contentId={guide.id}
                averageRating={guide.average_rating ? parseFloat(guide.average_rating) : 0}
                reviewCount={guide.review_count || 0}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingAIAssistant />
    </>
  )
}
