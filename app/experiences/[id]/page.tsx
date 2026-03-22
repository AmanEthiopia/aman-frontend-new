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
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getExperiencesPaginated } from "@/lib/api/experiences"
import { APIError } from "@/lib/api/client"
import type { Experience } from "@/lib/types"
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
  Compass,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useApp } from "@/lib/contexts/app-context"

export default function ExperienceDetailPage() {
  const params = useParams()
  const slug = params.id as string
  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toggleSavedItem, isItemSaved } = useApp()

  useEffect(() => {
    async function loadExperience() {
      setLoading(true)
      setError(null)

      try {
        const response = await getExperiencesPaginated({ search: slug })
        const found = response.results?.find((e: Experience) => 
          e.slug === slug || e.id === slug || e.title?.toLowerCase().includes(slug.toLowerCase())
        )
        
        if (!found) {
          throw new APIError(404, "Experience not found")
        }
        
        setExperience(found)
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message)
        } else {
          setError("Failed to load experience details. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadExperience()
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
            <Link href="/experiences" className="mb-6 flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Experiences
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

  if (!experience) return null

  const isSaved = isItemSaved(`experience-${experience.id}`)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Link href="/experiences" className="mb-6 flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Experiences
          </Link>

          {/* Header with Title and Actions */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold">{experience.title || experience.name}</h1>
              {experience.category && (
                <p className="mt-2 text-lg text-muted-foreground capitalize">{experience.category}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleSavedItem(`experience-${experience.id}`)}
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
                  src={experience.image || experience.cover_image || "/placeholder.svg?height=400&width=800&query=experience"}
                  alt={experience.title || experience.name}
                  className="h-96 w-full object-cover"
                />
              </div>

              {/* Description */}
              {(experience.description || experience.overview) && (
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <h2 className="mb-4 text-xl font-semibold">About This Experience</h2>
                    <p className="whitespace-pre-line text-muted-foreground">{experience.description || experience.overview}</p>
                  </CardContent>
                </Card>
              )}

              {/* Experience Details */}
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                {experience.duration && (
                  <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <Clock className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-lg font-semibold">{experience.duration}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {experience.price && (
                  <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <DollarSign className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-lg font-semibold">{experience.price}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {experience.group_size && (
                  <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Group Size</p>
                        <p className="text-lg font-semibold">{experience.group_size}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Highlights */}
              {experience.highlights && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="mb-4 text-xl font-semibold">Highlights</h2>
                    <ul className="space-y-2">
                      {(Array.isArray(experience.highlights) ? experience.highlights : [experience.highlights]).map((highlight: string, i: number) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-primary">✓</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Booking Card */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{experience.location || experience.city || "Not specified"}</p>
                    </div>
                    {experience.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{experience.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-2 border-t pt-4">
                    {experience.contact_phone && (
                      <a href={`tel:${experience.contact_phone}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Phone className="h-4 w-4" />
                        {experience.contact_phone}
                      </a>
                    )}
                    {experience.contact_email && (
                      <a href={`mailto:${experience.contact_email}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Mail className="h-4 w-4" />
                        {experience.contact_email}
                      </a>
                    )}
                    {experience.website && (
                      <a href={experience.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>

                  <Button className="w-full" size="lg">
                    Book Experience
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
