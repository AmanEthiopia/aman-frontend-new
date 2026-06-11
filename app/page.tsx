import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { ProblemsSection } from "@/components/landing/problems-section"
import { SolutionSection } from "@/components/landing/solution-section"
import { CitiesSection } from "@/components/landing/cities-section"
import { FeaturedHotelsSection } from "@/components/landing/featured-hotels-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { AIPreviewSection } from "@/components/landing/ai-preview-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { ConciergeSection } from "@/components/landing/concierge-section"
import { CTASection } from "@/components/landing/cta-section"
import { FloatingAIAssistant } from "@/components/ai/floating-assistant"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ProblemsSection />
        <SolutionSection />
        <CitiesSection />
        <FeaturedHotelsSection />
        <HowItWorksSection />
        <AIPreviewSection />
        <TestimonialsSection />
        <ConciergeSection />
        <CTASection />
      </main>
      <Footer />
      <FloatingAIAssistant />
    </div>
  )
}
