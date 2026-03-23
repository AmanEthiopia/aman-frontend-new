"use client"

import { useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  submitReview,
  getSubRatingsForType,
  getSubRatingLabel,
  type ReviewableType,
} from "@/lib/api/reviews"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface WriteReviewDialogProps {
  type: ReviewableType
  entityId: string
  entityName: string
  bookingId?: string
  reservationId?: string
  onSuccess?: () => void
  children?: React.ReactNode
}

function RatingInput({
  value,
  onChange,
  label,
  required = false,
}: {
  value: number
  onChange: (value: number) => void
  label?: string
  required?: boolean
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="space-y-1">
      {label && (
        <Label className="text-sm">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const rating = i + 1
          const isFilled = rating <= (hovered || value)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(rating)}
              onMouseEnter={() => setHovered(rating)}
              onMouseLeave={() => setHovered(0)}
              className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30 hover:text-yellow-400/50"
                )}
              />
            </button>
          )
        })}
        {value > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {value === 5 ? "Excellent" : value === 4 ? "Very Good" : value === 3 ? "Good" : value === 2 ? "Fair" : "Poor"}
          </span>
        )}
      </div>
    </div>
  )
}

export function WriteReviewDialog({
  type,
  entityId,
  entityName,
  bookingId,
  reservationId,
  onSuccess,
  children,
}: WriteReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [subRatings, setSubRatings] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const subRatingKeys = getSubRatingsForType(type)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select an overall rating",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Review required",
        description: "Please write your review",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const payload: any = {
        reviewable_type: type,
        reviewable_id: entityId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      }

      // Add booking/reservation ID
      if (bookingId) payload.booking_id = bookingId
      if (reservationId) payload.reservation_id = reservationId

      // Add sub-ratings
      Object.entries(subRatings).forEach(([key, value]) => {
        if (value > 0) payload[key] = value
      })

      await submitReview(payload)

      toast({
        title: "Review submitted",
        description: "Thank you for sharing your experience!",
      })

      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Failed to submit review",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setRating(0)
    setTitle("")
    setComment("")
    setSubRatings({})
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Star className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience at {entityName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <RatingInput
            value={rating}
            onChange={setRating}
            label="Overall Rating"
            required
          />

          {/* Sub-ratings */}
          {subRatingKeys.length > 0 && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Rate specific aspects (optional)</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                {subRatingKeys.map((key) => (
                  <RatingInput
                    key={key}
                    value={subRatings[key] || 0}
                    onChange={(value) =>
                      setSubRatings((prev) => ({ ...prev, [key]: value }))
                    }
                    label={getSubRatingLabel(key)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Your Review <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? What should other travelers know?"
              className="min-h-[120px]"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/2000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || rating === 0 || !comment.trim()}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
