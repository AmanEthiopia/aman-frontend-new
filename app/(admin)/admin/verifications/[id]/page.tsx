"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ShieldCheck,
  ShieldX,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  Loader2,
  Send,
  RefreshCw,
  MessageSquare,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  getVerificationDetail,
  approveVerification,
  requestChanges,
  rejectVerification,
  startReview,
  setVerificationRequirements,
  getStatusColor,
  getStatusLabel,
  getEntityTypeLabel,
  getRequirementLabel,
  COMMON_REQUIREMENTS,
} from "@/lib/api/verification"
import type { VerificationRequest, VerificationStatus } from "@/lib/api/verification"

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function StatusBadge({ status }: { status: VerificationStatus }) {
  const icons: Record<VerificationStatus, typeof ShieldCheck> = {
    approved: ShieldCheck,
    pending: Clock,
    in_review: RefreshCw,
    change_requested: AlertTriangle,
    rejected: ShieldX,
  }
  const Icon = icons[status]
  return (
    <Badge className={`${getStatusColor(status)} border-0 gap-1.5 text-sm px-3 py-1`}>
      <Icon className="h-4 w-4" />
      {getStatusLabel(status)}
    </Badge>
  )
}

// ─────────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────────

function Timeline({ request }: { request: VerificationRequest }) {
  const events: { date: string | null; label: string; done: boolean; color?: string }[] = [
    { date: request.created_at, label: "Request submitted by provider", done: true },
    {
      date: request.status !== "pending" ? request.reviewed_at : null,
      label: "Picked up for review",
      done: request.status !== "pending",
    },
    {
      date: request.reviewed_at,
      label:
        request.status === "approved"
          ? "Approved — property verified"
          : request.status === "change_requested"
          ? "Changes requested from provider"
          : request.status === "rejected"
          ? "Verification rejected"
          : "Awaiting decision",
      done: ["approved", "change_requested", "rejected"].includes(request.status),
      color:
        request.status === "approved"
          ? "text-green-600"
          : request.status === "rejected"
          ? "text-red-600"
          : request.status === "change_requested"
          ? "text-orange-600"
          : undefined,
    },
  ]

  return (
    <div className="space-y-3">
      {events.map((event, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 mt-0.5
            ${event.done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30 bg-background"
            }`}
          >
            {event.done ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            )}
          </div>
          <div className="flex-1 pb-3 border-b last:border-0">
            <p className={`text-sm font-medium ${event.color ?? ""}`}>{event.label}</p>
            {event.date && (
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(event.date)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function VerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [request, setRequest] = useState<VerificationRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Requirements state
  const [requirements, setRequirements] = useState<string[]>([])
  const [requirementsDirty, setRequirementsDirty] = useState(false)

  // Approve modal
  const [showApprove, setShowApprove] = useState(false)
  const [approveComment, setApproveComment] = useState("")
  const [approveNotes, setApproveNotes] = useState("")

  // Request changes modal
  const [showRequestChanges, setShowRequestChanges] = useState(false)
  const [changeMessage, setChangeMessage] = useState("")
  const [changeRequirements, setChangeRequirements] = useState<string[]>([])

  // Reject dialog
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    loadRequest()
  }, [id])

  async function loadRequest() {
    setIsLoading(true)
    try {
      const data = await getVerificationDetail(id)
      setRequest(data)
      setRequirements(data.requirements ?? [])
      setChangeRequirements(data.requirements ?? [])
    } catch {
      toast.error("Failed to load verification request")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStartReview() {
    if (!request) return
    setIsSaving(true)
    try {
      const updated = await startReview(id)
      setRequest(updated)
      toast.success("Moved to In Review")
    } catch {
      toast.error("Failed to update status")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveRequirements() {
    setIsSaving(true)
    try {
      const updated = await setVerificationRequirements(id, requirements)
      setRequest(updated)
      setRequirementsDirty(false)
      toast.success("Requirements saved")
    } catch {
      toast.error("Failed to save requirements")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleApprove() {
    if (!approveComment.trim()) {
      toast.error("Please add a verification comment")
      return
    }
    setIsSaving(true)
    try {
      const updated = await approveVerification(id, {
        verification_comment: approveComment.trim(),
        admin_notes: approveNotes.trim() || undefined,
      })
      setRequest(updated)
      setShowApprove(false)
      toast.success("Property verified and approved!")
    } catch {
      toast.error("Failed to approve verification")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRequestChanges() {
    if (!changeMessage.trim()) {
      toast.error("Please describe what changes are needed")
      return
    }
    setIsSaving(true)
    try {
      const updated = await requestChanges(id, {
        admin_notes: changeMessage.trim(),
        requirements: changeRequirements,
      })
      setRequest(updated)
      setShowRequestChanges(false)
      toast.success("Change request sent to provider")
    } catch {
      toast.error("Failed to send change request")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    setIsSaving(true)
    try {
      const updated = await rejectVerification(id, rejectReason.trim())
      setRequest(updated)
      setShowReject(false)
      toast.success("Verification rejected")
    } catch {
      toast.error("Failed to reject verification")
    } finally {
      setIsSaving(false)
    }
  }

  function toggleRequirement(req: string, list: string[], setter: (r: string[]) => void) {
    setter(list.includes(req) ? list.filter((r) => r !== req) : [...list, req])
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Request not found</h2>
        <Link href="/admin/verifications">
          <Button className="mt-4">Back to Verifications</Button>
        </Link>
      </div>
    )
  }

  const isActionable = !["approved", "rejected"].includes(request.status)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/verifications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Verification Review</h1>
            <p className="text-sm text-muted-foreground">
              {request.entity_name ?? `${getEntityTypeLabel(request.entity_type)} · ${request.entity_id.slice(0, 12)}...`}
            </p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details + actions */}
        <div className="space-y-5 lg:col-span-2">

          {/* Property summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Type</p>
                  <p className="mt-0.5 font-medium capitalize">{getEntityTypeLabel(request.entity_type)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Entity ID</p>
                  <p className="mt-0.5 font-mono text-xs">{request.entity_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Submitted by</p>
                  <p className="mt-0.5">{request.submitted_by_email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Submitted on</p>
                  <p className="mt-0.5">{formatDate(request.created_at)}</p>
                </div>
                {request.reviewed_by_email && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Reviewed by</p>
                    <p className="mt-0.5">{request.reviewed_by_email}</p>
                  </div>
                )}
              </div>

              {request.submitter_notes && (
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Provider Notes
                  </p>
                  <p className="text-sm italic">&ldquo;{request.submitter_notes}&rdquo;</p>
                </div>
              )}

              {/* Link to property */}
              <Link
                href={`/admin/listings`}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View full property listing
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Requirements checklist */}
          {isActionable && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Document Requirements
                </CardTitle>
                <CardDescription>
                  Mark which documents / items are needed from the provider. Save to update, or use these in a change request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {COMMON_REQUIREMENTS.map((req) => (
                    <div key={req} className="flex items-center space-x-2">
                      <Checkbox
                        id={`req-${req}`}
                        checked={requirements.includes(req)}
                        onCheckedChange={() => {
                          toggleRequirement(req, requirements, (r) => {
                            setRequirements(r)
                            setRequirementsDirty(true)
                          })
                        }}
                      />
                      <Label htmlFor={`req-${req}`} className="cursor-pointer text-sm">
                        {getRequirementLabel(req)}
                      </Label>
                    </div>
                  ))}
                </div>
                {requirementsDirty && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveRequirements}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                    Save Requirements
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Previous admin notes / decision */}
          {(request.admin_notes || request.verification_comment) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" />
                  Previous Decision Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {request.verification_comment && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Verification Comment</p>
                    <p className="rounded-lg border bg-muted/40 p-3">{request.verification_comment}</p>
                  </div>
                )}
                {request.admin_notes && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Admin Notes</p>
                    <p className="rounded-lg border bg-muted/40 p-3">{request.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          {isActionable && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Take Action</CardTitle>
                <CardDescription>
                  Review the property details above before making a decision. All actions notify the provider.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {request.status === "pending" && (
                    <Button
                      variant="outline"
                      onClick={handleStartReview}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Start Review
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-orange-400 text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950"
                    onClick={() => {
                      setChangeRequirements(requirements)
                      setChangeMessage("")
                      setShowRequestChanges(true)
                    }}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Request Changes
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setApproveComment("")
                      setApproveNotes("")
                      setShowApprove(true)
                    }}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Approve & Verify
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setRejectReason("")
                      setShowReject(true)
                    }}
                  >
                    <ShieldX className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final state banner */}
          {request.status === "approved" && (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-950/20">
              <ShieldCheck className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">Property Verified</p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  This property is now verified and displays the trust badge to travelers.
                </p>
              </div>
            </div>
          )}
          {request.status === "rejected" && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
              <ShieldX className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Verification Rejected</p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  This verification has been rejected. The provider has been notified.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: timeline */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline request={request} />
            </CardContent>
          </Card>

          {/* Submitted documents */}
          {(request.documents?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Submitted Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {request.documents?.map((doc, i) => (
                  <a
                    key={i}
                    href={doc}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border p-2 text-sm hover:bg-muted transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{doc.split("/").pop() ?? `Document ${i + 1}`}</span>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Approve Modal ── */}
      <Dialog open={showApprove} onOpenChange={setShowApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <ShieldCheck className="h-5 w-5" />
              Approve Verification
            </DialogTitle>
            <DialogDescription>
              Approving will mark this property as verified and notify the provider.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="approve-comment">Verification Comment *</Label>
              <Textarea
                id="approve-comment"
                placeholder="e.g., Property meets all requirements. Photos are clear and business details verified."
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">This comment is recorded internally</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approve-notes">Message to Provider (optional)</Label>
              <Textarea
                id="approve-notes"
                placeholder="e.g., Congratulations! Your property is now verified and visible to all travelers."
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprove(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={isSaving || !approveComment.trim()}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Request Changes Modal ── */}
      <Dialog open={showRequestChanges} onOpenChange={setShowRequestChanges}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Request Changes from Provider
            </DialogTitle>
            <DialogDescription>
              The provider will be notified with your message and a list of what needs to be updated. They can fix and resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="change-message">Message to Provider *</Label>
              <Textarea
                id="change-message"
                placeholder="e.g., Your photos are too dark and we couldn't clearly see the rooms. Please upload at least 5 high-quality photos (minimum 1080px) showing the exterior, lobby, and room interiors."
                value={changeMessage}
                onChange={(e) => setChangeMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Be specific — the provider will see this message exactly.</p>
            </div>
            <div className="space-y-2">
              <Label>Required Documents (optional — check what they need to provide)</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {COMMON_REQUIREMENTS.map((req) => (
                  <div key={req} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cr-${req}`}
                      checked={changeRequirements.includes(req)}
                      onCheckedChange={() =>
                        toggleRequirement(req, changeRequirements, setChangeRequirements)
                      }
                    />
                    <Label htmlFor={`cr-${req}`} className="cursor-pointer text-sm">
                      {getRequirementLabel(req)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestChanges(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              className="border-orange-400 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleRequestChanges}
              disabled={isSaving || !changeMessage.trim()}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Change Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Confirmation ── */}
      <AlertDialog open={showReject} onOpenChange={setShowReject}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldX className="h-5 w-5" />
              Reject Verification
            </AlertDialogTitle>
            <AlertDialogDescription>
              This is a final decision. The provider will be notified and cannot resubmit unless they contact support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="reject-reason">Reason for rejection *</Label>
            <Textarea
              id="reject-reason"
              className="mt-2"
              placeholder="e.g., Property does not meet minimum standards. Multiple complaints about misleading photos."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">The provider will see this reason.</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isSaving || !rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject Verification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
