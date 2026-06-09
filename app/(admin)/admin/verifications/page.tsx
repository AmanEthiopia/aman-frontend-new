"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  AlertTriangle,
  Building2,
  ChevronRight,
  RefreshCw,
  Loader2,
  Search,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  getVerificationRequests,
  getStatusColor,
  getStatusLabel,
  getEntityTypeLabel,
} from "@/lib/api/verification"
import type { VerificationRequest, VerificationStatus, EntityType } from "@/lib/api/verification"

function StatusIcon({ status }: { status: VerificationStatus }) {
  switch (status) {
    case "approved":
      return <ShieldCheck className="h-4 w-4 text-green-600" />
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-600" />
    case "in_review":
      return <Shield className="h-4 w-4 text-blue-600" />
    case "change_requested":
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
    case "rejected":
      return <ShieldX className="h-4 w-4 text-red-600" />
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const STAT_DEFS: { status: VerificationStatus; label: string; icon: typeof Clock; colorClass: string }[] = [
  { status: "pending", label: "Pending Review", icon: Clock, colorClass: "text-yellow-600 bg-yellow-100 dark:bg-yellow-950" },
  { status: "in_review", label: "In Review", icon: Shield, colorClass: "text-blue-600 bg-blue-100 dark:bg-blue-950" },
  { status: "change_requested", label: "Changes Requested", icon: AlertTriangle, colorClass: "text-orange-600 bg-orange-100 dark:bg-orange-950" },
  { status: "approved", label: "Approved", icon: ShieldCheck, colorClass: "text-green-600 bg-green-100 dark:bg-green-950" },
]

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<VerificationStatus | "all">("all")
  const [entityFilter, setEntityFilter] = useState<EntityType | "all">("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadRequests()
  }, [activeTab, entityFilter, page])

  async function loadRequests() {
    setIsLoading(true)
    try {
      const result = await getVerificationRequests({
        status: activeTab === "all" ? undefined : activeTab,
        entity_type: entityFilter === "all" ? undefined : entityFilter,
        page,
      })
      const items: VerificationRequest[] = result?.data ?? (Array.isArray(result) ? result as any : [])
      setRequests(items)
      setTotalPages(result?.meta?.pagination?.total_pages ?? 1)
      setTotalCount(result?.meta?.pagination?.count ?? items.length)
    } catch {
      toast.error("Failed to load verification requests")
    } finally {
      setIsLoading(false)
    }
  }

  // Count by status for stats (from loaded data — approximate)
  const countByStatus = (status: VerificationStatus) =>
    requests.filter((r) => r.status === status).length

  // Client-side search filter
  const filtered = requests.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.entity_id?.toLowerCase().includes(q) ||
      r.entity_name?.toLowerCase().includes(q) ||
      r.submitted_by_email?.toLowerCase().includes(q) ||
      r.entity_type?.toLowerCase().includes(q)
    )
  })

  const TABS: { value: VerificationStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "in_review", label: "In Review" },
    { value: "change_requested", label: "Changes Requested" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Verifications</h1>
          <p className="text-muted-foreground">Review and approve provider property verification requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadRequests} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_DEFS.map(({ status, label, icon: Icon, colorClass }) => (
          <Card
            key={status}
            className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/40 ${activeTab === status ? "ring-2 ring-primary" : ""}`}
            onClick={() => { setActiveTab(status); setPage(1) }}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{countByStatus(status)}</p>
                <p className="text-xs text-muted-foreground leading-tight">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <Button
              key={tab.value}
              size="sm"
              variant={activeTab === tab.value ? "default" : "outline"}
              onClick={() => { setActiveTab(tab.value); setPage(1) }}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Select
            value={entityFilter}
            onValueChange={(v) => { setEntityFilter(v as EntityType | "all"); setPage(1) }}
          >
            <SelectTrigger className="w-36 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
              <SelectItem value="guide">Guide</SelectItem>
              <SelectItem value="package">Package</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-48 pl-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold">No verification requests</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTab === "all" ? "No requests have been submitted yet." : `No ${getStatusLabel(activeTab as string)} requests.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => (
            <Link key={req.id} href={`/admin/verifications/${req.id}`}>
              <Card className="transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20 cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">
                        {req.entity_name ?? `${getEntityTypeLabel(req.entity_type)} · ${req.entity_id.slice(0, 8)}...`}
                      </span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {getEntityTypeLabel(req.entity_type)}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      {req.submitted_by_email && <span>{req.submitted_by_email}</span>}
                      <span>Submitted {formatDate(req.created_at)}</span>
                      {req.reviewed_at && <span>Reviewed {formatDate(req.reviewed_at)}</span>}
                    </div>
                    {req.submitter_notes && (
                      <p className="mt-1 text-xs text-muted-foreground truncate max-w-lg">
                        &ldquo;{req.submitter_notes}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge className={`${getStatusColor(req.status)} border-0 gap-1`}>
                      <StatusIcon status={req.status} />
                      {getStatusLabel(req.status)}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{totalCount} total requests</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
