import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react"

const premiumTiers = [
  {
    name: "Essential",
    price: "$99",
    period: "/month",
    badge: null,
    description: "For independent travelers who want a smoother Ethiopia experience.",
    features: [
      "Airport transfer booking",
      "Restaurant reservations",
      "Hotel check-in assistance",
      "24/7 WhatsApp support",
      "Local SIM & connectivity setup",
    ],
    highlighted: false,
    cta: "Get Started",
    href: "/host#contact",
  },
  {
    name: "Business",
    price: "$199",
    period: "/month",
    badge: "Most Popular",
    description: "For business travelers, delegations, and frequent Ethiopia visitors.",
    features: [
      "Everything in Essential",
      "Dedicated concierge agent",
      "Meeting & event coordination",
      "Transport fleet access",
      "Visa & document assistance",
      "Priority bookings on all services",
    ],
    highlighted: true,
    cta: "Get Started",
    href: "/host#contact",
  },
  {
    name: "Executive",
    price: "$299",
    period: "/month",
    badge: "VIP",
    description: "White-glove service for executives, diplomats, and VIP delegations.",
    features: [
      "Everything in Business",
      "Personal relationship manager",
      "Security-vetted transport",
      "Diplomatic protocol support",
      "Emergency response coordination",
      "Custom private itinerary",
    ],
    highlighted: false,
    cta: "Get Started",
    href: "/host#contact",
  },
]

export function ConciergeSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Premium Concierge
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Travel Ethiopia Without the Hassle
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Our concierge team handles every detail — from airport arrival to your last meeting. Choose the level of support that fits your journey.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {premiumTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg ${
                tier.highlighted
                  ? "border-primary shadow-md ring-2 ring-primary"
                  : "border-border/60"
              }`}
            >
              {tier.badge && (
                <div className="absolute right-4 top-4">
                  <Badge
                    className={
                      tier.highlighted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {tier.badge}
                  </Badge>
                </div>
              )}

              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {tier.name}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <ul className="mb-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={tier.href}>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                    size="lg"
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          All plans include onboarding with a dedicated agent.{" "}
          <Link href="/host#contact" className="text-primary hover:underline">
            Talk to us about custom packages
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
