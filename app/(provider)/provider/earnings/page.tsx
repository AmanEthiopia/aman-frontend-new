"use client"

import type React from "react"

import { useState } from "react"
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transaction {
  id: string
  type: "payout" | "booking" | "fee" | "refund"
  description: string
  amount: number
  date: string
  status: "completed" | "pending" | "processing"
}

const mockTransactions: Transaction[] = [
  {
    id: "t1",
    type: "booking",
    description: "Booking #BK-104 - David Brown",
    amount: 360,
    date: "2025-01-12",
    status: "completed",
  },
  {
    id: "t2",
    type: "payout",
    description: "Weekly payout to bank",
    amount: -1850,
    date: "2025-01-10",
    status: "completed",
  },
  {
    id: "t3",
    type: "booking",
    description: "Booking #BK-103 - Emma Williams",
    amount: 320,
    date: "2025-01-08",
    status: "completed",
  },
  {
    id: "t4",
    type: "fee",
    description: "AMAN service fee (10%)",
    amount: -68,
    date: "2025-01-08",
    status: "completed",
  },
  {
    id: "t5",
    type: "booking",
    description: "Booking #BK-102 - Michael Chen",
    amount: 680,
    date: "2025-01-05",
    status: "pending",
  },
  {
    id: "t6",
    type: "refund",
    description: "Refund - Booking #BK-099",
    amount: -150,
    date: "2025-01-03",
    status: "completed",
  },
]

const monthlyData = {
  current: {
    revenue: 15420,
    bookings: 24,
    avgNightlyRate: 145,
    occupancy: 78,
  },
  previous: {
    revenue: 13700,
    bookings: 21,
    avgNightlyRate: 138,
    occupancy: 72,
  },
}

const typeConfig = {
  booking: { label: "Booking", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-950" },
  payout: { label: "Payout", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-950" },
  fee: { label: "Fee", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-950" },
  refund: { label: "Refund", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-950" },
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  prefix = "",
  suffix = "",
}: {
  title: string
  value: number
  change: number
  icon: React.ElementType
  prefix?: string
  suffix?: string
}) {
  const isPositive = change >= 0
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">
              {prefix}
              {value.toLocaleString()}
              {suffix}
            </p>
            <div className="mt-1 flex items-center gap-1 text-sm">
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={isPositive ? "text-green-600" : "text-red-600"}>
                {isPositive ? "+" : ""}
                {change}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProviderEarningsPage() {
  const [period, setPeriod] = useState("this-month")

  const revenueChange = Math.round(
    ((monthlyData.current.revenue - monthlyData.previous.revenue) / monthlyData.previous.revenue) * 100,
  )
  const bookingsChange = Math.round(
    ((monthlyData.current.bookings - monthlyData.previous.bookings) / monthlyData.previous.bookings) * 100,
  )
  const rateChange = Math.round(
    ((monthlyData.current.avgNightlyRate - monthlyData.previous.avgNightlyRate) / monthlyData.previous.avgNightlyRate) *
      100,
  )
  const occupancyChange = monthlyData.current.occupancy - monthlyData.previous.occupancy

  const pendingBalance = mockTransactions
    .filter((t) => t.status === "pending" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">Track your revenue and payouts</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Pending Payout Banner */}
      {pendingBalance > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Pending Balance</p>
                <p className="text-sm text-muted-foreground">Available for next payout</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-2xl font-bold">${pendingBalance.toLocaleString()}</p>
              <Button>Request Payout</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={monthlyData.current.revenue}
          change={revenueChange}
          icon={DollarSign}
          prefix="$"
        />
        <StatCard title="Total Bookings" value={monthlyData.current.bookings} change={bookingsChange} icon={Calendar} />
        <StatCard
          title="Avg. Nightly Rate"
          value={monthlyData.current.avgNightlyRate}
          change={rateChange}
          icon={TrendingUp}
          prefix="$"
        />
        <StatCard
          title="Occupancy Rate"
          value={monthlyData.current.occupancy}
          change={occupancyChange}
          icon={Clock}
          suffix="%"
        />
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Recent earnings and payouts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {mockTransactions.map((transaction) => {
                const config = typeConfig[transaction.type]
                return (
                  <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-full p-2 ${config.bgColor}`}>
                        <DollarSign className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "secondary"
                            : transaction.status === "pending"
                              ? "outline"
                              : "default"
                        }
                      >
                        {transaction.status}
                      </Badge>
                      <p
                        className={`text-lg font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-foreground"}`}
                      >
                        {transaction.amount >= 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </TabsContent>

            <TabsContent value="bookings" className="space-y-2">
              {mockTransactions
                .filter((t) => t.type === "booking")
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-green-100 p-2 dark:bg-green-950">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-green-600">+${transaction.amount}</p>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="payouts" className="space-y-2">
              {mockTransactions
                .filter((t) => t.type === "payout")
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-950">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold">${Math.abs(transaction.amount)}</p>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
