import { Shield, Users, DollarSign, CheckCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TrustBadgeProps {
  lastVerified?: string
  foreignTravelerCount?: number
  disputeFreeDays?: number
  compact?: boolean
}

export function TrustBadge({ lastVerified, foreignTravelerCount, disputeFreeDays, compact = false }: TrustBadgeProps) {
  const isRecentlyVerified = lastVerified
    ? new Date(lastVerified) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : false

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary cursor-help">
              <Shield className="h-3 w-3" />
              <span>Alga Ale Verified</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Verified by the Alga Ale trust team.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <Shield className="h-4 w-4" />
          Why Alga Ale Recommends This
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Signals based on Alga Ale verification, traveler activity, and pricing checks.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-1.5">
        {isRecentlyVerified && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-primary" />
            Verified in last 30 days
          </div>
        )}
        {foreignTravelerCount && foreignTravelerCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3 text-primary" />
            Used by {foreignTravelerCount}+ foreign travelers
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <DollarSign className="h-3 w-3 text-primary" />
          Price within local fair range
        </div>
        {disputeFreeDays && disputeFreeDays > 60 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-primary" />
            No disputes in last {disputeFreeDays} days
          </div>
        )}
      </div>
    </div>
  )
}
