"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, Search } from "lucide-react"
import { searchHotels } from "@/lib/api/hotels"
import { getRestaurantsPaginated } from "@/lib/api/restaurants"
import { getAttractions } from "@/lib/api/content"

export type ResourceKind = "hotel" | "restaurant" | "attraction"

export interface PickedResource {
  id: string
  name: string
  subtitle?: string
}

async function search(kind: ResourceKind, query: string): Promise<PickedResource[]> {
  try {
    if (kind === "hotel") {
      const res = await searchHotels({ search: query, page_size: 8 })
      return (res.results as any[]).map((h) => ({
        id: h.id,
        name: h.name,
        subtitle: h.city_name || h.address,
      }))
    }
    if (kind === "restaurant") {
      const res = await getRestaurantsPaginated({ search: query, page_size: 8 })
      return res.results.map((r) => ({
        id: r.id,
        name: r.name,
        subtitle: r.city_name || (r as any).city?.name,
      }))
    }
    const attractions = await getAttractions({ search: query })
    return attractions.slice(0, 8).map((a: any) => ({
      id: a.id,
      name: a.name,
      subtitle: a.city_name || a.category,
    }))
  } catch {
    return []
  }
}

/**
 * Debounced search-and-pick for platform listings (hotels, restaurants,
 * attractions). Calls onPick with the chosen resource.
 */
export function ResourcePicker({
  kind,
  onPick,
}: {
  kind: ResourceKind
  onPick: (resource: PickedResource) => void
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PickedResource[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      search(kind, query).then((r) => {
        setResults(r)
        setLoading(false)
      })
    }, 350)
    return () => clearTimeout(t)
  }, [kind, query])

  const placeholder =
    kind === "hotel" ? "Search hotels…" : kind === "restaurant" ? "Search restaurants…" : "Search attractions…"

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-1">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        ) : results.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            No {kind}s found{query ? ` for "${query}"` : ""}.
          </p>
        ) : (
          results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r)}
              className="flex w-full items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
            >
              <span className="truncate font-medium">{r.name}</span>
              {r.subtitle && (
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {r.subtitle}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
