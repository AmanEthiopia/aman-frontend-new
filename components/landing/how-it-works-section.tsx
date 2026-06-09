import { Search, Sparkles, CalendarCheck, ThumbsUp } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Discover",
    description: "Browse verified hotels, restaurants, transport, and experiences across Ethiopia.",
    href: "/hotels",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Plan with AI",
    description: "Use our AI assistant to get personalized recommendations and build your perfect trip.",
    href: "/planner",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Request Booking",
    description: "Submit booking requests with your dates and preferences directly to providers.",
    href: "/experiences",
  },
  {
    icon: ThumbsUp,
    step: "04",
    title: "Travel with Trust",
    description: "Enjoy your trip with 24/7 support and verified, reliable services.",
    href: "/about",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Simple Process
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Finding and booking your ideal stay in Ethiopia is easy with Alga Ale
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-10 hidden h-0.5 w-full translate-x-1/2 bg-border lg:block" />
              )}

              <Link href={item.href} className="group flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {item.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
