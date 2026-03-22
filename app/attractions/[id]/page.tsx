"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TrustBadge } from "@/components/shared/trust-badge"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAttractions } from "@/lib/api/content"
import { APIError } from "@/lib/api/client"
import type { Attraction } from "@/lib/types"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Heart,
  Share2,
  AlertCircle,
  Clock,
  DollarSign,
  Users,
  Star,
  Sparkles,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useApp } from "@/lib/contexts/app-context"

export default function AttractionDetailPage() {
  const params = useParams()
  const slug = params.id as string
  const [attraction, setAttraction] = useState<Attraction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toggleSavedItem, isItemSaved } = useApp()

  useEffect(() => {
    async function loadAttraction() {
      setLoading(true)
      setError(null)

      try {
        const attractionsData = await getAttractions({ search: slug })
        const found = attractionsData.find((a: Attraction) => 
          a.slug === slug || a.id === slug || a.name?.toLowerCase().includes(slug.toLowerCase())
        )
        
        if (!found) {
          throw new APIError(404, "Attraction not found")
        }
        
        setAttraction(found)
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message)
        } else {
          setError("Failed to load attraction details. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadAttraction()
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="mb-4 h-6 w-32" />
            <Skeleton className="mb-4 h-[400px] w-full rounded-xl" />
            <div className="grid gap-8 lg:grid-cols-3">
              <Skeleton className="h-96 lg:col-span-2" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <Link href="/attractions" className="mb-6 flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Attractions
            </Link>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!attraction) return null

  const isSaved = isItemSaved(`attraction-${attraction.id}`)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Link href="/attractions" className="mb-6 flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Attractions
          </Link>

          {/* Header with Title and Actions */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold">{attraction.name}</h1>
              {attraction.category && (
                <p className="mt-2 text-lg text-muted-foreground capitalize">{attraction.category}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleSavedItem(`attraction-${attraction.id}`)}
              >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current text-red-500" : ""}`} />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {/* Hero Image */}
              <div className="mb-8 overflow-hidden rounded-xl">
                <img
                  src={attraction.image || "/placeholder.svg?height=400&width=800&query=attraction"}
                  alt={attraction.name}
                  className="h-96 w-full object-cover"
                />
              </div>

              {/* Description */}
              {attraction.description && (
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <h2 className="mb-4 text-xl font-semibold">About</h2>
                    <p className="whitespace-pre-line text-muted-foreground">{attraction.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Key Information */}
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                {attraction.entry_fee && (
                  <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <DollarSign className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Entry Fee</p>
                        <p className="text-lg font-semibold">{attraction.entry_fee}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {attraction.best_time_to_visit && (
                  <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <Clock className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Best Time</p>
                        <p className="text-lg font-semibold">{attraction.best_time_to_visit}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{attraction.city || "Not specified"}</p>
                    </div>
                    {attraction.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{attraction.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-2 border-t pt-4">
                    {attraction.contact_phone && (
                      <a href={`tel:${attraction.contact_phone}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Phone className="h-4 w-4" />
                        {attraction.contact_phone}
                      </a>
                    )}
                    {attraction.contact_email && (
                      <a href={`mailto:${attraction.contact_email}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Mail className="h-4 w-4" />
                        {attraction.contact_email}
                      </a>
                    )}
                    {attraction.website && (
                      <a href={attraction.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>

                  <Button className="w-full" size="lg">
                    Plan Visit
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <FloatingAIAssistant />
      <Footer />
    </div>
  )
}
