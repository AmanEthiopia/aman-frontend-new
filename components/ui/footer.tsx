import Link from "next/link"
import { Shield, Phone, AlertTriangle, Briefcase, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AmanWordmark } from "@/components/brand/aman-logo"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="border-b border-border bg-muted/50 py-2">
        <div className="container mx-auto flex items-center justify-center gap-2 px-4">
          <Info className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <Badge variant="outline" className="mr-1.5 text-[9px] px-1 py-0">
              MVP Demo
            </Badge>
            Frontend preview with simulated data. Backend services coming soon.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="inline-flex w-fit items-center gap-3 py-2" aria-label="AMAN home">
              <AmanWordmark height={40} />
              <span className="font-serif text-xl text-muted-foreground">አማን</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Your trusted platform for verified hotels, restaurants, transport, and experiences across Ethiopia.
            </p>
            {/* Safety Promise */}
            <div className="mt-2 rounded-lg border border-border bg-card p-3">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-medium">If something goes wrong</p>
                  <p className="text-xs text-muted-foreground">
                    If a booking fails, changes, or feels unsafe — AMAN steps in.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Discover */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">Discover</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/hotels" className="text-sm text-muted-foreground hover:text-foreground">
                Hotels & Stays
              </Link>
              <Link href="/restaurants" className="text-sm text-muted-foreground hover:text-foreground">
                Restaurants
              </Link>
              <Link href="/transport" className="text-sm text-muted-foreground hover:text-foreground">
                Transport
              </Link>
              <Link href="/experiences" className="text-sm text-muted-foreground hover:text-foreground">
                Experiences
              </Link>
              <Link href="/cities" className="text-sm text-muted-foreground hover:text-foreground">
                Cities Guide
              </Link>
              <Link href="/planner" className="text-sm text-muted-foreground hover:text-foreground">
                AI Travel Planner
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">Company</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About Us
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link href="/host" className="text-sm text-muted-foreground hover:text-foreground">
                Partner With Us
              </Link>
              <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">
                Help Center
              </Link>
              <Link href="/concierge" className="text-sm text-muted-foreground hover:text-foreground">
                Concierge Services
              </Link>
              <Link
                href="/business"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Briefcase className="h-3 w-3" />
                For Business & Diplomats
              </Link>
            </nav>
          </div>

          {/* Safety & Emergency */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">Safety & Support</h4>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <Phone className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium text-foreground">24/7 Support</p>
                  <a href="tel:+251911234567" className="hover:text-foreground">
                    +251 91 123 4567
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-medium text-foreground">Emergency</p>
                  <p>Police: 991 | Ambulance: 907</p>
                </div>
              </div>
              <a href="mailto:support@aman.et" className="text-muted-foreground hover:text-foreground">
                support@aman.et
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AMAN. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/safety" className="text-sm text-muted-foreground hover:text-foreground">
              Safety Guidelines
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
