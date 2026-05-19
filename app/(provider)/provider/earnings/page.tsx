"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  Download,
  Loader2,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Receipt,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  getNewProviderEarnings,
  type ProviderEarningsData,
  type EarningsPeriod,
  type EarningsType,
  type EarningsTransaction,
} from "@/lib/api/provider-dashboard"

const PERIOD_LABELS: Record<EarningsPeriod, string> = {
  this_month:    "This Month",
  last_month:    "Last Month",
  last_3_months: "Last 3 Months",
  last_6_months: "Last 6 Months",
  this_year:     "This Year",
}

// ============================================================================
// Metric Card
// ============================================================================

function MetricCard({
  title,
  value,
  changePct,
  icon: Icon,
  loading = false,
}: {
  title: string
  value: string
  changePct?: number | null
  icon: React.ElementType
  loading?: boolean
}) {
  const hasChange = changePct !== null && changePct !== undefined
  const isPositive = hasChange && changePct! >= 0

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <div className="mt-1 h-8 w-28 animate-pulse rounded bg-muted" />
            ) : (
              <p className="mt-1 text-2xl font-bold leading-tight">{value}</p>
            )}
            {hasChange && !loading && (
              <div className="mt-1 flex items-center gap-1 text-sm">
                {isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
                )}
                <span className={isPositive ? "text-green-600" : "text-red-600"}>
                  {isPositive ? "+" : ""}{changePct}%
                </span>
                <span className="text-muted-foreground text-xs">vs last period</span>
              </div>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3 ml-3 shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Transaction Row
// ============================================================================

function TransactionRow({ tx }: { tx: EarningsTransaction }) {
  const isCredit = tx.is_credit
  const isFee = tx.type === "service_fee"

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`rounded-full p-2 shrink-0 ${isCredit ? "bg-green-100 dark:bg-green-950" : "bg-orange-100 dark:bg-orange-950"}`}>
          {isCredit ? (
            <DollarSign className="h-4 w-4 text-green-600" />
          ) : (
            <Receipt className="h-4 w-4 text-orange-600" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{tx.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {tx.property_name}
            </span>
            <span>·</span>
            <span>
              {new Date(tx.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {isFee && (
          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">Fee</Badge>
        )}
        <p className={`text-base font-semibold whitespace-nowrap ${isCredit ? "text-green-600" : "text-muted-foreground"}`}>
          {isCredit ? "+" : "−"}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Page
// ============================================================================

export default function ProviderEarningsPage() {
  const [period, setPeriod] = useState<EarningsPeriod>("this_month")
  const [txType, setTxType] = useState<EarningsType>("all")
  const [data, setData] = useState<ProviderEarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)
    try {
      const result = await getNewProviderEarnings({ period, type: txType, page_size: 100 })
      setData(result)
      if (showRefreshing) toast.success("Earnings refreshed")
    } catch (err) {
      console.error("[v0] Earnings load error:", err)
      if (showRefreshing) toast.error("Failed to refresh earnings")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [period, txType])

  useEffect(() => { load() }, [load])

  const handleExport = () => {
    if (!data?.transactions?.length) {
      toast.info("No transactions to export")
      return
    }
    const headers = ["Date", "Type", "Description", "Property", "Amount", "Credit"]
    const rows = data.transactions.map((t) => [
      t.date,
      t.type,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.property_name.replace(/"/g, '""')}"`,
      t.amount.toString(),
      t.is_credit ? "yes" : "no",
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `earnings-${period}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Earnings exported")
  }

  const metrics = data?.metrics
  const transactions = data?.transactions ?? []
  const currency = metrics?.total_revenue?.currency ?? "USD"

  const filtered = txType === "all"
    ? transactions
    : txType === "booking"
      ? transactions.filter((t) => t.type === "booking")
      : transactions.filter((t) => t.type === "service_fee")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">Track your revenue and payouts</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="ghost" size="icon" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Select value={period} onValueChange={(v) => setPeriod(v as EarningsPeriod)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIOD_LABELS) as EarningsPeriod[]).map((p) => (
                <SelectItem key={p} value={p}>{PERIOD_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Period info */}
      {data && (
        <p className="text-xs text-muted-foreground">
          Showing data from{" "}
          <span className="font-medium">
            {new Date(data.period_start).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          {" "}to{" "}
          <span className="font-medium">
            {new Date(data.period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </p>
      )}

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={loading ? "—" : `${currency} ${(metrics?.total_revenue?.value ?? 0).toLocaleString()}`}
          changePct={metrics?.total_revenue?.vs_last_period_pct}
          icon={DollarSign}
          loading={loading}
        />
        <MetricCard
          title="Total Bookings"
          value={loading ? "—" : String(metrics?.total_bookings?.value ?? 0)}
          changePct={metrics?.total_bookings?.vs_last_period_pct}
          icon={Calendar}
          loading={loading}
        />
        <MetricCard
          title="Avg. Nightly Rate"
          value={loading ? "—" : `${currency} ${(metrics?.avg_nightly_rate?.value ?? 0).toLocaleString()}`}
          changePct={metrics?.avg_nightly_rate?.vs_last_period_pct}
          icon={TrendingUp}
          loading={loading}
        />
        <MetricCard
          title="Occupancy Rate"
          value={loading ? "—" : `${metrics?.occupancy_rate?.value ?? 0}%`}
          changePct={metrics?.occupancy_rate?.vs_last_period_pct}
          icon={Clock}
          loading={loading}
        />
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} for{" "}
                {PERIOD_LABELS[period].toLowerCase()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={txType} onValueChange={(v) => setTxType(v as EarningsType)} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All ({transactions.length})
              </TabsTrigger>
              <TabsTrigger value="booking">
                Bookings ({transactions.filter((t) => t.type === "booking").length})
              </TabsTrigger>
              <TabsTrigger value="service_fee">
                Fees ({transactions.filter((t) => t.type === "service_fee").length})
              </TabsTrigger>
            </TabsList>

            {(["all", "booking", "service_fee"] as EarningsType[]).map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-2 mt-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    No transactions found for this period
                  </div>
                ) : (
                  filtered.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
