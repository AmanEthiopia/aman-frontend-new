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

/**
 * Warns a provider before creating a listing whose NAME they already use for the
 * same type of listing (place is ignored — a matching name alone is enough).
 * Never blocks — they confirm "Create anyway". Returns false only if they go back.
 *
 * Usage:
 *   const { checkDuplicate, DuplicateDialog } = useDuplicateGuard()
 *   if (!(await checkDuplicate("hotel", data.name))) return
 *   ...render {DuplicateDialog} once in the component.
 *
 * The optional 2nd arg is ignored (kept for call-site compatibility).
 */
export function useDuplicateGuard() {
  const [info, setInfo] = useState<{ name: string; label: string } | null>(null)
  const resolverRef = useRef<((proceed: boolean) => void) | null>(null)

  const checkDuplicate = useCallback(
    async (category: PropertyCategory, name: string, _opts?: unknown): Promise<boolean> => {
      const target = (name || "").trim().toLowerCase()
      if (!target) return true

      let names: string[] = []
      try {
        // Tour guides AND translators are both stored as guides (/guides/provider/).
        if (category === "tour_guide" || category === "translator") {
          const guides = await getProviderGuides()
          names = (guides as any[]).map((g) => g.title || g.name || "")
        } else {
          const res = await getMyProperties({ category, page_size: 500 })
          const items = Array.isArray(res) ? res : (res as any)?.results ?? []
          names = items.map((p: any) => p.name || "")
        }
      } catch {
        return true // never block creation if the check itself fails
      }

      const isDup = names.some((n) => (n || "").trim().toLowerCase() === target)
      if (!isDup) return true

      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve
        setInfo({ name, label: LABELS[category] ?? "listing" })
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
            You already have a {info?.label} named “{info?.name}”. Do you want to create
            another one with the same name anyway?
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
