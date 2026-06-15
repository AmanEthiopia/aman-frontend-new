"use client"

import { useCallback, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getMyProperties, type PropertyCategory } from "@/lib/api/provider"
import { getProviderGuides } from "@/lib/api/guides"

const LABELS: Record<string, string> = {
  hotel: "hotel",
  restaurant: "restaurant",
  driver: "driver service",
  trip: "trip",
  tour_guide: "guide service",
  event: "event",
  translator: "translator service",
}

type Listing = { name: string; cityId?: string; cityName?: string }

/**
 * Warns a provider before creating a listing that looks like a duplicate
 * (same type + same name + same place they already have). Never blocks — they
 * confirm "Create anyway". Returns false only if they choose to go back.
 *
 * Usage:
 *   const { checkDuplicate, DuplicateDialog } = useDuplicateGuard()
 *   if (!(await checkDuplicate("hotel", data.name, { cityId: data.city_id }))) return
 *   ...render {DuplicateDialog} once in the component.
 */
export function useDuplicateGuard() {
  const [info, setInfo] = useState<{ name: string; place: string; label: string } | null>(null)
  const resolverRef = useRef<((proceed: boolean) => void) | null>(null)

  const checkDuplicate = useCallback(
    async (
      category: PropertyCategory,
      name: string,
      opts?: { cityId?: string; cityName?: string },
    ): Promise<boolean> => {
      const target = (name || "").trim().toLowerCase()
      if (!target) return true

      let listings: Listing[] = []
      try {
        if (category === "tour_guide") {
          const guides = await getProviderGuides()
          listings = (guides as any[]).map((g) => ({
            name: g.title,
            cityName: g.cities?.[0]?.city?.name,
          }))
        } else {
          const res = await getMyProperties({ category })
          const items = Array.isArray(res) ? res : (res as any)?.results ?? []
          listings = items.map((p: any) => ({ name: p.name, cityId: p.city_id, cityName: p.city_name }))
        }
      } catch {
        return true // never block creation if the check itself fails
      }

      const dup = listings.find((l) => {
        if ((l.name || "").trim().toLowerCase() !== target) return false
        if (opts?.cityId && l.cityId) return l.cityId === opts.cityId
        if (opts?.cityName && l.cityName) return l.cityName.trim().toLowerCase() === opts.cityName.trim().toLowerCase()
        return true // same name, city unknown → still warn
      })
      if (!dup) return true

      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve
        setInfo({
          name,
          place: dup.cityName || opts?.cityName || "",
          label: LABELS[category] ?? "listing",
        })
      })
    },
    [],
  )

  const settle = (proceed: boolean) => {
    resolverRef.current?.(proceed)
    resolverRef.current = null
    setInfo(null)
  }

  const DuplicateDialog = (
    <Dialog open={!!info} onOpenChange={(open) => { if (!open) settle(false) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Possible duplicate
          </DialogTitle>
          <DialogDescription>
            You already have a {info?.label} named “{info?.name}”
            {info?.place ? ` in ${info.place}` : ""}. Do you want to create another one anyway?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => settle(false)}>Go back</Button>
          <Button onClick={() => settle(true)}>Create anyway</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { checkDuplicate, DuplicateDialog }
}
