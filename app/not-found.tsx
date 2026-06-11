import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { MapPin, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 rounded-full bg-muted p-8">
          <MapPin className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-4xl font-bold">Page not found</h1>
        <p className="mb-2 text-6xl font-extrabold text-muted-foreground/30">404</p>
        <p className="mb-8 max-w-md text-muted-foreground">
          We couldn&apos;t find the page you were looking for. It may have moved, been removed, or the link might be
          incorrect.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/hotels">
              <Search className="mr-2 h-4 w-4" />
              Browse hotels
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
