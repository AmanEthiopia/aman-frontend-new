"use client"

import type { ReactNode } from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  DollarSign,
  Star,
  ImageIcon,
  Settings,
  Bell,
  Building2,
  ChevronDown,
  Plus,
  UtensilsCrossed,
  Car,
  Map,
  LogOut,
  User,
  Menu,
  X,
  Package,
  CalendarDays,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getMediaUrl } from "@/lib/utils/media"
import { AmanMark, AmanWordmark } from "@/components/brand/aman-logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuth } from "@/contexts/auth-context"
import { getConversations } from "@/lib/api/messages"
import { getMyBookings, getMyProperties } from "@/lib/api/provider"
import { getUnreadCount } from "@/lib/api/notifications"
import type { PropertyBase, PropertyCategory } from "@/lib/api/provider"

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
  badge?: number
  children?: NavItem[]
}

function getSidebarItems(pendingBookings: number, unreadMessages: number): NavItem[] {
  return [
    { href: "/provider", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/provider/properties",
      label: "Properties",
      icon: Building2,
      children: [
        { href: "/provider/properties", label: "All Properties", icon: Building2 },
        { href: "/provider/properties/new?type=hotel", label: "Add Hotel", icon: Building2 },
        { href: "/provider/properties/new?type=restaurant", label: "Add Restaurant", icon: UtensilsCrossed },
        { href: "/provider/properties/new?type=driver", label: "Add Driver", icon: Car },
      ],
    },
    {
      href: "/provider/guides",
      label: "Guide Services",
      icon: Map,
      children: [
        { href: "/provider/guides", label: "My Guides", icon: Map },
        { href: "/provider/guides/new", label: "Add Guide Service", icon: Map },
        { href: "/provider/guides/bookings", label: "Guide Bookings", icon: Calendar },
      ],
    },
    {
      href: "/provider/packages",
      label: "Travel Packages",
      icon: Package,
      children: [
        { href: "/provider/packages", label: "All Packages", icon: Package },
        { href: "/provider/packages/new", label: "Create Package", icon: Plus },
        { href: "/provider/properties?tab=trip", label: "My Trips/Events", icon: CalendarDays },
        { href: "/provider/properties/new?type=trip", label: "Add Trip/Event", icon: Map },
      ],
    },
    { href: "/provider/bookings", label: "Bookings", icon: Calendar, badge: pendingBookings > 0 ? pendingBookings : undefined },
    { href: "/provider/calendar", label: "Calendar", icon: Calendar },
    { href: "/provider/messages", label: "Messages", icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : undefined },
    { href: "/provider/notifications", label: "Notifications", icon: Bell },
    { href: "/provider/earnings", label: "Earnings", icon: DollarSign },
    { href: "/provider/reviews", label: "Reviews", icon: Star },
    { href: "/provider/photos", label: "Photos", icon: ImageIcon },
    { href: "/provider/verification", label: "Verification", icon: ShieldCheck },
    { href: "/provider/settings", label: "Settings", icon: Settings },
  ]
}

function SidebarNav({ onItemClick, items }: { onItemClick?: () => void; items: NavItem[] }) {
  const pathname = usePathname()
  
  // Auto-expand parent sections when on child pages
  const getExpandedItems = useCallback(() => {
    const expanded: string[] = []
    items.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(
          child => pathname === child.href.split("?")[0] || pathname.startsWith(child.href.split("?")[0])
        )
        const isParentActive = pathname.startsWith(item.href)
        if (isChildActive || isParentActive) {
          expanded.push(item.href)
        }
      }
    })
    return expanded.length > 0 ? expanded : ["/provider/properties"]
  }, [pathname, items])
  
  const [openItems, setOpenItems] = useState<string[]>(getExpandedItems())
  
  // Update open items when pathname changes
  useEffect(() => {
    const expanded = getExpandedItems()
    setOpenItems(prev => {
      const newItems = [...new Set([...prev, ...expanded])]
      return newItems
    })
  }, [pathname, getExpandedItems])

  const toggleItem = (href: string) => {
    setOpenItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    )
  }

  return (
    <nav className="space-y-1 p-4">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        const hasChildren = item.children && item.children.length > 0
        const isOpen = openItems.includes(item.href)

        if (hasChildren) {
          return (
            <Collapsible key={item.href} open={isOpen} onOpenChange={() => toggleItem(item.href)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between gap-3",
                    isActive && "bg-primary/10 text-primary"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-4 mt-1 space-y-1 border-l pl-4">
                {item.children!.map((child) => {
                  const ChildIcon = child.icon
                  const isChildActive = pathname === child.href || pathname.startsWith(child.href.split("?")[0])
                  return (
                    <Link key={child.href} href={child.href} onClick={onItemClick}>
                      <Button
                        variant={isChildActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3",
                          isChildActive && "bg-primary/10 text-primary"
                        )}
                        size="sm"
                      >
                        <ChildIcon className="h-4 w-4" />
                        {child.label}
                      </Button>
                    </Link>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          )
        }

        return (
          <Link key={item.href} href={item.href} onClick={onItemClick}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3", isActive && "bg-primary/10 text-primary")}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.badge && (
                <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5">
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

export default function ProviderLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { userProfile, logout, isAuthenticated, isAuthReady } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState("All Properties")
  const [myProperties, setMyProperties] = useState<PropertyBase[]>([])
  const [pendingBookings, setPendingBookings] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  // Fetch real counts for badges and property list
  useEffect(() => {
    async function fetchCounts() {
      if (!isAuthenticated) return
      try {
        // Fetch pending bookings count
        const bookingsResponse = await getMyBookings({ status: "pending", page_size: 1 })
        setPendingBookings((bookingsResponse as any)?.meta?.pagination?.count || bookingsResponse?.count || 0)
      } catch {
        setPendingBookings(0)
      }
      try {
        // Fetch unread messages count
        const conversationsResponse = await getConversations()
        const conversations = conversationsResponse?.data ?? []
        const total = conversations.reduce((sum: number, c: any) => sum + (c?.unread_count || 0), 0)
        setUnreadMessages(total)
      } catch {
        setUnreadMessages(0)
      }
      try {
        const count = await getUnreadCount()
        setUnreadNotifs(count)
      } catch {
        setUnreadNotifs(0)
      }
      try {
        // Fetch real properties for the dropdown
        const propertiesResponse = await getMyProperties()
        const list = Array.isArray(propertiesResponse) ? propertiesResponse : (propertiesResponse?.results ?? [])
        setMyProperties(list)
      } catch {
        setMyProperties([])
      }
    }
    fetchCounts()
    // Poll every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const sidebarItems = getSidebarItems(pendingBookings, unreadMessages)

  const propertyTypeIcons: Record<string, typeof Building2> = {
    hotel: Building2,
    restaurant: UtensilsCrossed,
    driver: Car,
    trip: Map,
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo & Property Selector */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex h-16 items-center border-b px-4">
                  <Link href="/" className="flex items-center gap-2" aria-label="Alga Ale home">
                    <AmanMark size={32} variant="stacked" className="rounded-md" />
                    <AmanWordmark height={22} />
                  </Link>
                </div>
                <SidebarNav items={sidebarItems} onItemClick={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2" aria-label="Alga Ale home">
              <AmanMark size={32} variant="stacked" className="rounded-md" />
              <AmanWordmark height={22} className="hidden sm:block" />
              <Badge variant="secondary" className="ml-2">
                Provider
              </Badge>
            </Link>

            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Building2 className="h-4 w-4" />
                    <span className="max-w-[200px] truncate">{selectedProperty}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Your Properties</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {myProperties.length === 0 ? (
                    <DropdownMenuItem disabled>No properties yet</DropdownMenuItem>
                  ) : (
                    myProperties.map((property) => {
                      const Icon = propertyTypeIcons[property.category] || Building2
                      return (
                        <DropdownMenuItem
                          key={property.id}
                          onClick={() => {
                            setSelectedProperty(property.name)
                            router.push(`/provider/properties/${property.category}s/${property.id}`)
                          }}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {property.name}
                          {property.name === selectedProperty && (
                            <Badge className="ml-auto" variant="secondary">
                              Active
                            </Badge>
                          )}
                        </DropdownMenuItem>
                      )
                    })
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/provider/properties/new" className="text-primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Property
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <Link href="/provider/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {unreadNotifs > 99 ? "99+" : unreadNotifs}
                  </span>
                )}
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getMediaUrl(userProfile?.profile?.profile_photo) || undefined} />
                    <AvatarFallback>
                      {userProfile?.user?.first_name?.[0] || "P"}
                      {userProfile?.user?.last_name?.[0] || "O"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:inline">
                    {userProfile?.user?.first_name || "Provider"}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 md:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{userProfile?.user?.first_name} {userProfile?.user?.last_name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {userProfile?.user?.email || "provider@example.com"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/provider/settings">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/provider/properties">
                    <Building2 className="mr-2 h-4 w-4" />
                    My Properties
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r bg-background lg:block">
          <SidebarNav items={sidebarItems} />
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background lg:hidden">
          <div className="flex items-center justify-around py-2">
            {[
              { href: "/provider", label: "Dashboard", icon: LayoutDashboard },
              { href: "/provider/properties", label: "Properties", icon: Building2 },
              { href: "/provider/bookings", label: "Bookings", icon: Calendar, badge: pendingBookings > 0 ? pendingBookings : undefined },
              { href: "/provider/earnings", label: "Earnings", icon: DollarSign },
              { href: "/provider/settings", label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute -right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 pb-24 lg:ml-64 lg:pb-6">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
