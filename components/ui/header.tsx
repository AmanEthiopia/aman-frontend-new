"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlgaAleWordmark } from "@/components/brand/alga-ale-logo"
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
  Crown,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/lib/contexts/app-context"
import { FEATURES } from "@/lib/config/features"

interface HeaderProps {
  /** "overlay": transparent with white text over a full-bleed hero until the page scrolls (home page). */
  variant?: "default" | "overlay"
}

export function Header({ variant = "default" }: HeaderProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  const { userProfile, isAuthenticated, logout } = useAuth()
  const { language, setLanguage, currency, setCurrency } = useApp()
  const userName = [userProfile?.user?.first_name, userProfile?.user?.last_name].filter(Boolean).join(" ") || "User"
  const isProvider = userProfile?.role?.is_provider ?? false

  const handleSetLanguage = (lang: "en" | "am") => {
    setLanguage(lang)
    if (typeof window === "undefined") return
    if (lang === "en") {
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
      document.cookie = `googtrans=; path=/; domain=.${location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/`
      document.cookie = `googtrans=/en/${lang}; path=/; domain=.${location.hostname}`
    }
    location.reload()
  }

  const discoverLinks = [
    { href: "/hotels", label: "Hotels & Stays", icon: Hotel },
    ...(FEATURES.RESTAURANTS ? [{ href: "/restaurants", label: "Restaurants", icon: Utensils }] : []),
    ...(FEATURES.TRANSPORT ? [{ href: "/transport", label: "Transport", icon: Car }] : []),
    ...(FEATURES.EXPERIENCES ? [{ href: "/experiences", label: "Experiences", icon: Compass }] : []),
    ...(FEATURES.GUIDES ? [{ href: "/guides", label: "Tour Guides", icon: Map }] : []),
    ...(FEATURES.ATTRACTIONS ? [{ href: "/attractions", label: "Attractions", icon: MapPin }] : []),
  ]

  const isOverlayVariant = variant === "overlay"
  const overlay = isOverlayVariant && !isScrolled && !isMenuOpen
  const navButton = overlay ? "text-white hover:bg-white/10 hover:text-white" : ""

  const localeMenu = (
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Language</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => handleSetLanguage("en")}>English {language === "en" && "✓"}</DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleSetLanguage("am")}>አማርኛ {language === "am" && "✓"}</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Currency</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => setCurrency("USD")}>
        USD ($) {currency === "USD" && "✓"}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setCurrency("ETB")}>
        ETB (Br) {currency === "ETB" && "✓"}
      </DropdownMenuItem>
    </DropdownMenuContent>
  )

  return (
    <header
      data-scrolled={isScrolled}
      className={
        overlay
          ? "sticky top-0 z-50 w-full border-b border-white/12 bg-transparent text-white transition-colors"
          : "aman-glass sticky top-0 z-50 w-full border-b border-border/40"
      }
    >
      <div
        className={
          isOverlayVariant
            ? "flex h-16 w-full items-center justify-between px-4 lg:h-[84px] lg:px-8 xl:px-[72px]"
            : "container mx-auto flex h-16 items-center justify-between px-4"
        }
      >
        <Link href={isProvider ? "/provider" : "/"} className="flex items-center gap-2">
          <AlgaAleWordmark size={36} reverse={overlay} />
        </Link>

        {/* Desktop Navigation */}
        {!isProvider && (
          <nav className="hidden items-center gap-1 lg:flex">
            {/* Discover Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`flex items-center gap-1 ${navButton}`}>
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
              <Button variant="ghost" className={navButton}>Cities</Button>
            </Link>
            {FEATURES.AI_PLANNER && (
              <Link href="/planner">
                <Button variant="ghost" className={`flex items-center gap-1 ${navButton}`}>
                  <Sparkles className="h-4 w-4" />
                  AI Planner
                </Button>
              </Link>
            )}
            <Link href="/concierge">
              <Button variant="ghost" className={`flex items-center gap-1 ${navButton}`}>
                <Crown className="h-4 w-4" />
                Premium
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className={navButton}>About</Button>
            </Link>
          </nav>
        )}

        {/* Right Side Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Language/Currency Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={`gap-1 ${navButton}`}>
                <Globe className="h-4 w-4" />
                <span className="text-xs">
                  {language.toUpperCase()} / {currency}
                </span>
              </Button>
            </DropdownMenuTrigger>
            {localeMenu}
          </DropdownMenu>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`gap-2 cursor-pointer ${navButton || "hover:bg-accent"}`}>
                  <Link href={isProvider ? "/provider" : "/home"} className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:ring-2 hover:ring-primary/30 transition-all">
                    <span className="text-xs font-medium">{userName.charAt(0)}</span>
                  </Link>
                  <span className="hidden xl:inline">{userName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{userName}</span>
                    <span className="text-xs font-normal text-muted-foreground capitalize">
                      {isProvider ? "Provider" : "Traveler"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isProvider && (
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
                {isProvider && FEATURES.PROVIDER_PORTAL && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/provider" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Provider Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/provider/properties" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        My Properties
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/provider/settings" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className={navButton}>
                <Link href="/login">
                  <LogIn className="mr-1 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
                className={overlay ? "rounded-full bg-white px-5 font-semibold text-[#0F1F14] hover:bg-[#E9F3E6]" : ""}
              >
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile: glass locale + menu buttons over the hero, plain menu toggle elsewhere */}
        {isOverlayVariant ? (
          <div className="flex items-center gap-2 lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Language and currency"
                  className={
                    overlay
                      ? "flex h-11 w-11 items-center justify-center rounded-full border border-white/22 bg-white/14 backdrop-blur-md"
                      : "flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted"
                  }
                >
                  <Globe className="h-[19px] w-[19px]" />
                </button>
              </DropdownMenuTrigger>
              {localeMenu}
            </DropdownMenu>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className={
                overlay
                  ? "flex h-11 w-11 items-center justify-center rounded-full border border-white/22 bg-white/14 backdrop-blur-md"
                  : "flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted"
              }
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        ) : (
          <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-border lg:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
            {!isProvider && (
              <>
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
                  </Link>
                )}
                <Link
                  href="/concierge"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Crown className="h-4 w-4" />
                  Premium Concierge
                </Link>
                <Link
                  href="/about"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <div className="my-2 border-t border-border" />
              </>
            )}
            {/* Mobile Auth Section */}
            <div className="flex flex-col gap-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <span className="text-sm font-medium">{userName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{isProvider ? "Provider" : "Traveler"}</p>
                    </div>
                  </div>
                  {!isProvider && (
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
                  {isProvider && FEATURES.PROVIDER_PORTAL && (
                    <>
                      <Button variant="outline" asChild className="w-full bg-transparent">
                        <Link href="/provider">Provider Dashboard</Link>
                      </Button>
                      <Button variant="ghost" asChild className="w-full justify-start bg-transparent">
                        <Link href="/provider/settings">Profile Settings</Link>
                      </Button>
                    </>
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
          </nav>
        </div>
      )}
    </header>
  )
}
