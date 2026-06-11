"use client"

import { useState, useEffect, Suspense } from "react"
import { formatRating } from "@/lib/utils"
import { getMediaUrl } from "@/lib/utils/media"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Building2,
  UtensilsCrossed,
  Car,
  Map,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MapPin,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import type { PropertyBase, PropertyCategory } from "@/lib/api/provider"

const propertyTypeConfig: Record<PropertyCategory, { 
  label: string
  icon: typeof Building2
  color: string
  bgColor: string
  href: string
}> = {
  hotel: {
    label: "Hotel",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950",
    href: "/provider/properties/hotels",
  },
  restaurant: {
    label: "Restaurant",
    icon: UtensilsCrossed,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    href: "/provider/properties/restaurants",
  },
  driver: {
    label: "Driver",
    icon: Car,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-950",
    href: "/provider/properties/drivers",
  },
  trip: {
    label: "Trip/Event",
    icon: Map,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-950",
    href: "/provider/properties/trips",
  },
}

function PropertyCard({
  property,
  onView,
  onEdit,
  onDelete,
}: {
  property: PropertyBase
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const config = propertyTypeConfig[property.category]
  const Icon = config.icon

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10]">
        {property.cover_photo_url ? (
          <img
            src={getMediaUrl(property.cover_photo_url)}
            alt={property.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-2">
          <Badge className={`${config.bgColor} ${config.color} border-0`}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
          {property.is_verified ? (
            <Badge className="bg-green-100 text-green-700 border-0 dark:bg-green-950 dark:text-green-400">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-300">
              <XCircle className="mr-1 h-3 w-3" />
              Unverified
            </Badge>
          )}
        </div>
        {!property.is_active && (
          <div className="absolute right-2 top-2">
            <Badge variant="secondary" className="bg-gray-900/70 text-white">
              Inactive
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="truncate font-semibold">{property.name}</h3>
            {property.nickname && (
              <p className="truncate text-sm text-muted-foreground">{property.nickname}</p>
            )}
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{property.city_name || property.address}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {(property.rating !== undefined || property.review_count !== undefined) && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            {property.rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{formatRating(property.rating)}</span>
              </div>
            )}
            {property.review_count !== undefined && (
              <span className="text-muted-foreground">
                {property.review_count} review{property.review_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AddPropertyCard({ type }: { type: PropertyCategory }) {
  const config = propertyTypeConfig[type]
  const Icon = config.icon

  return (
    <Link href={`/provider/properties/new?type=${type}`}>
      <Card className="flex h-full min-h-[240px] cursor-pointer flex-col items-center justify-center border-2 border-dashed text-muted-foreground transition-all hover:border-primary hover:text-primary">
        <div className={`rounded-full p-4 ${config.bgColor}`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add {config.label}</span>
        </div>
      </Card>
    </Link>
  )
}

function ProviderPropertiesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<PropertyBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | PropertyCategory>(() => {
    const tab = searchParams.get("tab") as PropertyCategory | null
    return tab && ["hotel", "restaurant", "driver", "trip"].includes(tab) ? tab : "all"
  })
  const [deleteProperty, setDeleteProperty] = useState<PropertyBase | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadProperties()
  }, [activeTab])

  async function loadProperties() {
    setIsLoading(true)
    try {
      const params: { category?: PropertyCategory } = {}
      if (activeTab !== "all") {
        params.category = activeTab
      }
      
      const response = await providerAPI.getMyProperties(params)
      // API returns data as a direct array (not PaginatedResponse.results)
      setProperties(Array.isArray(response) ? response : (response?.results ?? []))
    } catch (error) {
      console.error("[v0] Failed to load properties:", error)
      toast.error("We couldn't load your properties. Please refresh the page.")
      setProperties([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProperties = properties.filter((p) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(query) ||
      p.nickname?.toLowerCase().includes(query) ||
      p.city_name?.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query)
    )
  })

  const handleDelete = async () => {
    if (!deleteProperty) return
    
    setIsDeleting(true)
    try {
      switch (deleteProperty.category) {
        case "hotel":
          await providerAPI.deleteHotel(deleteProperty.id)
          break
        case "restaurant":
          await providerAPI.deleteRestaurant(deleteProperty.id)
          break
        case "driver":
          await providerAPI.deleteDriver(deleteProperty.id)
          break
        case "trip":
          await providerAPI.deleteTrip(deleteProperty.id)
          break
      }
      
      setProperties((prev) => prev.filter((p) => p.id !== deleteProperty.id))
      toast.success(`${propertyTypeConfig[deleteProperty.category].label} deleted successfully`)
    } catch (error) {
      console.error("[v0] Failed to delete property:", error)
      toast.error("Failed to delete property")
    } finally {
      setIsDeleting(false)
      setDeleteProperty(null)
    }
  }

  const handleView = (property: PropertyBase) => {
    router.push(`/provider/properties/${property.category}s/${property.id}`)
  }

  const handleEdit = (property: PropertyBase) => {
    router.push(`/provider/properties/${property.category}s/${property.id}/edit`)
  }

  const categoryCounts: Record<"all" | PropertyCategory, number> = {
    all: properties.length,
    hotel: properties.filter((p) => p.category === "hotel").length,
    restaurant: properties.filter((p) => p.category === "restaurant").length,
    driver: properties.filter((p) => p.category === "driver").length,
    trip: properties.filter((p) => p.category === "trip").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Properties</h1>
          <p className="text-muted-foreground">Manage all your listed properties</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {(Object.keys(propertyTypeConfig) as PropertyCategory[])
              .filter((type) => type !== "trip")
              .map((type) => {
                const config = propertyTypeConfig[type]
                const Icon = config.icon
                return (
                  <DropdownMenuItem key={type} asChild>
                    <Link href={`/provider/properties/new?type=${type}`} className="flex items-center">
                      <Icon className={`mr-2 h-4 w-4 ${config.color}`} />
                      {config.label}
                    </Link>
                  </DropdownMenuItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary">{categoryCounts.all}</Badge>
          </TabsTrigger>
          {(Object.keys(propertyTypeConfig) as PropertyCategory[]).map((type) => {
            const config = propertyTypeConfig[type]
            const Icon = config.icon
            return (
              <TabsTrigger key={type} value={type} className="gap-2">
                <Icon className="h-4 w-4" />
                {config.label}s
                {categoryCounts[type] > 0 && (
                  <Badge variant="secondary">{categoryCounts[type]}</Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onView={() => handleView(property)}
                  onEdit={() => handleEdit(property)}
                  onDelete={() => setDeleteProperty(property)}
                />
              ))}
              {/* Add property card for current tab */}
              {activeTab !== "all" && <AddPropertyCard type={activeTab} />}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                {activeTab === "all" ? (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                ) : (
                  (() => {
                    const Icon = propertyTypeConfig[activeTab].icon
                    return <Icon className="h-8 w-8 text-muted-foreground" />
                  })()
                )}
              </div>
              <h3 className="text-lg font-semibold">No properties yet</h3>
              <p className="mt-1 text-muted-foreground">
                {activeTab === "all"
                  ? "Start by adding your first property"
                  : `Add your first ${propertyTypeConfig[activeTab].label.toLowerCase()}`}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {activeTab === "all" ? (
                  (Object.keys(propertyTypeConfig) as PropertyCategory[]).map((type) => {
                    const config = propertyTypeConfig[type]
                    const Icon = config.icon
                    return (
                      <Link key={type} href={`/provider/properties/new?type=${type}`}>
                        <Button variant="outline" className="gap-2">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          Add {config.label}
                        </Button>
                      </Link>
                    )
                  })
                ) : (
                  <Link href={`/provider/properties/new?type=${activeTab}`}>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add {propertyTypeConfig[activeTab].label}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProperty} onOpenChange={() => setDeleteProperty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProperty?.name}"? This action cannot be undone
              and will remove all associated data including bookings and reviews.
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

export default function ProviderPropertiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ProviderPropertiesContent />
    </Suspense>
  )
}
