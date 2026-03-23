"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  X,
  Globe,
  User,
  LogIn,
  Hotel,
  Utensils,
  Car,
  Compass,
  Sparkles,
  LayoutDashboard,
  Building2,
  ChevronDown,
  LogOut,
  Map,
  MapPin,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/lib/contexts/app-context"
import { FEATURES } from "@/lib/config/features"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { switchRole, language, setLanguage, currency, setCurrency } = useApp()

  const discoverLinks = [
    { href: "/hotels", label: "Hotels & Stays", icon: Hotel },
    ...(FEATURES.RESTAURANTS ? [{ href: "/restaurants", label: "Restaurants", icon: Utensils }] : []),
    ...(FEATURES.TRANSPORT ? [{ href: "/transport", label: "Transport", icon: Car }] : []),
    ...(FEATURES.EXPERIENCES ? [{ href: "/experiences", label: "Experiences", icon: Compass }] : []),
    ...(FEATURES.GUIDES ? [{ href: "/guides", label: "Tour Guides", icon: Map }] : []),
    ...(FEATURES.ATTRACTIONS ? [{ href: "/attractions", label: "Attractions", icon: MapPin }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">A</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold leading-none text-foreground">AMAN</span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                MVP
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">አማን</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {/* Discover Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                Discover
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {discoverLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="flex items-center gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/cities">
            <Button variant="ghost">Cities</Button>
          </Link>
          {FEATURES.AI_PLANNER && (
            <Link href="/planner">
              <Button variant="ghost" className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                AI Planner
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  Preview
                </Badge>
              </Button>
            </Link>
          )}
          <Link href="/about">
            <Button variant="ghost">About</Button>
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Language/Currency Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Globe className="h-4 w-4" />
                <span className="text-xs">
                  {language.toUpperCase()} / {currency}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setLanguage("en")}>English {language === "en" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("am")}>አማርኛ {language === "am" && "✓"}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Currency</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setCurrency("USD")}>
                USD ($) {currency === "USD" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency("ETB")}>
                ETB (Br) {currency === "ETB" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-xs font-medium">{user?.name?.charAt(0) || "U"}</span>
                  </div>
                  <span className="hidden xl:inline">{user?.name || "User"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name || "User"}</span>
                    <span className="text-xs font-normal text-muted-foreground capitalize">
                      {user?.role || "guest"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === "traveler" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/home" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="flex items-center gap-2">
                        <Hotel className="h-4 w-4" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/itinerary" className="flex items-center gap-2">
                        <Map className="h-4 w-4" />
                        My Itinerary
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="flex items-center gap-2">
                        <Compass className="h-4 w-4" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile & Settings
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {user?.role === "provider" && FEATURES.PROVIDER_PORTAL && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/provider" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Provider Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Demo Role Switcher */}
                <DropdownMenuLabel className="text-xs text-muted-foreground">Demo: Switch Role</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => switchRole("guest")}>
                  Guest {user?.role === "guest" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole("traveler")}>
                  Traveler {user?.role === "traveler" && "✓"}
                </DropdownMenuItem>
                {FEATURES.PROVIDER_PORTAL && (
                  <DropdownMenuItem onClick={() => switchRole("provider")}>
                    Provider {user?.role === "provider" && "✓"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-1 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
              {/* Demo Role Switcher for guests */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Demo: Switch Role</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => switchRole("guest")}>Guest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => switchRole("traveler")}>Traveler</DropdownMenuItem>
                  {FEATURES.PROVIDER_PORTAL && (
                    <DropdownMenuItem onClick={() => switchRole("provider")}>Provider</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-border lg:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">Discover</p>
            {discoverLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-border" />
            <Link
              href="/cities"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Cities
            </Link>
            {FEATURES.AI_PLANNER && (
              <Link
                href="/planner"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                <Sparkles className="h-4 w-4" />
                AI Travel Planner
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  Preview
                </Badge>
              </Link>
            )}
            <Link
              href="/about"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="my-2 border-t border-border" />
            {/* Mobile Auth Section */}
            <div className="flex flex-col gap-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <span className="text-sm font-medium">{user?.name?.charAt(0) || "U"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role || "guest"}</p>
                    </div>
                  </div>
                  {user?.role === "traveler" && (
                    <>
                      <Button variant="outline" asChild className="w-full bg-transparent">
                        <Link href="/home">My Dashboard</Link>
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="ghost" size="sm" asChild className="justify-start">
                          <Link href="/bookings">Bookings</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="justify-start">
                          <Link href="/itinerary">Itinerary</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="justify-start">
                          <Link href="/messages">Messages</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="justify-start">
                          <Link href="/settings">Settings</Link>
                        </Button>
                      </div>
                    </>
                  )}
                  {user?.role === "provider" && FEATURES.PROVIDER_PORTAL && (
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/provider">Provider Dashboard</Link>
                    </Button>
                  )}
                  <Button variant="outline" onClick={logout} className="w-full bg-transparent text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
            {/* Mobile Demo Role Switcher */}
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Demo: Switch Role</p>
              <div className="flex gap-2">
                <Button
                  variant={user?.role === "guest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchRole("guest")}
                  className="flex-1"
                >
                  Guest
                </Button>
                <Button
                  variant={user?.role === "traveler" ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchRole("traveler")}
                  className="flex-1"
                >
                  Traveler
                </Button>
                {FEATURES.PROVIDER_PORTAL && (
                  <Button
                    variant={user?.role === "provider" ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchRole("provider")}
                    className="flex-1"
                  >
                    Provider
                  </Button>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
