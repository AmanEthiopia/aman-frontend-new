"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  Trash2,
  UtensilsCrossed,
  MapPin,
  Clock,
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
import * as providerAPI from "@/lib/api/provider"
import type { ProviderRestaurant } from "@/lib/api/provider"

const priceRangeLabels: Record<string, string> = {
  budget: "Budget",
  moderate: "Moderate",
  mid_range: "Mid-Range",
  upscale: "Upscale",
  fine_dining: "Fine Dining",
}

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
}

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<ProviderRestaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    loadRestaurant()
  }, [resolvedParams.id])

  async function loadRestaurant() {
    setIsLoading(true)
    try {
      const data = await providerAPI.getMyRestaurant(resolvedParams.id)
      setRestaurant(data)
    } catch (error) {
      console.error("[v0] Failed to load restaurant:", error)
      toast.error("Failed to load restaurant")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await providerAPI.deleteRestaurant(resolvedParams.id)
      toast.success("Restaurant deleted successfully")
      router.push("/provider/properties")
    } catch (error) {
      console.error("[v0] Failed to delete restaurant:", error)
      toast.error("Failed to delete restaurant")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!restaurant) return
    setIsPublishing(true)
    try {
      const result = await providerAPI.publishRestaurant(resolvedParams.id)
      setRestaurant((prev) => prev ? { ...prev, is_active: result.is_published, is_verified: result.is_verified } : prev)
      toast.success(result.is_published ? "Restaurant published" : "Restaurant unpublished")
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

  if (!restaurant) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Restaurant not found</h2>
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
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              {restaurant.is_verified ? (
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
              <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                {restaurant.is_active ? "Published" : "Unpublished"}
              </Badge>
            </div>
            {restaurant.nickname && (
              <p className="text-muted-foreground">{restaurant.nickname}</p>
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
            ) : restaurant.is_active ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {restaurant.is_active ? "Unpublish" : "Publish"}
          </Button>
          <Link href={`/provider/properties/restaurants/${restaurant.id}/edit`}>
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
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Restaurant Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{restaurant.description}</p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Cuisine</p>
                    <p className="mt-1 font-semibold capitalize">
                      {restaurant.cuisine_types.join(", ")}
                    </p>
                  </div>
                )}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Price Range</p>
                  <p className="mt-1 font-semibold">
                    {priceRangeLabels[restaurant.price_range] || restaurant.price_range}
                  </p>
                </div>
                {restaurant.seating_capacity != null && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Seating</p>
                    <p className="mt-1 font-semibold">{restaurant.seating_capacity} seats</p>
                  </div>
                )}
              </div>

              {restaurant.city_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{restaurant.address ? `${restaurant.address}, ` : ""}{restaurant.city_name}</span>
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  {restaurant.has_dine_in ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>Dine-in</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {restaurant.has_takeaway ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>Takeaway</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {restaurant.has_delivery ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>Delivery</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          {restaurant.opening_hours && Object.keys(restaurant.opening_hours).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Opening Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DAY_ORDER.map((day) => {
                    const hours = restaurant.opening_hours[day]
                    if (!hours) return null
                    return (
                      <div key={day} className="flex items-center justify-between text-sm">
                        <span className="w-12 font-medium capitalize">{DAY_LABELS[day]}</span>
                        <span className="text-muted-foreground">{hours}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Menu */}
          {restaurant.menu_url && (
            <Card>
              <CardHeader>
                <CardTitle>Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={restaurant.menu_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline underline-offset-4"
                >
                  View Menu
                </a>
              </CardContent>
            </Card>
          )}

          {/* Performance */}
          {(restaurant.rating !== undefined || restaurant.review_count !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {restaurant.rating !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-semibold">{restaurant.rating ?? "N/A"} / 5</span>
                  </div>
                )}
                {restaurant.review_count !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reviews</span>
                    <span className="font-semibold">{restaurant.review_count}</span>
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
            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{restaurant.name}"? This cannot be undone.
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
