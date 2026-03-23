"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Building2,
  Star,
  Flag,
  Settings,
  Bell,
  Shield,
  LogOut,
  Menu,
  Home,
  ChevronDown,
  FileText,
  BarChart3,
  Gavel,
  AlertTriangle,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
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
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
  badge?: number
}

const sidebarItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/providers", label: "Providers", icon: Building2 },
  { href: "/admin/listings", label: "Listings", icon: MapPin },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: 5 },
  { href: "/admin/disputes", label: "Disputes", icon: Flag, badge: 3 },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/reports", label: "Reports", icon: AlertTriangle, badge: 2 },
  { href: "/admin/verifications", label: "Verifications", icon: Shield },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/moderation", label: "Moderation", icon: Gavel },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

function SidebarNav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1 p-4">
      {sidebarItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

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

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { userProfile, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo */}
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
                  <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive">
                      <Shield className="h-4 w-4 text-destructive-foreground" />
                    </div>
                    <span className="text-xl font-bold">AMAN Admin</span>
                  </Link>
                </div>
                <SidebarNav onItemClick={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive">
                <Shield className="h-4 w-4 text-destructive-foreground" />
              </div>
              <span className="hidden text-xl font-bold sm:inline">AMAN</span>
              <Badge variant="destructive" className="ml-2">
                Admin
              </Badge>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hidden gap-2 sm:flex">
                <Home className="h-4 w-4" />
                Back to AMAN
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-destructive" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.profile?.profile_photo} />
                    <AvatarFallback className="bg-destructive text-destructive-foreground">
                      {userProfile?.user?.first_name?.[0] || "A"}
                      {userProfile?.user?.last_name?.[0] || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:inline">
                    {userProfile?.user?.first_name || "Admin"}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 md:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>
                      {userProfile?.user?.first_name} {userProfile?.user?.last_name}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {userProfile?.user?.email || "admin@aman.com"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/home">
                    <Home className="mr-2 h-4 w-4" />
                    Switch to Traveler
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
          <SidebarNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 pb-6 lg:ml-64">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireRole="admin">
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  )
}
