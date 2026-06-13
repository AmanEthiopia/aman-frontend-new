"use client"

import { useState, useEffect, use } from "react"
import { getMediaUrl } from "@/lib/utils/media"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Map,
  Users,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Globe,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import * as providerAPI from "@/lib/api/provider"
import type { ProviderTrip } from "@/lib/api/provider"
import { RequestVerificationButton } from "@/components/provider/request-verification-button"
import { PropertyPhotosCard } from "@/components/provider/property-photos-card"
import { TripItineraryCard } from "@/components/provider/trip-itinerary-card"

const tripTypeLabels: Record<string, string> = {
  day_trip: "Day Trip",
  multi_day: "Multi-Day",
  tour_package: "Tour Package",
  cultural_event: "Cultural Event",
  adventure: "Adventure",
  nature: "Nature",
  food: "Food & Culinary",
  spiritual: "Spiritual",
  historical: "Historical",
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [trip, setTrip] = useState<ProviderTrip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    loadTrip()
  }, [resolvedParams.id])

  async function loadTrip() {
    setIsLoading(true)
    try {
      const data = await providerAPI.getMyTrip(resolvedParams.id)
      setTrip(data)
    } catch (error) {
      console.error("[v0] Failed to load trip:", error)
      toast.error("Failed to load trip")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await providerAPI.deleteTrip(resolvedParams.id)
      toast.success("Trip deleted successfully")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to delete trip:", error)
      toast.error("Failed to delete trip")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!trip) return
    setIsPublishing(true)
    try {
      const result = await providerAPI.toggleTripPublish(resolvedParams.id)
      setTrip((prev) => prev ? { ...prev, is_active: result.is_published } : prev)
      toast.success(result.is_published ? "Trip published" : "Trip unpublished")
    } catch (error) {
      toast.error("Failed to update publish status")
    } finally {
      setIsPublishing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Trip not found</h2>
        <Link href="/provider/properties">
          <Button className="mt-4">Back to Properties</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/provider/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{trip.name}</h1>
              {trip.is_verified ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Unverified
                </Badge>
              )}
              <Badge variant={trip.is_active ? "default" : "secondary"}>
                {trip.is_active ? "Published" : "Unpublished"}
              </Badge>
              <RequestVerificationButton
                category="trip"
                propertyId={trip.id}
                isVerified={trip.is_verified}
                isPublished={trip.is_active}
              />
            </div>
            {trip.nickname && (
              <p className="text-muted-foreground">{trip.nickname}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : trip.is_active ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {trip.is_active ? "Unpublish" : "Publish"}
          </Button>
          <Link href={`/provider/properties/trips/${trip.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {trip.cover_photo_url && (
        <div className="overflow-hidden rounded-xl">
          <img
            src={getMediaUrl(trip.cover_photo_url)}
            alt={trip.name}
            className="h-64 w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Photos */}
          <PropertyPhotosCard kind="trip" propertyId={trip.id} title="Trip Photos" />

          {/* Itinerary (daily breakdown) */}
          <TripItineraryCard tripId={trip.id} />

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Trip Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{trip.description}</p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="mt-1 font-semibold">
                    {tripTypeLabels[trip.trip_type] || trip.trip_type}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="mt-1 font-semibold">
                    {trip.duration_days} {trip.duration_days === 1 ? "Day" : "Days"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Group Size</p>
                  <p className="mt-1 font-semibold">
                    {trip.min_group_size}–{trip.max_group_size} people
                  </p>
                </div>
              </div>

              {trip.important_info && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Important Info</p>
                  <p className="mt-1 text-sm">{trip.important_info}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Included / Excluded */}
          {((trip.included_services && trip.included_services.length > 0) ||
            (trip.excluded_services && trip.excluded_services.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle>What's Included / Excluded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {trip.included_services && trip.included_services.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">Included</p>
                      <ul className="space-y-1">
                        {trip.included_services.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {trip.excluded_services && trip.excluded_services.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">Not Included</p>
                      <ul className="space-y-1">
                        {trip.excluded_services.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms */}
          {trip.terms_conditions && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{trip.terms_conditions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Per person</span>
                <span className="text-lg font-bold">${trip.price_per_person}</span>
              </div>
              {trip.group_discount_percentage != null && trip.group_discount_percentage > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Group discount</span>
                  <span className="font-semibold text-green-600">{trip.group_discount_percentage}%</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Min group</span>
                <span className="font-semibold">{trip.min_group_size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Max group</span>
                <span className="font-semibold">{trip.max_group_size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Customizable</span>
                <span>
                  {trip.is_customizable ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          {(trip.rating !== undefined || trip.review_count !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {trip.rating !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-semibold">{trip.rating ?? "N/A"} / 5</span>
                  </div>
                )}
                {trip.review_count !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reviews</span>
                    <span className="font-semibold">{trip.review_count}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{trip.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
