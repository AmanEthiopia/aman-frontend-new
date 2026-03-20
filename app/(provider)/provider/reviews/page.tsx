"use client"

import { useState } from "react"
import { Star, MessageSquare, ThumbsUp, Flag, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Review {
  id: string
  guestName: string
  guestAvatar?: string
  rating: number
  comment: string
  date: string
  stayDate: string
  roomType: string
  replied: boolean
  reply?: string
  helpful: number
}

const mockReviews: Review[] = [
  {
    id: "r1",
    guestName: "James Miller",
    guestAvatar: "/diverse-user-avatars.png",
    rating: 5,
    comment:
      "Exceptional service and beautiful rooms. The staff went above and beyond to make our anniversary special. The breakfast spread was incredible with both local and international options. Would definitely come back!",
    date: "2025-01-10",
    stayDate: "January 2025",
    roomType: "Deluxe Suite",
    replied: true,
    reply:
      "Thank you so much for your kind words, James! We're thrilled you enjoyed your anniversary stay with us. Looking forward to welcoming you back!",
    helpful: 12,
  },
  {
    id: "r2",
    guestName: "Lisa Park",
    rating: 4,
    comment:
      "Great location and very clean rooms. The view from our room was stunning. Breakfast could have more variety, but overall a very pleasant stay. Staff was friendly and helpful.",
    date: "2025-01-08",
    stayDate: "January 2025",
    roomType: "Standard Room",
    replied: false,
    helpful: 5,
  },
  {
    id: "r3",
    guestName: "Ahmed Hassan",
    rating: 5,
    comment:
      "Perfect for business travel. Fast WiFi, quiet rooms, and excellent restaurant. The concierge helped arrange all my meetings and transportation. Highly recommend for business travelers.",
    date: "2025-01-05",
    stayDate: "January 2025",
    roomType: "Executive Suite",
    replied: true,
    reply: "Thank you Ahmed! We're glad our business amenities met your needs. Safe travels and see you next time!",
    helpful: 8,
  },
  {
    id: "r4",
    guestName: "Sophie Williams",
    rating: 3,
    comment:
      "Room was nice but had some issues with the air conditioning. Staff tried to help but couldn't fully resolve it. Location is great though, close to everything.",
    date: "2025-01-02",
    stayDate: "December 2024",
    roomType: "Deluxe Suite",
    replied: false,
    helpful: 3,
  },
]

const ratingDistribution = [
  { rating: 5, count: 98, percentage: 63 },
  { rating: 4, count: 42, percentage: 27 },
  { rating: 3, count: 12, percentage: 8 },
  { rating: 2, count: 3, percentage: 2 },
  { rating: 1, count: 1, percentage: 1 },
]

function ReviewCard({
  review,
  onReply,
}: {
  review: Review
  onReply: () => void
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.guestAvatar || "/placeholder.svg"} />
            <AvatarFallback>{review.guestName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{review.guestName}</h4>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {review.roomType} • {review.stayDate}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>

            {/* Reply */}
            {review.replied && review.reply && (
              <div className="mt-4 rounded-lg bg-muted/50 p-4">
                <p className="mb-1 text-sm font-medium">Your Response</p>
                <p className="text-sm text-muted-foreground">{review.reply}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-4">
              {!review.replied && (
                <Button variant="outline" size="sm" onClick={onReply} className="bg-transparent">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Reply
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Helpful ({review.helpful})
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Flag className="mr-2 h-4 w-4" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const averageRating = 4.8
  const totalReviews = 156
  const needsResponse = reviews.filter((r) => !r.replied).length

  const handleSubmitReply = () => {
    if (!replyingTo || !replyText.trim()) return
    setReviews((prev) => prev.map((r) => (r.id === replyingTo ? { ...r, replied: true, reply: replyText } : r)))
    setReplyingTo(null)
    setReplyText("")
  }

  const reviewToReply = reviews.find((r) => r.id === replyingTo)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage guest feedback and responses</p>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
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

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">{averageRating}</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Based on {totalReviews} reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-3">
                  <span className="w-8 text-sm font-medium">{item.rating} ★</span>
                  <Progress value={item.percentage} className="h-2 flex-1" />
                  <span className="w-12 text-right text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onReply={() => setReplyingTo(review.id)} />
          ))}
        </TabsContent>

        <TabsContent value="needs-response" className="space-y-4">
          {reviews
            .filter((r) => !r.replied)
            .map((review) => (
              <ReviewCard key={review.id} review={review} onReply={() => setReplyingTo(review.id)} />
            ))}
        </TabsContent>

        <TabsContent value="responded" className="space-y-4">
          {reviews
            .filter((r) => r.replied)
            .map((review) => (
              <ReviewCard key={review.id} review={review} onReply={() => setReplyingTo(review.id)} />
            ))}
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={!!replyingTo} onOpenChange={() => setReplyingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>Respond to {reviewToReply?.guestName}'s review professionally</DialogDescription>
          </DialogHeader>
          {reviewToReply && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{reviewToReply.guestName}</span>
                  <div className="flex">
                    {Array.from({ length: reviewToReply.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{reviewToReply.comment}</p>
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
            <Button variant="outline" onClick={() => setReplyingTo(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReply} disabled={!replyText.trim()}>
              Post Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
