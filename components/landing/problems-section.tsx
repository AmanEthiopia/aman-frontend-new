import { ShieldAlert, Eye, MapPin, HelpCircle } from "lucide-react"

const problems = [
  {
    icon: ShieldAlert,
    title: "Unreliable Information",
    description:
      "Online listings often have outdated or misleading details about hotels, making it hard to know what you're booking.",
  },
  {
    icon: Eye,
    title: "Lack of Transparency",
    description: "Hidden fees, unclear pricing, and vague descriptions leave travelers uncertain about their stay.",
  },
  {
    icon: MapPin,
    title: "Safety Concerns",
    description:
      "Finding safe, trustworthy accommodations in unfamiliar areas can be stressful, especially for foreign visitors.",
  },
  {
    icon: HelpCircle,
    title: "Limited Local Insights",
    description:
      "Generic booking platforms lack the local knowledge needed to find the best stays in Ethiopian cities.",
  },
]

export function ProblemsSection() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">The Problem We&apos;re Solving</h2>
          <p className="text-lg text-muted-foreground">
            Finding reliable travel information in Ethiopia has been challenging — until now.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <problem.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="mb-2 font-semibold">{problem.title}</h3>
              <p className="text-sm text-muted-foreground">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
