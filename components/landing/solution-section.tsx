import { CheckCircle2, Shield, Sparkles, Users, Hotel, Utensils, Car, Compass } from "lucide-react"
import Link from "next/link"

const solutions = [
  {
    icon: Shield,
    title: "Verified Everything",
    description: "Every hotel, restaurant, and experience is personally verified by our team.",
  },
  {
    icon: CheckCircle2,
    title: "Transparent Pricing",
    description: "Clear price ranges with no hidden fees or surprise charges.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Planning",
    description: "Get personalized trip plans and recommendations based on your needs.",
  },
  {
    icon: Users,
    title: "Local Expertise",
    description: "Detailed area guides and safety notes from local experts.",
  },
]

const categories = [
  {
    icon: Hotel,
    title: "Hotels & Stays",
    count: "100+",
    href: "/hotels",
    description: "From budget to luxury",
  },
  {
    icon: Utensils,
    title: "Restaurants",
    count: "150+",
    href: "/restaurants",
    description: "Ethiopian & international",
  },
  {
    icon: Car,
    title: "Transport",
    count: "50+",
    href: "/transport",
    description: "Airport pickups & drivers",
  },
  {
    icon: Compass,
    title: "Experiences",
    count: "80+",
    href: "/experiences",
    description: "Tours & activities",
  },
]

export function SolutionSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Why AMAN
            </span>
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">Trust, Transparency, and Technology</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              We combine local expertise with modern technology to create the most reliable travel platform for
              Ethiopia. Every listing is verified, every price is clear, and our AI assistant is always ready to help.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              {solutions.map((solution) => (
                <div key={solution.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <solution.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{solution.title}</h3>
                    <p className="text-sm text-muted-foreground">{solution.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">{category.title}</h3>
                <p className="mb-2 text-2xl font-bold text-primary">{category.count}</p>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
