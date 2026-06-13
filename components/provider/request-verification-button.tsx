"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { requestVerification, type PropertyCategory } from "@/lib/api/provider"
import { getVerificationStatus, type EntityType } from "@/lib/api/verification"

// Provider property category → unified verification entity_type
const CATEGORY_TO_ENTITY: Record<string, EntityType> = {
  hotel: "hotel",
  restaurant: "restaurant",
  trip: "package",
  driver: "driver",
  tour_guide: "guide",
  guide: "guide",
}

interface Props {
  category: PropertyCategory | "guide"
  propertyId: string
  isVerified: boolean
  isPublished: boolean
  className?: string
}

/**
 * "Request Verification" control for provider detail pages.
 * - verified → renders nothing (page already shows the Verified badge)
 * - request pending/in review → shows an "under review" chip
 * - published + unverified → shows the Request Verification button
 * - unpublished → renders nothing (publish first)
 */
export function RequestVerificationButton({ category, propertyId, isVerified, isPublished, className }: Props) {
  const [status, setStatus] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)
  const entityType = CATEGORY_TO_ENTITY[category] ?? (category as EntityType)

  useEffect(() => {
    if (isVerified || !propertyId) return
    getVerificationStatus(entityType, propertyId).then((info) => {
      if (info?.status) setStatus(info.status)
    })
  }, [entityType, propertyId, isVerified])

  if (isVerified || !isPublished) return null

  if (status === "pending" || status === "in_review") {
    return (
      <Badge variant="outline" className={`gap-1 border-blue-200 text-blue-600 dark:text-blue-400 ${className ?? ""}`}>
        <Clock className="h-3 w-3" />
        Verification {status === "in_review" ? "in review" : "requested"}
      </Badge>
    )
  }
  if (status === "approved") return null

  const handleRequest = async () => {
    setRequesting(true)
    try {
      const res = await requestVerification(category as PropertyCategory, propertyId)
      setStatus(res.status || "pending")
      toast.success("Verification requested — our team will review your listing.")
    } catch {
      toast.error("Couldn't request verification. Please try again.")
    } finally {
      setRequesting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRequest} disabled={requesting} className={className}>
      {requesting ? (
        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
      ) : (
        <ShieldCheck className="mr-2 h-3.5 w-3.5" />
      )}
      Request Verification
    </Button>
  )
}
