"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleWishlist, type WishlistItemType } from "@/lib/api/wishlists"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  itemType: WishlistItemType
  itemId: string
  initialWishlisted?: boolean
  className?: string
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "ghost" | "outline" | "default"
}

export function WishlistButton({
  itemType,
  itemId,
  initialWishlisted = false,
  className,
  size = "icon",
  variant = "ghost",
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuth()
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.info("Sign in to save items to your wishlist")
      return
    }

    // Optimistic update
    const prev = wishlisted
    setWishlisted(!prev)
    setLoading(true)

    try {
      const result = await toggleWishlist(itemType, itemId)
      setWishlisted(result.is_wishlisted)
      toast.success(result.is_wishlisted ? "Added to wishlist" : "Removed from wishlist")
    } catch {
      setWishlisted(prev) // revert
      toast.error("Failed to update wishlist")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("shrink-0", className)}
      onClick={handleToggle}
      disabled={loading}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
        )}
      />
    </Button>
  )
}
