"use client"

import { useState, useEffect } from "react"
import { getMediaUrl } from "@/lib/utils/media"
import Link from "next/link"
import {
  ShieldCheck,
  ShieldX,
  Clock,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Loader2,
  ChevronRight,
  Info,
  FileText,
  Camera,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { getMyProperties } from "@/lib/api/provider"
import type { PropertyBase, PropertyCategory } from "@/lib/api/provider"
import {
  getVerificationStatus,
  submitForVerification,
  getStatusColor,
  getStatusLabel,
  getRequirementLabel,
} from "@/lib/api/verification"
import type { VerificationStatusInfo, EntityType } from "@/lib/api/verification"

// Only hotel and restaurant are verifiable right now; extend as backend supports more
const CATEGORY_TO_ENTITY: Partial<Record<PropertyCategory, EntityType>> = {
  hotel: "hotel",
  restaurant: "restaurant",
  tour_guide: "guide",
}

interface PropertyWithVerification extends PropertyBase {
  entityType: EntityType | null
  verification: VerificationStatusInfo | null
  loadingVerification: boolean
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: string | null }) {
  if (!status) return <Building2 className="h-5 w-5 text-muted-foreground" />
  switch (status) {
    case "approved":
      return <ShieldCheck className="h-5 w-5 text-green-600" />
    case "pending":
    case "in_review":
      return <Clock className="h-5 w-5 text-blue-500" />
    case "change_requested":
      return <AlertTriangle className="h-5 w-5 text-orange-500" />
    case "rejected":
      return <ShieldX className="h-5 w-5 text-red-500" />
    default:
      return <Building2 className="h-5 w-5 text-muted-foreground" />
  }
}

// ─────────────────────────────────────────────────────────────
// Change Requested Banner (full-detail inline card)
// ─────────────────────────────────────────────────────────────

function ChangeRequestedBanner({
  verification,
  onResubmit,
  isResubmitting,
}: {
  verification: VerificationStatusInfo
  onResubmit: () => void
  isResubmitting: boolean
}) {
  const requirements = verification.requirements ?? []
  const message = verification.admin_notes

  return (
    <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-semibold text-orange-800 dark:text-orange-300">Action Required</h4>
            <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
              Our team has reviewed your submission and requires the following updates before we can proceed.
            </p>
          </div>

          {message && (
            <div className="rounded-md bg-orange-100 p-3 dark:bg-orange-900/30">
              <p className="text-sm text-orange-800 dark:text-orange-300">{message}</p>
            </div>
          )}

          {requirements.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">
                Documents / Items Required
              </p>
              <ul className="space-y-1">
                {requirements.map((req) => (
                  <li key={req} className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-300">
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                    {getRequirementLabel(req)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2 border-t border-orange-200 pt-3 dark:border-orange-900/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">
              What to do next
            </p>
            <ol className="space-y-1.5 text-sm text-orange-800 dark:text-orange-300">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-200 text-xs font-bold dark:bg-orange-900">1</span>
                Go to your property settings and make the requested updates
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-200 text-xs font-bold dark:bg-orange-900">2</span>
                Upload any missing documents or photos to your property profile
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-200 text-xs font-bold dark:bg-orange-900">3</span>
                Click "Resubmit for Verification" when you're ready
              </li>
            </ol>
          </div>

          <Button
            size="sm"
            onClick={onResubmit}
            disabled={isResubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isResubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resubmitting...</>
            ) : (
              <><RefreshCw className="mr-2 h-4 w-4" />Resubmit for Verification</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Property Verification Card
// ─────────────────────────────────────────────────────────────

function PropertyCard({
  property,
  onRequestVerification,
  onResubmit,
  resubmitting,
}: {
  property: PropertyWithVerification
  onRequestVerification: (p: PropertyWithVerification) => void
  onResubmit: (p: PropertyWithVerification) => void
  resubmitting: string | null
}) {
  const v = property.verification
  const status = v?.status ?? null
  const isVerifiable = !!property.entityType
  const notSubmitted = !v && !property.is_verified

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-4">
          {/* Cover photo */}
          <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            {property.cover_photo_url ? (
              <img
                src={getMediaUrl(property.cover_photo_url) || "/placeholder.svg"}
                alt={property.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Camera className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-semibold leading-tight">{property.name}</h3>
                <p className="text-sm capitalize text-muted-foreground">{property.category.replace("_", " ")}</p>
              </div>
              <div className="flex items-center gap-2">
                {property.loadingVerification ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : status ? (
                  <Badge className={`${getStatusColor(status)} border-0`}>
                    <StatusIcon status={status} />
                    <span className="ml-1.5">{getStatusLabel(status)}</span>
                  </Badge>
                ) : property.is_verified ? (
                  <Badge className="bg-green-100 text-green-800 border-0 dark:bg-green-950 dark:text-green-400">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Not Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Action area */}
            {!property.loadingVerification && (
              <div className="mt-3">
                {notSubmitted && isVerifiable && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRequestVerification(property)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Request Verification
                  </Button>
                )}
                {!isVerifiable && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" />
                    Verification not available for this property type yet
                  </p>
                )}
                {(status === "pending" || status === "in_review") && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Your request is being reviewed. We'll notify you once complete.
                  </p>
                )}
                {status === "approved" && (
                  <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Your property is verified and trusted by travelers.
                  </p>
                )}
                {status === "rejected" && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/20">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 flex items-center gap-1.5">
                      <ShieldX className="h-4 w-4" />
                      Verification was not approved
                    </p>
                    {v?.admin_notes && (
                      <p className="mt-1.5 text-sm text-red-700 dark:text-red-400">{v.admin_notes}</p>
                    )}
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                      Please contact support if you believe this is an error.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Change requested — full-width banner below */}
        {status === "change_requested" && v && (
          <div className="border-t px-4 pb-4">
            <ChangeRequestedBanner
              verification={v}
              onResubmit={() => onResubmit(property)}
              isResubmitting={resubmitting === property.id}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function VerificationPage() {
  const [properties, setProperties] = useState<PropertyWithVerification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithVerification | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitterNotes, setSubmitterNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resubmitting, setResubmitting] = useState<string | null>(null)

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    setIsLoading(true)
    try {
      const result = await getMyProperties({ page_size: 50 })
      const items: PropertyBase[] = Array.isArray(result) ? result : result.results ?? []

      // Set initial state with no verification data yet
      const initial: PropertyWithVerification[] = items.map((p) => ({
        ...p,
        entityType: CATEGORY_TO_ENTITY[p.category] ?? null,
        verification: null,
        loadingVerification: !!CATEGORY_TO_ENTITY[p.category],
      }))
      setProperties(initial)

      // Fetch verification status in parallel for verifiable properties
      await Promise.all(
        initial.map(async (prop, idx) => {
          if (!prop.entityType) return
          const vs = await getVerificationStatus(prop.entityType, prop.id)
          setProperties((prev) =>
            prev.map((p, i) =>
              i === idx ? { ...p, verification: vs, loadingVerification: false } : p
            )
          )
        })
      )
    } catch {
      toast.error("Failed to load properties")
    } finally {
      setIsLoading(false)
    }
  }

  function openSubmitModal(property: PropertyWithVerification) {
    setSelectedProperty(property)
    setSubmitterNotes("")
    setShowSubmitModal(true)
  }

  async function handleSubmit() {
    if (!selectedProperty?.entityType) return
    setIsSubmitting(true)
    try {
      await submitForVerification(selectedProperty.entityType, selectedProperty.id, {
        documents: [],
        submitter_notes: submitterNotes.trim() || undefined,
      })
      toast.success("Verification request submitted! We'll review it and get back to you.")
      setShowSubmitModal(false)
      loadProperties()
    } catch {
      toast.error("Failed to submit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResubmit(property: PropertyWithVerification) {
    if (!property.entityType) return
    setResubmitting(property.id)
    try {
      await submitForVerification(property.entityType, property.id, {
        documents: [],
        submitter_notes: "Resubmitting after requested changes have been made.",
      })
      toast.success("Resubmitted successfully! Our team will review your updates.")
      loadProperties()
    } catch {
      toast.error("Failed to resubmit. Please try again.")
    } finally {
      setResubmitting(null)
    }
  }

  const verifiedCount = properties.filter((p) => p.is_verified || p.verification?.status === "approved").length
  const pendingCount = properties.filter(
    (p) => p.verification?.status === "pending" || p.verification?.status === "in_review"
  ).length
  const actionCount = properties.filter((p) => p.verification?.status === "change_requested").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Verification Center</h1>
        <p className="text-muted-foreground">
          Get your properties verified to earn the trust badge and increase bookings
        </p>
      </div>

      {/* How it works */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">How verification works</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Send,
                step: "1",
                title: "Submit Request",
                desc: "Request verification for your property with optional notes for our team",
              },
              {
                icon: FileText,
                step: "2",
                title: "We Review",
                desc: "Our team reviews your property, photos, and business details (1–3 business days)",
              },
              {
                icon: ShieldCheck,
                step: "3",
                title: "Get Verified",
                desc: "Approved properties earn the verified badge, boosting trust and visibility",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                  {step}
                </div>
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {!isLoading && properties.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedCount}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Under Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{actionCount}</p>
                <p className="text-xs text-muted-foreground">Action Required</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold">No properties yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add a property first, then come back to request verification</p>
            <Link href="/provider/properties/new?type=hotel">
              <Button className="mt-4">Add Your First Property</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Action required first */}
          {properties.filter((p) => p.verification?.status === "change_requested").length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                Action Required
              </h2>
              {properties
                .filter((p) => p.verification?.status === "change_requested")
                .map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    onRequestVerification={openSubmitModal}
                    onResubmit={handleResubmit}
                    resubmitting={resubmitting}
                  />
                ))}
            </div>
          )}

          {/* All other properties */}
          <div className="space-y-3">
            {properties.filter((p) => p.verification?.status !== "change_requested").length > 0 && (
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                All Properties
              </h2>
            )}
            {properties
              .filter((p) => p.verification?.status !== "change_requested")
              .map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onRequestVerification={openSubmitModal}
                  onResubmit={handleResubmit}
                  resubmitting={resubmitting}
                />
              ))}
          </div>
        </div>
      )}

      {/* Submit modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Verification</DialogTitle>
            <DialogDescription>
              Submit <strong>{selectedProperty?.name}</strong> for review. Make sure your property profile, photos, and business details are complete before submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-1.5">
              <p className="font-medium">Before submitting, ensure you have:</p>
              <ul className="space-y-1 text-muted-foreground list-none">
                {[
                  "At least 3 clear photos of your property",
                  "Accurate address and contact information",
                  "Complete business details in Settings → Business",
                  "All room/service details filled in",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes for our team (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional context about your property, special certifications, or notes for the review team..."
                value={submitterNotes}
                onChange={(e) => setSubmitterNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" />Submit for Verification</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
