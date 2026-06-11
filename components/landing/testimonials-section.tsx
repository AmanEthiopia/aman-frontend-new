"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Star, Quote, MessageSquarePlus, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getFeaturedReviews } from "@/lib/api/reviews"
import { submitInquiry } from "@/lib/api/inquiries"
import { friendlyError } from "@/lib/utils/errors"

interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
}

export function TestimonialsSection() {
  const { toast } = useToast()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [form, setForm] = useState({ name: "", role: "", message: "" })

  // Load admin-featured real reviews for the rotating carousel.
  useEffect(() => {
    getFeaturedReviews(12).then((reviews) => {
      setTestimonials(
        reviews.map((r) => ({
          name: r.author?.name || "Verified traveler",
          role: r.is_verified_stay ? "Verified stay" : "Traveler",
          content: r.comment,
          rating: r.rating,
        }))
      )
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) {
      toast({ title: "Please select a star rating", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      await submitInquiry({
        inquiry_type: "general",
        name: form.name,
        email: "no-reply@algaale.com",
        organization: form.role,
        message: `Testimonial (${rating}★ about Alga Ale):\n\n${form.message}`,
      })
      setSubmitted(true)
      toast({ title: "Thank you for sharing your experience!" })
    } catch (err) {
      toast({ title: friendlyError(err, "Couldn't submit right now. Please try again."), variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setSubmitted(false)
    setForm({ name: "", role: "", message: "" })
    setRating(0)
    setHovered(0)
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Testimonials
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Trusted by Travelers Worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            Real experiences from travelers exploring Ethiopia with Alga Ale
          </p>
        </div>

        {/* ── Rotating carousel — only rendered when we have featured reviews ── */}
        {testimonials.length > 0 && (
          <div className="mt-12 overflow-hidden">
            {/* Double the items for a seamless infinite loop */}
            <div className="testimonials-track flex gap-6" style={{ width: "max-content" }}>
              {[...testimonials, ...testimonials].map((t, i) => (
                <Card key={i} className="w-80 flex-shrink-0 shadow-sm">
                  <CardContent className="p-6">
                    <Quote className="mb-3 h-7 w-7 text-primary/20" />
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{t.content}</p>
                    <div className="mb-3 flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={`h-4 w-4 ${j < t.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Submission form ── */}
        <div className="mx-auto mt-16 max-w-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MessageSquarePlus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Share your experience</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Help other travelers discover Ethiopia with confidence
            </p>
          </div>

          {submitted ? (
            <Card className="border-primary/20">
              <CardContent className="py-10 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h4 className="mb-2 text-lg font-semibold">Thank you!</h4>
                <p className="text-sm text-muted-foreground">
                  Your testimonial has been received and will be featured once reviewed.
                </p>
                <Button variant="ghost" className="mt-4" onClick={resetForm}>
                  Write another
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Star rating */}
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium">Your rating <span className="text-destructive">*</span></p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          onMouseEnter={() => setHovered(s)}
                          onMouseLeave={() => setHovered(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              s <= (hovered || rating)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Your name"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Location / Role</label>
                      <Input
                        placeholder="e.g. Solo Traveler, USA"
                        value={form.role}
                        onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Your experience <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="Tell us about your experience with Alga Ale..."
                      rows={4}
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit Testimonial"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
