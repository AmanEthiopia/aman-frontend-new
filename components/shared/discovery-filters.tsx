"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { getCities, type City } from "@/lib/api/content"

interface DiscoveryFiltersProps {
  basePath: string
  additionalFilters?: {
    name: string
    label: string
    options: { value: string; label: string }[]
  }[]
}

export function DiscoveryFilters({ basePath, additionalFilters }: DiscoveryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [cities, setCities] = useState<City[]>([])

  // Fetch real cities from API
  useEffect(() => {
    async function loadCities() {
      try {
        const citiesData = await getCities()
        setCities(citiesData)
      } catch (error) {
        console.error("Failed to load cities:", error)
      }
    }
    loadCities()
  }, [])

  const currentCity = searchParams.get("city") || ""
  const currentPriceRange = searchParams.get("priceRange") || ""
  const currentSearch = searchParams.get("search") || ""
  const currentVerified = searchParams.get("verified") || ""

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${basePath}?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(basePath)
  }

  const hasFilters = currentCity || currentPriceRange || currentSearch || currentVerified

  const FilterContent = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Search */}
      <div className="lg:col-span-2">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search..."
            className="pl-9"
            defaultValue={currentSearch}
            onChange={(e) => {
              const value = e.target.value
              const timeout = setTimeout(() => {
                updateFilter("search", value)
              }, 300)
              return () => clearTimeout(timeout)
            }}
          />
        </div>
      </div>

      {/* City Filter - uses slug for API filtering */}
      <div>
        <Label htmlFor="city" className="sr-only">
          City
        </Label>
        <Select value={currentCity || "all"} onValueChange={(value) => updateFilter("city", value)}>
          <SelectTrigger id="city">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.slug}>
                {city.name}
                {city.nickname && <span className="ml-1 text-muted-foreground">({city.nickname})</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Filter */}
      <div>
        <Label htmlFor="priceRange" className="sr-only">
          Price Range
        </Label>
        <Select value={currentPriceRange || "all"} onValueChange={(value) => updateFilter("priceRange", value)}>
          <SelectTrigger id="priceRange">
            <SelectValue placeholder="All Prices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="mid-range">Mid-Range</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Verified Filter */}
      <div>
        <Label htmlFor="verified" className="sr-only">
          Verified
        </Label>
        <Select value={currentVerified || "all"} onValueChange={(value) => updateFilter("verified", value)}>
          <SelectTrigger id="verified">
            <SelectValue placeholder="All Listings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="true">Verified Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Additional Filters */}
      {additionalFilters?.map((filter) => (
        <div key={filter.name}>
          <Label htmlFor={filter.name} className="sr-only">
            {filter.label}
          </Label>
          <Select
            value={searchParams.get(filter.name) || "all"}
            onValueChange={(value) => updateFilter(filter.name, value)}
          >
            <SelectTrigger id={filter.name}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden rounded-xl border border-border bg-card p-4 shadow-sm lg:block">
        <FilterContent />
        {hasFilters && (
          <div className="mt-4 flex items-center justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="mr-1 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Filters */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9"
            defaultValue={currentSearch}
            onChange={(e) => {
              const value = e.target.value
              const timeout = setTimeout(() => {
                updateFilter("search", value)
              }, 300)
              return () => clearTimeout(timeout)
            }}
          />
        </div>
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div>
                <Label className="mb-2 block text-sm">City</Label>
                <Select value={currentCity || "all"} onValueChange={(value) => updateFilter("city", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.slug}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block text-sm">Price Range</Label>
                <Select value={currentPriceRange || "all"} onValueChange={(value) => updateFilter("priceRange", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="mid-range">Mid-Range</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block text-sm">Verification</Label>
                <Select value={currentVerified || "all"} onValueChange={(value) => updateFilter("verified", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Listings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Listings</SelectItem>
                    <SelectItem value="true">Verified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {additionalFilters?.map((filter) => (
                <div key={filter.name}>
                  <Label className="mb-2 block text-sm">{filter.label}</Label>
                  <Select
                    value={searchParams.get(filter.name) || "all"}
                    onValueChange={(value) => updateFilter(filter.name, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{filter.label}</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {hasFilters && (
                <Button variant="outline" className="w-full bg-transparent" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
