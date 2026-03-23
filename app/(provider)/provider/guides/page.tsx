"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Plus, Compass, Star, MapPin, Languages, Clock, Users, 
  MoreHorizontal, Edit, Eye, EyeOff, Trash2, Shield
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  getProviderGuides, 
  toggleGuidePublish, 
  deleteGuide,
  type Guide,
  SERVICE_TYPE_LABELS,
  PRICING_TYPE_LABELS
} from "@/lib/api/guides"
import { toast } from "sonner"

const API_BASE = "https://api.aman.yichalal.ai"

function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/media/")) return `${API_BASE}${path}`
  return `${API_BASE}/media/${path}`
}

export default function ProviderGuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)

  const loadGuides = async () => {
    setLoading(true)
    try {
      const data = await getProviderGuides()
      setGuides(data)
    } catch (error) {
      toast.error("Failed to load guides")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGuides()
  }, [])

  const handleTogglePublish = async (guide: Guide) => {
    try {
      const result = await toggleGuidePublish(guide.id)
      setGuides(guides.map(g => 
        g.id === guide.id ? { ...g, is_published: result.is_published } : g
      ))
      toast.success(result.is_published ? "Guide published" : "Guide unpublished")
    } catch (error) {
      toast.error("Failed to update guide status")
    }
  }

  const handleDelete = async (guide: Guide) => {
    if (!confirm(`Are you sure you want to delete "${guide.title}"?`)) return
    try {
      await deleteGuide(guide.id)
      setGuides(guides.filter(g => g.id !== guide.id))
      toast.success("Guide deleted successfully")
    } catch (error) {
      toast.error("Failed to delete guide")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Guide Services</h1>
          <p className="text-muted-foreground">Manage your tour guide, driver, and interpreter services</p>
        </div>
        <Button asChild>
          <Link href="/provider/guides/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Guide Service
          </Link>
        </Button>
      </div>

      {/* Guides List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : guides.length === 0 ? (
        <Card className="py-16 text-center">
          <Compass className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold">No guide services yet</h3>
          <p className="mb-4 text-muted-foreground">
            Create your first guide service to start receiving bookings
          </p>
          <Button asChild>
            <Link href="/provider/guides/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Guide Service
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const photoUrl = guide.primary_photo?.photo_url || guide.photos?.[0]?.photo_url
            const cityNames = guide.cities?.map(c => c.city.name).join(", ") || "Not set"
            
            return (
              <Card key={guide.id} className="overflow-hidden">
                <div className="relative h-40">
                  <img
                    src={getMediaUrl(photoUrl) || "/placeholder.svg?height=160&width=300&query=tour guide service"}
                    alt={guide.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 flex gap-2">
                    {guide.is_verified && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Shield className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    <Badge variant={guide.is_published ? "default" : "secondary"}>
                      {guide.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="outline" className="bg-background/80">
                      ${parseFloat(guide.price).toFixed(0)}/{PRICING_TYPE_LABELS[guide.pricing_type].replace("Per ", "").toLowerCase()}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="line-clamp-1 font-semibold">{guide.title}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/provider/guides/${guide.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePublish(guide)}>
                          {guide.is_published ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(guide)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {SERVICE_TYPE_LABELS[guide.service_type]}
                  </Badge>
                  
                  <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {cityNames}
                    </div>
                    {guide.years_experience && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {guide.years_experience} years experience
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium">{parseFloat(guide.average_rating || "0").toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({guide.review_count || 0})</span>
                    </div>
                    {guide.languages && guide.languages.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Languages className="h-3.5 w-3.5" />
                        {guide.languages.length} languages
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
