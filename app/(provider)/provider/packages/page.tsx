"use client"

import { useEffect, useState } from "react"
import { getMediaUrl } from "@/lib/utils/media"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getProviderPackages,
  togglePackagePublish,
  deletePackage,
  type Package,
} from "@/lib/api/experiences"
import {
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Calendar,
  MapPin,
  AlertCircle,
  Package as PackageIcon,
  Globe,
  GlobeLock,
} from "lucide-react"

const CATEGORY_LABELS: Record<string, string> = {
  city_tour: "City Tour",
  multi_city: "Multi-City",
  adventure: "Adventure",
  culture: "Cultural",
  food: "Food & Culinary",
  nature: "Nature",
  spiritual: "Spiritual",
  historical: "Historical",
}

function formatCurrency(amount: string | number, currency = "ETB"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(num)
}

export default function ProviderPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPackages()
  }, [])

  async function loadPackages() {
    try {
      setLoading(true)
      const data = await getProviderPackages()
      setPackages(data)
    } catch (err: any) {
      setError(err.message || "Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  async function handleTogglePublish(pkg: Package) {
    try {
      const result = await togglePackagePublish(pkg.id)
      setPackages(packages.map(p => 
        p.id === pkg.id ? { ...p, is_published: result.is_published } : p
      ))
    } catch (err: any) {
      alert(err.message || "Failed to update publish status")
    }
  }

  async function handleDelete(pkg: Package) {
    if (!confirm(`Are you sure you want to unpublish "${pkg.title}"?`)) return
    
    try {
      await deletePackage(pkg.id)
      setPackages(packages.filter(p => p.id !== pkg.id))
    } catch (err: any) {
      alert(err.message || "Failed to delete package")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Travel Packages</h1>
          <p className="text-muted-foreground">Create and manage your travel packages</p>
        </div>
        <Link href="/provider/packages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Package
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No packages yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first travel package to start accepting bookings.
            </p>
            <Link href="/provider/packages/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Package
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={getMediaUrl(pkg.primary_photo?.photo_url) || "/placeholder.svg?height=200&width=400&query=travel package"}
                  alt={pkg.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-2 top-2">
                  <Badge variant={pkg.is_published ? "default" : "secondary"}>
                    {pkg.is_published ? (
                      <><Globe className="mr-1 h-3 w-3" /> Published</>
                    ) : (
                      <><GlobeLock className="mr-1 h-3 w-3" /> Draft</>
                    )}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{pkg.title}</h3>
                    {pkg.nickname && (
                      <p className="text-sm text-muted-foreground truncate">{pkg.nickname}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/experiences/${pkg.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Public Page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/provider/packages/${pkg.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Package
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleTogglePublish(pkg)}>
                        {pkg.is_published ? (
                          <><GlobeLock className="mr-2 h-4 w-4" /> Unpublish</>
                        ) : (
                          <><Globe className="mr-2 h-4 w-4" /> Publish</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(pkg)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">
                    {CATEGORY_LABELS[pkg.category] || pkg.category}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {pkg.duration_days} Days
                  </span>
                  {pkg.cities && pkg.cities.length > 0 && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {pkg.cities.length} {pkg.cities.length === 1 ? "City" : "Cities"}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {formatCurrency(pkg.price_per_person, pkg.price_currency)}
                    <span className="text-sm font-normal text-muted-foreground"> / person</span>
                  </span>
                  <Link href={`/provider/packages/${pkg.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
