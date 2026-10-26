"use client"

import { useState, useEffect } from "react"
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Filter,
  Loader2,
  AlertCircle,
  Shield,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getMediaUrl } from "@/lib/utils/media"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getProviderReviews,
  replyToReview,
  updateReviewReply,
  deleteReviewReply,
  calculateAverageRating,
  getRatingDistribution,
  type Review,
  type ReviewableType,
} from "@/lib/api/reviews"
import { getMyProperties } from "@/lib/api/provider"
import { cn, formatRating, toNumber } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Property {
  id: string
  name: string
  type: ReviewableType
}

function StarRating({ rating }: { rating: number | string }) {
  const numRating = toNumber(rating)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < numRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

function ReviewCard({
  review,
  onReply,
  onEditReply,
  onDeleteReply,
}: {
  review: Review
  onReply: () => void
  onEditReply: () => void
  onDeleteReply: () => void
}) {
  const isAdminReview = review.is_admin_verification

  return (
    <Card className={cn(isAdminReview && "border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/20")}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={getMediaUrl(review.author.avatar_url)} />
            <AvatarFallback>
              {isAdminReview ? (
                <Shield className="h-5 w-5 text-green-600" />
              ) : (
                review.author.name.slice(0, 2).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{review.author.name}</h4>
                  <StarRating rating={review.rating} />
                  {isAdminReview && (
                    <Badge variant="outline" className="border-green-600 text-green-700">
                      <Shield className="mr-1 h-3 w-3" />
                      Algalle Verified
                    </Badge>
                  )}
                </div>
                {review.title && (
                  <p className="text-sm text-muted-foreground">{review.title}</p>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>

            {/* Response */}
            {review.response && (
              <div className="mt-4 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Your Response</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onEditReply}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={onDeleteReply}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.response.response_text}</p>
              </div>
            )}

            {/* Actions */}
            {!isAdminReview && (
              <div className="mt-4 flex items-center gap-4">
                {!review.response && (
                  <Button variant="outline" size="sm" onClick={onReply}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  <ThumbsUp className="mr-1 inline h-4 w-4" />
                  {review.helpful_count} found helpful
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProviderReviewsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>("all")
  const [reviews, setReviews] = useState<Review[]>([])
  const [pinnedReviews, setPinnedReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  // Load provider properties
  useEffect(() => {
    async function loadProperties() {
      try {
        const response = await getMyProperties({ page_size: 100 })
        const data = response?.results || response || []
        const propertyList: Property[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.category as ReviewableType,
        }))
        setProperties(propertyList)

        // If there's at least one property, select it
        if (propertyList.length > 0) {
          setSelectedProperty(propertyList[0].id)
        }
      } catch (error) {
        console.error("Failed to load properties:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProperties()
  }, [])

  // Load reviews when property changes
  useEffect(() => {
    if (selectedProperty === "all" || !selectedProperty) return

    async function loadReviews() {
      const property = properties.find((p) => p.id === selectedProperty)
      if (!property) return

      try {
        setReviewsLoading(true)
        const response = await getProviderReviews({
          type: property.type,
          id: property.id,
        })
        setPinnedReviews([])  // provider endpoint has no pinned
        setReviews(response.results)
      } catch (error) {
        console.error("Failed to load reviews:", error)
      } finally {
        setReviewsLoading(false)
      }
    }
    loadReviews()
  }, [selectedProperty, properties])

  const allReviews = [...pinnedReviews, ...reviews]
  const averageRating = calculateAverageRating(allReviews)
  const distribution = getRatingDistribution(allReviews)
  const needsResponse = reviews.filter((r) => !r.response && !r.is_admin_verification).length

  const handleReply = (review: Review) => {
    setSelectedReview(review)
    setReplyText("")
    setReplyDialogOpen(true)
  }

  const handleEditReply = (review: Review) => {
    setSelectedReview(review)
    setReplyText(review.response?.response_text || "")
    setEditDialogOpen(true)
  }

  const handleDeleteReply = (review: Review) => {
    setSelectedReview(review)
    setDeleteDialogOpen(true)
  }

  const submitReply = async () => {
    if (!selectedReview || !replyText.trim()) return

    try {
      setSubmitting(true)
      const response = await replyToReview(selectedReview.id, replyText.trim())

      setReviews((prev) =>
        prev.map((r) =>
          r.id === selectedReview.id ? { ...r, response } : r
        )
      )

      toast({ title: "Response posted successfully" })
      setReplyDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Failed to post response",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const submitEditReply = async () => {
    if (!selectedReview || !replyText.trim()) return

    try {
      setSubmitting(true)
      const response = await updateReviewReply(selectedReview.id, replyText.trim())

      setReviews((prev) =>
        prev.map((r) =>
          r.id === selectedReview.id ? { ...r, response } : r
        )
      )

      toast({ title: "Response updated successfully" })
      setEditDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Failed to update response",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const submitDeleteReply = async () => {
    if (!selectedReview) return

    try {
      setSubmitting(true)
      await deleteReviewReply(selectedReview.id)

      setReviews((prev) =>
        prev.map((r) =>
          r.id === selectedReview.id ? { ...r, response: null } : r
        )
      )

      toast({ title: "Response deleted" })
      setDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Failed to delete response",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No Properties</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a property to start receiving reviews
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage guest feedback and responses</p>
        </div>
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Needs Response Alert */}
      {needsResponse > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {needsResponse} review{needsResponse > 1 ? "s" : ""} awaiting response
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Responding to reviews improves your visibility and guest trust
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reviewsLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          {allReviews.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-2xl font-bold text-primary">
                        {formatRating(averageRating)}
                      </span>
                    </div>
                    <div>
                      <StarRating rating={Math.round(toNumber(averageRating))} />
                      <p className="mt-1 text-sm text-muted-foreground">
                        Based on {allReviews.length} reviews
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {distribution.map((item) => (
                      <div key={item.rating} className="flex items-center gap-3">
                        <span className="w-12 text-sm font-medium">{item.rating} star</span>
                        <Progress value={item.percentage} className="h-2 flex-1" />
                        <span className="w-8 text-right text-sm text-muted-foreground">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reviews List */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              <TabsTrigger value="needs-response" className="gap-2">
                Needs Response
                {needsResponse > 0 && <Badge variant="destructive">{needsResponse}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="responded">Responded</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {pinnedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onReply={() => handleReply(review)}
                  onEditReply={() => handleEditReply(review)}
                  onDeleteReply={() => handleDeleteReply(review)}
                />
              ))}
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onReply={() => handleReply(review)}
                  onEditReply={() => handleEditReply(review)}
                  onDeleteReply={() => handleDeleteReply(review)}
                />
              ))}
              {allReviews.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Star className="mb-4 h-12 w-12 text-muted-foreground/30" />
                    <h3 className="text-lg font-semibold">No reviews yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Reviews will appear here once guests start leaving feedback
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="needs-response" className="space-y-4">
              {reviews
                .filter((r) => !r.response && !r.is_admin_verification)
                .map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onReply={() => handleReply(review)}
                    onEditReply={() => handleEditReply(review)}
                    onDeleteReply={() => handleDeleteReply(review)}
                  />
                ))}
            </TabsContent>

            <TabsContent value="responded" className="space-y-4">
              {reviews
                .filter((r) => r.response)
                .map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onReply={() => handleReply(review)}
                    onEditReply={() => handleEditReply(review)}
                    onDeleteReply={() => handleDeleteReply(review)}
                  />
                ))}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Respond to {selectedReview?.author.name}'s review professionally
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedReview.author.name}</span>
                  <StarRating rating={selectedReview.rating} />
                </div>
                <p className="text-sm text-muted-foreground">{selectedReview.comment}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Response</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the guest for their feedback and address any concerns..."
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Your response will be visible to all users viewing this property
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submitReply} disabled={!replyText.trim() || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Response"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reply Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Response</DialogTitle>
            <DialogDescription>Update your response to this review</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submitEditReply} disabled={!replyText.trim() || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Reply Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Response</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your response? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitDeleteReply} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Response"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
