import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Solo Traveler, USA",
    content:
      "AMAN made my Ethiopia trip stress-free. The verified hotels gave me confidence, and the AI recommendations were spot-on. I felt safe the entire time.",
    rating: 5,
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    name: "Marcus Schmidt",
    role: "Family Trip, Germany",
    content:
      "Traveling with kids requires extra planning. AMAN's detailed safety notes and honest reviews helped us choose perfect family-friendly hotels in Lalibela and Gondar.",
    rating: 5,
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    name: "Priya Patel",
    role: "Business Traveler, UK",
    content:
      "As a frequent visitor to Addis, AMAN has become my go-to. The airport transfer service they recommended was professional and reliable every time.",
    rating: 5,
    avatar: "/placeholder.svg?height=48&width=48",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Testimonials
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Trusted by Travelers Worldwide</h2>
          <p className="text-lg text-muted-foreground">
            See what travelers are saying about their experience with AMAN
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="relative">
              <CardContent className="p-6">
                <Quote className="mb-4 h-8 w-8 text-primary/20" />
                <p className="mb-4 text-muted-foreground">{testimonial.content}</p>
                <div className="mb-4 flex gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
