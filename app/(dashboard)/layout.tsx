"use client"

import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Map, MessageSquare, Settings, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMediaUrl } from "@/lib/utils/media"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { getConversations } from "@/lib/api/messages"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { userProfile, isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread message count
  useEffect(() => {
    async function fetchUnreadCount() {
      if (!isAuthenticated) return
      try {
        const response = await getConversations()
        const conversations = response?.results || response || []
        const total = Array.isArray(conversations)
          ? conversations.reduce((sum, c) => sum + (c?.unread_count || 0), 0)
          : 0
        setUnreadCount(total)
      } catch {
        setUnreadCount(0)
      }
    }
    fetchUnreadCount()
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/bookings", label: "Bookings", icon: Calendar },
    { href: "/itinerary", label: "Itinerary", icon: Map },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">A</span>
              </div>
              <span className="text-xl font-bold">AMAN</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("gap-2", isActive && "bg-primary/10 text-primary")}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 px-1.5">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-destructive" />
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/settings">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/20">
                  <AvatarImage src={getMediaUrl(userProfile?.profile?.profile_photo) || undefined} />
                  <AvatarFallback>{userProfile?.user?.first_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
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
        <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-6 md:pb-6">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
