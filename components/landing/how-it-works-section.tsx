import { Search, Sparkles, CalendarCheck, ThumbsUp } from "lucide-react"

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Discover",
    description: "Browse verified hotels, restaurants, transport, and experiences across Ethiopia.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Plan with AI",
    description: "Use our AI assistant to get personalized recommendations and build your perfect trip.",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Request Booking",
    description: "Submit booking requests with your dates and preferences directly to providers.",
  },
  {
    icon: ThumbsUp,
    step: "04",
    title: "Travel with Trust",
    description: "Enjoy your trip with 24/7 support and verified, reliable services.",
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
            Finding and booking your ideal stay in Ethiopia is easy with AMAN
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-10 hidden h-0.5 w-full translate-x-1/2 bg-border lg:block" />
              )}

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {item.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
