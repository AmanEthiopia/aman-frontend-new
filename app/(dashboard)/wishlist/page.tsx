"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Heart, MapPin, Star, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  getWishlists,
  removeFromWishlist,
  WISHLIST_ITEM_TYPE_LABELS,
  type WishlistItem,
  type WishlistItemType,
} from "@/lib/api/wishlists"
import { SafeCardImage } from "@/components/ui/safe-image"
import { toast } from "sonner"

type FilterTab = "all" | WishlistItemType

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "hotel", label: "Hotels" },
  { id: "restaurant", label: "Restaurants" },
  { id: "experience", label: "Experiences" },
  { id: "guide", label: "Guides" },
  { id: "driver", label: "Drivers" },
]

const TYPE_HREF: Record<WishlistItemType, string> = {
  hotel: "/hotels",
  restaurant: "/restaurants",
  experience: "/experiences",
  guide: "/guides",
  driver: "/transport",
}

function WishlistCard({
  item,
  onRemove,
}: {
  item: WishlistItem
  onRemove: (wishlistId: string) => void
}) {
  const { item: detail, item_type } = item
  const href = `${TYPE_HREF[item_type]}/${detail.slug || detail.id}`
  const rating = parseFloat(detail.average_rating || "0")

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative">
        <Link href={href}>
          <SafeCardImage
            src={detail.photo_url || "/placeholder.svg?height=200&width=300&query=travel"}
            alt={detail.title}
            aspectRatio="aspect-[4/3]"
            enableHoverZoom
            overlay={
              <div className="absolute left-3 top-3">
                <Badge variant="secondary" className="text-xs">
                  {WISHLIST_ITEM_TYPE_LABELS[item_type]}
                </Badge>
              </div>
            }
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background hover:text-destructive"
          onClick={() => onRemove(item.id)}
          aria-label="Remove from wishlist"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-4">
        <Link href={href}>
          <h3 className="line-clamp-1 font-semibold hover:text-primary">{detail.title}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{detail.city}</span>
        </div>
        {rating > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function WishlistSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  )
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWishlists()
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleRemove = async (wishlistItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== wishlistItemId))
    try {
      await removeFromWishlist(wishlistItemId)
      toast.success("Removed from wishlist")
    } catch {
      toast.error("Failed to remove item")
      load() // re-fetch to restore
    }
  }

  const filtered =
    activeTab === "all" ? items : items.filter((i) => i.item_type === activeTab)

  // Tab counts
  const counts = items.reduce<Record<string, number>>(
    (acc, i) => ({ ...acc, [i.item_type]: (acc[i.item_type] ?? 0) + 1 }),
    {}
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground">
          {items.length > 0 ? `${items.length} saved ${items.length === 1 ? "item" : "items"}` : "No saved items yet"}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/40 p-1">
        {TABS.map((tab) => {
          const count = tab.id === "all" ? items.length : counts[tab.id]
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {count > 0 && (
                <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">
                  {count}
                </Badge>
              )}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <WishlistSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-background py-20 text-center">
          <Heart className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold">No saved items</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === "all"
              ? "Start exploring and save places you love"
              : `No ${WISHLIST_ITEM_TYPE_LABELS[activeTab as WishlistItemType]?.toLowerCase()} saved yet`}
          </p>
          <Link href="/home" className="mt-4">
            <Button>Explore AMAN</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <WishlistCard key={item.id} item={item} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
