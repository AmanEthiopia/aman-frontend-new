import { Shield, CheckCircle2, Users, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TrustIndicatorsProps {
  isVerified?: boolean
  responseTime?: string
  bookingCount?: number
  verificationLevel?: "basic" | "verified" | "premium"
  className?: string
}

export function TrustIndicators({
  isVerified = false,
  responseTime,
  bookingCount,
  verificationLevel = "basic",
  className = "",
}: TrustIndicatorsProps) {
  return (
    <TooltipProvider>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {isVerified && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={verificationLevel === "premium" ? "default" : "secondary"} className="gap-1">
                <Shield className="h-3 w-3" />
                {verificationLevel === "premium" ? "Premium Verified" : "Verified"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Identity and property verified by Algalle</p>
            </TooltipContent>
          </Tooltip>
        )}

        {responseTime && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {responseTime}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Average response time</p>
            </TooltipContent>
          </Tooltip>
        )}

        {bookingCount !== undefined && bookingCount > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {bookingCount}+ bookings
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total confirmed bookings</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

export function BookingProtectionBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Booking Protected
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs space-y-1">
            <p className="font-medium">Your booking is protected by Algalle</p>
            <ul className="text-xs space-y-0.5">
              <li>• Free cancellation up to 48 hours</li>
              <li>• Verified property information</li>
              <li>• 24/7 customer support</li>
              <li>• Dispute resolution assistance</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
