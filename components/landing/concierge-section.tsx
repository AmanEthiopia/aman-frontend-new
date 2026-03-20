import { Button } from "@/components/ui/button"
import { Sparkles, Car, Utensils, Map, Clock, Building2 } from "lucide-react"
import { FEATURES } from "@/lib/config/features"
import Link from "next/link"

const services = [
  { icon: Car, label: "Airport Transfers" },
  { icon: Utensils, label: "Restaurant Reservations" },
  { icon: Map, label: "Tour Arrangements" },
  { icon: Clock, label: "24/7 Support" },
  { icon: Building2, label: "Business Services" },
]

export function ConciergeSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] bg-cover bg-center" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>{FEATURES.AI_CONCIERGE ? "Premium Service" : "Coming Soon"}</span>
            </div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">Premium Concierge Services</h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Beyond booking — let our concierge team handle everything from airport transfers to restaurant
              reservations, tour arrangements, and more. Experience Ethiopia with personalized support every step of the
              way.
            </p>

            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {services.map((service) => (
                <div key={service.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{service.label}</span>
                </div>
              ))}
            </div>

            {FEATURES.AI_CONCIERGE ? (
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/concierge">Learn More</Link>
              </Button>
            ) : (
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" disabled>
                Join Waitlist
              </Button>
            )}
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <img
                src="/luxury-concierge-service-ethiopia-professional.jpg"
                alt="Premium concierge service"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
