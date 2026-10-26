import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8 text-center shadow-lg md:p-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Ready to Explore Ethiopia?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Whether you&apos;re planning a business trip, family vacation, or solo adventure — Algalle helps you discover
            trusted hotels, restaurants, and experiences that match your needs.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/hotels">
                Start Exploring
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 bg-transparent px-8 text-base">
              <Link href="/planner">
                <Sparkles className="mr-2 h-4 w-4" />
                Plan with AI
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
