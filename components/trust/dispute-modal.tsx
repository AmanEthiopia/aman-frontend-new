"use client"

import { useState } from "react"
import { AlertTriangle, Upload, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

const disputeReasons = [
  { value: "not-as-described", label: "Property not as described", description: "Photos or amenities don't match" },
  { value: "cleanliness", label: "Cleanliness issues", description: "Property wasn't clean upon arrival" },
  { value: "safety", label: "Safety concerns", description: "Security or safety problems" },
  { value: "host-issue", label: "Host communication", description: "Unresponsive or unhelpful host" },
  { value: "cancellation", label: "Cancellation dispute", description: "Issues with booking cancellation" },
  { value: "other", label: "Other issue", description: "Something else went wrong" },
]

export function DisputeModal({
  open,
  onClose,
  bookingId,
}: {
  open: boolean
  onClose: () => void
  bookingId?: string
}) {
  const [step, setStep] = useState<"form" | "submitted">("form")
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubmitting(false)
    setStep("submitted")
  }

  const handleClose = () => {
    setStep("form")
    setReason("")
    setDescription("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === "form" ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <DialogTitle>Report an Issue</DialogTitle>
                  <DialogDescription>We're here to help resolve any problems with your booking</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {bookingId && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Booking Reference:</span>
                  <span className="ml-2 font-mono font-medium">{bookingId}</span>
                </div>
              )}

              <div className="space-y-3">
                <Label>What's the issue?</Label>
                <RadioGroup value={reason} onValueChange={setReason}>
                  {disputeReasons.map((item) => (
                    <div
                      key={item.value}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                        reason === item.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setReason(item.value)}
                    >
                      <RadioGroupItem value={item.value} id={item.value} className="mt-1" />
                      <div>
                        <label htmlFor={item.value} className="font-medium cursor-pointer">
                          {item.label}
                        </label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Tell us more</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the issue in detail. Include dates, times, and any relevant information..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Attach evidence (optional)</Label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Upload photos or documents</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      Select Files
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!reason || !description || submitting}>
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Report Submitted</h3>
              <p className="mb-4 text-muted-foreground">We've received your report and will investigate promptly.</p>
              <div className="rounded-lg bg-muted/50 p-4 text-left w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Case Number</span>
                  <Badge variant="outline">DISP-{Date.now().toString().slice(-6)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Expected Response</span>
                  <span className="text-sm font-medium">Within 24 hours</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                You'll receive updates via email and in your Alga Ale messages.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
