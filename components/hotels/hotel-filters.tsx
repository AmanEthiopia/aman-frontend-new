"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import type { City } from "@/lib/types"

interface HotelFiltersProps {
  cities: City[]
}

export function HotelFilters({ cities }: HotelFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCity = searchParams.get("city") || ""
  const currentPriceRange = searchParams.get("priceRange") || ""
  const currentSearch = searchParams.get("search") || ""
  const currentVerified = searchParams.get("verified") || ""

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/hotels?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/hotels")
  }

  const hasFilters = currentCity || currentPriceRange || currentSearch || currentVerified

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="lg:col-span-2">
          <Label htmlFor="search" className="sr-only">
            Search hotels
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search hotels..."
              className="pl-9"
              defaultValue={currentSearch}
              onChange={(e) => {
                const value = e.target.value
                // Debounce search
                const timeout = setTimeout(() => {
                  updateFilter("search", value)
                }, 300)
                return () => clearTimeout(timeout)
              }}
            />
          </div>
        </div>

        {/* City Filter */}
        <div>
          <Label htmlFor="city" className="sr-only">
            City
          </Label>
          <Select value={currentCity} onValueChange={(value) => updateFilter("city", value)}>
            <SelectTrigger id="city">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
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
          <Select value={currentPriceRange} onValueChange={(value) => updateFilter("priceRange", value)}>
            <SelectTrigger id="priceRange">
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="budget">Budget ($0-$50)</SelectItem>
              <SelectItem value="mid-range">Mid-Range ($50-$150)</SelectItem>
              <SelectItem value="luxury">Luxury ($150+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Verified Filter */}
        <div>
          <Label htmlFor="verified" className="sr-only">
            Verified
          </Label>
          <Select value={currentVerified} onValueChange={(value) => updateFilter("verified", value)}>
            <SelectTrigger id="verified">
              <SelectValue placeholder="All Hotels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hotels</SelectItem>
              <SelectItem value="true">Verified Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="mr-1 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
