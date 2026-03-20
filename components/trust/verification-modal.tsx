"use client"

import type React from "react"

import { useState } from "react"
import { Shield, CheckCircle2, Camera, FileText, Phone, Mail, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface VerificationStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  completed: boolean
  required: boolean
}

const verificationSteps: VerificationStep[] = [
  {
    id: "email",
    title: "Email Verification",
    description: "Confirm your email address",
    icon: Mail,
    completed: true,
    required: true,
  },
  {
    id: "phone",
    title: "Phone Verification",
    description: "Add and verify your phone number",
    icon: Phone,
    completed: true,
    required: true,
  },
  {
    id: "id",
    title: "ID Verification",
    description: "Upload a government-issued ID",
    icon: FileText,
    completed: false,
    required: true,
  },
  {
    id: "photo",
    title: "Profile Photo",
    description: "Add a clear photo of yourself",
    icon: Camera,
    completed: false,
    required: false,
  },
]

export function VerificationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const completedSteps = verificationSteps.filter((s) => s.completed).length
  const progress = (completedSteps / verificationSteps.length) * 100

  const handleVerify = async (stepId: string) => {
    setCurrentStep(stepId)
    setUploading(true)
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setUploading(false)
    setCurrentStep(null)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle>Verify Your Identity</DialogTitle>
              <DialogDescription>Complete verification to build trust with hosts and other travelers</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verification progress</span>
              <span className="font-medium">
                {completedSteps} of {verificationSteps.length} complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Trust Level */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Trust Level</span>
              <Badge variant={completedSteps >= 3 ? "default" : "secondary"}>
                {completedSteps >= 3 ? "Verified" : completedSteps >= 2 ? "Basic" : "New"}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {completedSteps >= 3
                ? "You're fully verified! Hosts are more likely to accept your bookings."
                : "Complete more steps to increase your trust level and booking success rate."}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {verificationSteps.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.id

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border p-4 transition-all",
                    step.completed && "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900",
                    isActive && "ring-2 ring-primary",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-full p-2",
                      step.completed
                        ? "bg-green-100 text-green-600 dark:bg-green-900"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {step.completed ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{step.title}</h4>
                      {step.required && !step.completed && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Button size="sm" onClick={() => handleVerify(step.id)} disabled={uploading}>
                      {isActive && uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function WhyAmanRecommends({
  title,
  reasons,
}: {
  title: string
  reasons: { icon: React.ElementType; text: string }[]
}) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-950/20">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-green-600" />
        <h4 className="font-semibold text-green-800 dark:text-green-200">{title}</h4>
      </div>
      <ul className="space-y-2">
        {reasons.map((reason, index) => {
          const Icon = reason.icon
          return (
            <li key={index} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Icon className="h-4 w-4 flex-shrink-0" />
              {reason.text}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
