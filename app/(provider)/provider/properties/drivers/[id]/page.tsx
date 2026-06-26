"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Car,
  MapPin,
  Users,
  Globe,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
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
import { RequestVerificationButton } from "@/components/provider/request-verification-button"
import { PropertyPhotosCard } from "@/components/provider/property-photos-card"
import * as providerAPI from "@/lib/api/provider"
import { listingActionError } from "@/lib/utils/errors"
import type { ProviderDriver } from "@/lib/api/provider"

const vehicleTypeLabels: Record<string, string> = {
  sedan: "Sedan",
  suv: "SUV",
  van: "Van",
  minibus: "Minibus",
  bus: "Bus",
  motorcycle: "Motorcycle",
}

const serviceLabels: Record<string, string> = {
  airport_pickup: "Airport Pickup",
  airport_dropoff: "Airport Drop-off",
  city_tour: "City Tour",
  intercity: "Intercity",
  hourly_rental: "Hourly Rental",
  daily_rental: "Daily Rental",
  hotel_transfer: "Hotel Transfer",
}

export default function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [driver, setDriver] = useState<ProviderDriver | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)

  useEffect(() => {
    loadDriver()
  }, [resolvedParams.id])

  async function loadDriver() {
    setIsLoading(true)
    try {
      const data = await providerAPI.getMyDriver(resolvedParams.id)
      setDriver(data)
    } catch (error) {
      console.error("[v0] Failed to load driver:", error)
      toast.error("Failed to load driver service")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await providerAPI.deleteDriver(resolvedParams.id)
      toast.success("Driver service deleted successfully")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to delete driver:", error)
      toast.error("Failed to delete driver service")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!driver) return
    // Unpublishing requires confirmation; publishing happens directly.
    if (driver.is_active) {
      setShowUnpublishDialog(true)
      return
    }
    setIsPublishing(true)
    try {
      const data = await providerAPI.toggleDriverPublish(resolvedParams.id)
      setDriver((prev) => prev ? { ...prev, is_active: data?.is_published ?? true, is_verified: data?.is_verified ?? prev.is_verified } : prev)
      toast.success("Driver service published")
    } catch (error) {
      toast.error(listingActionError(error, "Failed to publish"))
    } finally {
      setIsPublishing(false)
    }
  }

  const handleConfirmUnpublish = async () => {
    if (!driver) return
    setIsPublishing(true)
    try {
      await providerAPI.unpublishDriver(resolvedParams.id)
      setDriver((prev) => prev ? { ...prev, is_active: false } : prev)
      toast.success("Driver service unpublished — it's now hidden from travelers")
    } catch (error) {
      toast.error(listingActionError(error, "Failed to unpublish"))
    } finally {
      setIsPublishing(false)
      setShowUnpublishDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Driver service not found</h2>
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
              <h1 className="text-2xl font-bold">{driver.name}</h1>
              {driver.is_verified ? (
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
              <Badge variant={driver.is_active ? "default" : "secondary"}>
                {driver.is_active ? "Published" : "Hidden"}
              </Badge>
              <RequestVerificationButton
                category="driver"
                propertyId={driver.id}
                isVerified={driver.is_verified}
                isPublished={driver.is_active}
              />
            </div>
            {driver.nickname && (
              <p className="text-muted-foreground">{driver.nickname}</p>
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
            ) : driver.is_active ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {driver.is_active ? "Unpublish" : "Publish"}
          </Button>
          <Link href={`/provider/properties/drivers/${driver.id}/edit`}>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Photos */}
          <PropertyPhotosCard kind="driver" propertyId={driver.id} title="Vehicle Photos" />

          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{driver.description}</p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Vehicle Type</p>
                  <p className="mt-1 font-semibold capitalize">
                    {vehicleTypeLabels[driver.vehicle_type] || driver.vehicle_type}
                  </p>
                </div>
                {driver.vehicle_make && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Make</p>
                    <p className="mt-1 font-semibold">{driver.vehicle_make}</p>
                  </div>
                )}
                {driver.vehicle_model && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="mt-1 font-semibold">{driver.vehicle_model}</p>
                  </div>
                )}
                {driver.vehicle_year && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="mt-1 font-semibold">{driver.vehicle_year}</p>
                  </div>
                )}
                {driver.license_plate && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">License Plate</p>
                    <p className="mt-1 font-semibold">{driver.license_plate}</p>
                  </div>
                )}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Max Passengers</p>
                  <p className="mt-1 font-semibold">{driver.max_passengers} people</p>
                </div>
              </div>

              {driver.city_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{driver.address ? `${driver.address}, ` : ""}{driver.city_name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          {driver.services && driver.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {driver.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {serviceLabels[service] || service}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    {driver.is_airport_pickup ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>Airport Pickup</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {driver.is_available_24h ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>Available 24/7</span>
                  </div>
                </div>
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
              {driver.price_per_km != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Per km</span>
                  <span className="font-semibold">${driver.price_per_km}</span>
                </div>
              )}
              {driver.price_per_hour != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Per hour</span>
                  <span className="font-semibold">${driver.price_per_hour}</span>
                </div>
              )}
              {driver.price_per_day != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Per day</span>
                  <span className="font-semibold">${driver.price_per_day}</span>
                </div>
              )}
              {driver.price_per_km == null && driver.price_per_hour == null && driver.price_per_day == null && (
                <p className="text-sm text-muted-foreground">No pricing set</p>
              )}
            </CardContent>
          </Card>

          {/* Languages */}
          {driver.languages && driver.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {driver.languages.map((lang) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          {(driver.rating !== undefined || driver.review_count !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {driver.rating !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-semibold">{driver.rating ?? "N/A"} / 5</span>
                  </div>
                )}
                {driver.review_count !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reviews</span>
                    <span className="font-semibold">{driver.review_count}</span>
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
            <AlertDialogTitle>Delete Driver Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{driver.name}"? This cannot be undone.
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

      {/* Unpublish Confirmation */}
      <AlertDialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be hidden from travelers until you publish it again. Your data,
              bookings and reviews are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnpublish} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unpublishing...
                </>
              ) : (
                "Unpublish"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
