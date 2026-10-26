"use client"

import { useState } from "react"
import { getMediaUrl } from "@/lib/utils/media"
import Link from "next/link"
import {
  Users,
  Building2,
  MessageSquare,
  Flag,
  Star,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// Mock data for admin dashboard
const statsCards = [
  {
    title: "Total Users",
    value: "12,456",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Active Providers",
    value: "892",
    change: "+8.2%",
    trend: "up",
    icon: Building2,
    href: "/admin/providers",
  },
  {
    title: "Messages Today",
    value: "1,234",
    change: "-3.1%",
    trend: "down",
    icon: MessageSquare,
    href: "/admin/messages",
  },
  {
    title: "Open Disputes",
    value: "23",
    change: "-15.0%",
    trend: "down",
    icon: Flag,
    href: "/admin/disputes",
  },
]

const recentDisputes: any[] = []

const pendingVerifications = [
  {
    id: "1",
    name: "Haile Hotel & Spa",
    type: "hotel",
    location: "Addis Ababa",
    submittedAt: "3 hours ago",
    documents: 5,
  },
  {
    id: "2",
    name: "Ethiopian Delights Restaurant",
    type: "restaurant",
    location: "Gondar",
    submittedAt: "1 day ago",
    documents: 3,
  },
  {
    id: "3",
    name: "Omo Valley Tours",
    type: "experience",
    location: "Jinka",
    submittedAt: "2 days ago",
    documents: 7,
  },
]

const flaggedMessages = [
  {
    id: "1",
    from: "Anonymous User",
    to: "Provider Support",
    reason: "Inappropriate language",
    excerpt: "The message contains potentially offensive content...",
    flaggedAt: "1 hour ago",
  },
  {
    id: "2",
    from: "Guest User",
    to: "Hotel Provider",
    reason: "Possible scam attempt",
    excerpt: "User requesting payment outside platform...",
    flaggedAt: "3 hours ago",
  },
]

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  investigating: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
}

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500",
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage the Algalle platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          const isUp = stat.trend === "up"
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        isUp ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isUp ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Disputes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Disputes</CardTitle>
              <CardDescription>Latest disputes requiring attention</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/disputes">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDisputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getMediaUrl(dispute.traveler.avatar)} />
                      <AvatarFallback>{dispute.traveler.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{dispute.traveler.name}</p>
                      <p className="text-sm text-muted-foreground">
                        vs. {dispute.provider.name}
                      </p>
                      <p className="mt-1 text-sm">{dispute.reason}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{dispute.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={priorityColors[dispute.priority]}>{dispute.priority}</Badge>
                    <Badge className={statusColors[dispute.status]}>{dispute.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Providers waiting for approval</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/verifications">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingVerifications.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.type} • {item.location}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.documents} documents • Submitted {item.submittedAt}
                    </p>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flagged Messages */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Flagged Messages
              </CardTitle>
              <CardDescription>Messages flagged for review</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/messages?filter=flagged">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flaggedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{msg.from}</p>
                      <span className="text-muted-foreground">→</span>
                      <p className="text-muted-foreground">{msg.to}</p>
                    </div>
                    <Badge variant="destructive" className="mt-1">
                      {msg.reason}
                    </Badge>
                    <p className="mt-2 text-sm text-muted-foreground">{msg.excerpt}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{msg.flaggedAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Dismiss
                    </Button>
                    <Button variant="destructive" size="sm">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>Response Rate</span>
                  <span className="font-medium">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>Dispute Resolution</span>
                  <span className="font-medium">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>User Satisfaction</span>
                  <span className="font-medium">4.6/5</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">New Registrations</span>
                </div>
                <span className="font-medium">156</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm">Bookings</span>
                </div>
                <span className="font-medium">89</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Reviews Posted</span>
                </div>
                <span className="font-medium">234</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Avg Response Time</span>
                </div>
                <span className="font-medium">2.4h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold">$124,563</p>
                <p className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +18.2% from last month
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Commissions</p>
                  <p className="font-medium">$18,450</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscriptions</p>
                  <p className="font-medium">$8,920</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
