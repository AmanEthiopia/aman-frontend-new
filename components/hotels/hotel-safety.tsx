import { Shield, AlertTriangle } from "lucide-react"

interface HotelSafetyProps {
  safetyNotes: string | null
  isVerified: boolean
}

export function HotelSafety({ safetyNotes, isVerified }: HotelSafetyProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Shield className="h-5 w-5 text-primary" />
        Safety & Security
      </h2>

      {isVerified && (
        <div className="mb-4 flex items-start gap-3 rounded-lg bg-primary/10 p-4">
          <Shield className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-primary">Verified by ALGA-ALLE</p>
            <p className="text-sm text-muted-foreground">
              This hotel has been personally verified by our team for accuracy and quality.
            </p>
          </div>
        </div>
      )}

      {safetyNotes ? (
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <p className="text-muted-foreground">{safetyNotes}</p>
        </div>
      ) : (
        <p className="text-muted-foreground">No specific safety notes available for this hotel.</p>
      )}
    </div>
  )
}
