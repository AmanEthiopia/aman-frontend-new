"use client"

import { useState, useEffect } from "react"
import { Star, Loader2, AlertCircle, User, ThumbsUp, MessageSquare, Flag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  getReviews,
  submitReview,
  formatReviewDate,
  type Review,
  type ReviewableType,
} from "@/lib/api/reviews"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface ReviewsSectionProps {
  contentType: ReviewableType
  contentId: string
  averageRating?: number
  reviewCount?: number
  compact?: boolean
}

function StarRating({
  rating,
  onChange,
  interactive = false,
  size = "default",
}: {
  rating: number
  onChange?: (rating: number) => void
  interactive?: boolean
  size?: "small" | "default" | "large"
}) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    small: "h-3 w-3",
    default: "h-4 w-4",
    large: "h-5 w-5",
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={cn(
            "transition-colors",
            interactive && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hoverRating || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            )}
          />
        </button>
      ))}
    </div>
  )
}

function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => Math.round(parseFloat(r.rating)) === rating).length,
    percentage: reviews.length
      ? (reviews.filter((r) => Math.round(parseFloat(r.rating)) === rating).length /
          reviews.length) *
        100
      : 0,
  }))

  return (
    <div className="space-y-2">
      {distribution.map((item) => (
        <div key={item.rating} className="flex items-center gap-2">
          <span className="w-3 text-sm text-muted-foreground">{item.rating}</span>
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <Progress value={item.percentage} className="h-2 flex-1" />
          <span className="w-8 text-right text-xs text-muted-foreground">{item.count}</span>
        </div>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const displayName = review.user?.full_name || review.traveler?.name || "Anonymous"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="border-b border-border pb-6 last:border-0">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user?.avatar_url} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {formatReviewDate(review.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={parseFloat(review.rating)} size="small" />
          {review.is_verified_booking && (
            <Badge variant="secondary" className="text-xs">
              Verified
            </Badge>
          )}
        </div>
      </div>

      {review.title && <p className="mb-2 font-medium">{review.title}</p>}
      
      <p className="text-muted-foreground">{review.comment}</p>

      {/* Provider Response */}
      {review.provider_response && (
        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            Response from Owner
          </p>
          <p className="text-sm text-muted-foreground">{review.provider_response}</p>
          {review.provider_response_at && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatReviewDate(review.provider_response_at)}
            </p>
          )}
        </div>
      )}

      {/* Helpful button */}
      {review.helpful_count !== undefined && (
        <div className="mt-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
            <ThumbsUp className="mr-1 h-3 w-3" />
            Helpful ({review.helpful_count})
          </Button>
        </div>
      )}
    </div>
  )
}

function WriteReviewDialog({
  contentType,
  contentId,
  onSuccess,
}: {
  contentType: ReviewContentType
  contentId: string
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  const handleSubmit = async () => {
    if (!isAuthenticated) return
    if (rating === 0 || !comment.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      await submitReview({
        content_type: contentType,
        content_id: contentId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      })
      setOpen(false)
      setRating(0)
      setTitle("")
      setComment("")
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Button variant="outline" asChild>
        <a href="/login?redirect=/reviews">Sign in to write a review</a>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Write a Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>Share your experience with other travelers</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">Your Rating</label>
            <StarRating rating={rating} onChange={setRating} interactive size="large" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Your Review</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-muted-foreground">{comment.length}/2000</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || !comment.trim() || submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ReviewsSection({
  contentType,
  contentId,
  averageRating = 0,
  reviewCount = 0,
  compact = false,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true)
        const response = await getReviews(contentType, contentId, page)
        if (page === 1) {
          setReviews(response.data)
        } else {
          setReviews((prev) => [...prev, ...response.data])
        }
        setHasMore(response.pagination.page < response.pagination.total_pages)
      } catch (err: any) {
        setError(err.message || "Failed to load reviews")
      } finally {
        setLoading(false)
      }
    }
    loadReviews()
  }, [contentType, contentId, page, refreshKey])

  const handleReviewSubmitted = () => {
    setPage(1)
    setRefreshKey((k) => k + 1)
  }

  if (compact) {
    // Compact version for sidebars or cards
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} />
            <span className="font-medium">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviewCount} reviews)</span>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            {reviews.length > 3 && (
              <Button variant="link" className="w-full">
                View all {reviewCount} reviews
              </Button>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No reviews yet</p>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reviews</CardTitle>
        <WriteReviewDialog
          contentType={contentType}
          contentId={contentId}
          onSuccess={handleReviewSubmitted}
        />
      </CardHeader>
      <CardContent>
        {/* Rating Summary */}
        <div className="mb-8 grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-2 text-5xl font-bold">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} size="large" />
            <p className="mt-2 text-muted-foreground">{reviewCount} reviews</p>
          </div>
          <RatingBreakdown reviews={reviews} />
        </div>

        {/* Reviews List */}
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : loading && reviews.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Load More Reviews
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">No Reviews Yet</h3>
            <p className="text-muted-foreground">Be the first to share your experience!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
