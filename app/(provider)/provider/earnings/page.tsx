"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  TrendingUp,
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
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  custom:        "Custom Range",
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

function TransactionRow({ tx, currency }: { tx: EarningsTransaction; currency: string }) {
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
          {isCredit ? "+" : "−"}{currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// PDF Export
// ============================================================================

function exportToPDF(
  data: ProviderEarningsData,
  transactions: EarningsTransaction[],
  currency: string,
  periodLabel: string,
) {
  const fmt = (n: number) => `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const metrics = data.metrics

  const rows = transactions.map((t) => `
    <tr>
      <td>${fmtDate(t.date)}</td>
      <td>${t.type === "service_fee" ? "Service Fee" : "Booking"}</td>
      <td>${t.description}</td>
      <td>${t.property_name}</td>
      <td style="text-align:right; color:${t.is_credit ? "#16a34a" : "#9ca3af"}">
        ${t.is_credit ? "+" : "−"}${fmt(t.amount)}
      </td>
    </tr>
  `).join("")

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Earnings Report — ${periodLabel}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 13px; color: #111; padding: 32px; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .metric { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; }
  .metric-label { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
  .metric-value { font-size: 20px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb; }
  td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .footer { margin-top: 24px; color: #9ca3af; font-size: 11px; }
  @media print { body { padding: 16px; } button { display: none; } }
</style>
</head>
<body>
  <h1>Earnings Report</h1>
  <p class="subtitle">
    Period: ${periodLabel} &nbsp;·&nbsp;
    ${fmtDate(data.period_start)} – ${fmtDate(data.period_end)} &nbsp;·&nbsp;
    Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
  </p>

  <div class="metrics">
    <div class="metric">
      <div class="metric-label">Total Revenue</div>
      <div class="metric-value">${fmt(metrics.total_revenue.value)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Total Bookings</div>
      <div class="metric-value">${metrics.total_bookings.value}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Avg. Nightly Rate</div>
      <div class="metric-value">${fmt(metrics.avg_nightly_rate.value)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Occupancy Rate</div>
      <div class="metric-value">${metrics.occupancy_rate.value}%</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Description</th>
        <th>Property</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:20px">No transactions</td></tr>'}
    </tbody>
  </table>

  <div class="footer">Aman Ethiopia · Alga Ale Provider Dashboard</div>
</body>
</html>`

  const win = window.open("", "_blank", "width=900,height=700")
  if (!win) {
    toast.error("Pop-up blocked — please allow pop-ups and try again")
    return
  }
  win.document.write(html)
  win.document.close()
  win.onload = () => {
    win.focus()
    win.print()
  }
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
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const load = useCallback(async (showRefreshing = false) => {
    if (period === "custom" && (!dateFrom || !dateTo)) return
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)
    try {
      const result = await getNewProviderEarnings({
        period,
        type: txType,
        page_size: 100,
        ...(period === "custom" ? { date_from: dateFrom, date_to: dateTo } : {}),
      })
      setData(result)
      if (showRefreshing) toast.success("Earnings refreshed")
    } catch (err) {
      console.error("[v0] Earnings load error:", err)
      if (showRefreshing) toast.error("Failed to refresh earnings")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [period, txType, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  const handleExport = () => {
    if (!data?.transactions?.length) {
      toast.info("No transactions to export")
      return
    }
    const label = period === "custom"
      ? `${dateFrom} to ${dateTo}`
      : PERIOD_LABELS[period]
    exportToPDF(data, filtered, currency, label)
    toast.success("Opening PDF — use your browser's print dialog to save")
  }

  const metrics = data?.metrics
  const transactions = data?.transactions ?? []
  const currency = metrics?.total_revenue?.currency ?? "ETB"

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
        <div className="flex gap-2 flex-wrap items-end">
          <Button variant="ghost" size="icon" onClick={() => load(true)} disabled={refreshing || (period === "custom" && (!dateFrom || !dateTo))}>
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>

          {/* Period selector */}
          <Select value={period} onValueChange={(v) => setPeriod(v as EarningsPeriod)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIOD_LABELS) as EarningsPeriod[]).map((p) => (
                <SelectItem key={p} value={p}>{PERIOD_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom date pickers */}
          {period === "custom" && (
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-36 h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-36 h-9"
                />
              </div>
              <Button
                size="sm"
                onClick={() => load(false)}
                disabled={!dateFrom || !dateTo || loading}
                className="h-9"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
          )}

          <Button variant="outline" onClick={handleExport} disabled={loading || !data?.transactions?.length}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
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

      {/* Custom period — prompt to apply */}
      {period === "custom" && (!dateFrom || !dateTo) && (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-3 py-4">
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">Select a start and end date above, then click <strong>Apply</strong> to load earnings.</p>
          </CardContent>
        </Card>
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
                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}{" "}
                {period === "custom" && dateFrom && dateTo
                  ? `from ${dateFrom} to ${dateTo}`
                  : `for ${PERIOD_LABELS[period].toLowerCase()}`}
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
                  filtered.map((tx) => <TransactionRow key={tx.id} tx={tx} currency={currency} />)
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
