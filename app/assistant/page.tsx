import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ChatInterface } from "@/components/assistant/chat-interface"
import { Sparkles, MessageSquare, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description: "Get personalized hotel suggestions based on your specific needs and preferences.",
  },
  {
    icon: MessageSquare,
    title: "Natural Conversation",
    description: "Ask questions in plain language - just like chatting with a local travel expert.",
  },
  {
    icon: Zap,
    title: "Instant Answers",
    description: "Get immediate responses about hotels, prices, amenities, and safety information.",
  },
  {
    icon: Shield,
    title: "Verified Results",
    description: "All recommendations are from our database of verified, trusted hotels.",
  },
]

export default function AssistantPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI-Powered
              </div>
              <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Hotel Assistant</h1>
              <p className="text-muted-foreground">
                Tell us what you&apos;re looking for and our AI will find the perfect hotel for your trip to Ethiopia.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <ChatInterface />
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-2xl font-bold">How Our AI Assistant Helps You</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
