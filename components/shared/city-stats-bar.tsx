"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Hotel, Utensils, Compass, Car, Loader2, RefreshCw } from "lucide-react"
import { getCityDetail, getCities, type City, type CityDetail } from "@/lib/api/content"
import { cn } from "@/lib/utils"

interface StatItemProps {
  icon: React.ReactNode
  label: string
  count: number
  href: string
  citySlug: string
  isLoading: boolean
}

function StatItem({ icon, label, count, href, citySlug, isLoading }: StatItemProps) {
  return (
    <Link
      href={`${href}?city=${citySlug}`}
      className="group flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
    >
      <span className="text-primary">{icon}</span>
      <span className="font-medium text-foreground">
        {isLoading ? (
          <span className="inline-block h-3.5 w-8 animate-pulse rounded bg-muted" />
        ) : (
          <span className="tabular-nums">{count.toLocaleString()}</span>
        )}
      </span>
      <span className="text-muted-foreground group-hover:text-foreground">{label}</span>
    </Link>
  )
}

interface CityStatsBarProps {
  /** The city slug from the active URL filter (e.g. "addis-ababa") */
  citySlug?: string | null
  /** Which stat to highlight as "current" (the page the user is on) */
  activeStat?: "hotels" | "restaurants" | "experiences" | "transport"
  className?: string
}

export function CityStatsBar({ citySlug, activeStat, className }: CityStatsBarProps) {
  const [cityData, setCityData] = useState<City | CityDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const loadCityStats = useCallback(async (slug: string) => {
    setIsLoading(true)
    setError(false)
    try {
      // getCityDetail returns richer counts including experiences, restaurants
      const data = await getCityDetail(slug)
      setCityData(data)
    } catch {
      // Fallback: try listing endpoint which also has counts
      try {
        const cities = await getCities()
        const match = cities.find((c) => c.slug === slug)
        if (match) setCityData(match)
        else setError(true)
      } catch {
        setError(true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (citySlug) {
      loadCityStats(citySlug)
    } else {
      setCityData(null)
    }
  }, [citySlug, loadCityStats])

  // No city selected — nothing to show
  if (!citySlug) return null

  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Could not load city stats.</span>
        <button
          onClick={() => citySlug && loadCityStats(citySlug)}
          className="text-primary underline-offset-4 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  const hotelCount = cityData?.hotels_count ?? 0
  const restaurantCount = cityData?.restaurants_count ?? 0
  const experienceCount = cityData?.experiences_count ?? 0
  const cityName = cityData?.name ?? citySlug

  const stats = [
    {
      key: "hotels",
      icon: <Hotel className="h-4 w-4" />,
      label: "Hotels",
      count: hotelCount,
      href: "/hotels",
    },
    {
      key: "restaurants",
      icon: <Utensils className="h-4 w-4" />,
      label: "Restaurants",
      count: restaurantCount,
      href: "/restaurants",
    },
    {
      key: "experiences",
      icon: <Compass className="h-4 w-4" />,
      label: "Experiences",
      count: experienceCount,
      href: "/experiences",
    },
    {
      key: "transport",
      icon: <Car className="h-4 w-4" />,
      label: "Transport",
      count: (cityData as any)?.transport_count ?? 0,
      href: "/transport",
    },
  ] as const

  return (
    <div className={cn("rounded-xl border border-border bg-muted/30 p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          <p className="text-sm font-medium text-foreground">
            Available in{" "}
            <span className="text-primary">
              {isLoading ? (
                <span className="inline-block h-3.5 w-20 animate-pulse rounded bg-muted align-middle" />
              ) : (
                cityName
              )}
            </span>
          </p>
        </div>
        <Link
          href={`/cities/${citySlug}`}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          Explore city
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {stats.map((stat) => (
          <Link
            key={stat.key}
            href={`${stat.href}?city=${citySlug}`}
            className={cn(
              "group flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all hover:shadow-sm",
              activeStat === stat.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            <span
              className={cn(
                activeStat === stat.key ? "text-primary-foreground" : "text-primary"
              )}
            >
              {stat.icon}
            </span>
            <span className="tabular-nums font-semibold">
              {isLoading ? (
                <span className="inline-block h-3.5 w-6 animate-pulse rounded bg-current opacity-30 align-middle" />
              ) : (
                stat.count.toLocaleString()
              )}
            </span>
            <span
              className={cn(
                "font-normal",
                activeStat === stat.key
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              {stat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
