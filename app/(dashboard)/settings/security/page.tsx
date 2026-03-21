"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, Smartphone, Key, AlertTriangle, Check, Copy, Monitor, Tablet, Eye, EyeOff, Loader2, X, LogOut } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import * as authAPI from "@/lib/api/auth"

export default function SecuritySettingsPage() {
  const { userProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  
  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [showSetup2FA, setShowSetup2FA] = useState(false)
  const [showDisable2FA, setShowDisable2FA] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")
  const [disablePassword, setDisablePassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Sessions State
  const [sessions, setSessions] = useState<authAPI.ActiveSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [isRevokingSession, setIsRevokingSession] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadSecurityData() {
      setIsLoading(true)
      try {
        // Load 2FA status
        const status = await authAPI.get2FAStatus()
        setIs2FAEnabled(status.is_enabled)
        
        // Load active sessions
        setIsLoadingSessions(true)
        const sessionsData = await authAPI.getActiveSessions()
        setSessions(sessionsData)
      } catch (error) {
        console.error("[v0] Failed to load security data:", error)
        // Set defaults if API fails
        setIs2FAEnabled(false)
        setSessions([])
      } finally {
        setIsLoading(false)
        setIsLoadingSessions(false)
      }
    }
    
    loadSecurityData()
  }, [])
  
  // Start 2FA setup
  const handleSetup2FA = async () => {
    setIsSubmitting(true)
    try {
      const response = await authAPI.setup2FA()
      setQrCodeUrl(response.qr_code_url)
      setSecret(response.secret)
      setShowSetup2FA(true)
    } catch (error: any) {
      toast.error(error.message || "Failed to start 2FA setup")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Complete 2FA setup
  const handleEnable2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code")
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await authAPI.enable2FA(verificationCode)
      setBackupCodes(response.backup_codes)
      setIs2FAEnabled(true)
      setShowSetup2FA(false)
      setShowBackupCodes(true)
      setVerificationCode("")
      toast.success("Two-factor authentication enabled successfully")
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Disable 2FA
  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast.error("Please enter your password")
      return
    }
    
    setIsSubmitting(true)
    try {
      await authAPI.disable2FA(disablePassword)
      setIs2FAEnabled(false)
      setShowDisable2FA(false)
      setDisablePassword("")
      toast.success("Two-factor authentication disabled")
    } catch (error: any) {
      toast.error(error.message || "Invalid password")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Regenerate backup codes
  const handleRegenerateBackupCodes = async () => {
    setIsSubmitting(true)
    try {
      const response = await authAPI.regenerateBackupCodes(disablePassword)
      setBackupCodes(response.backup_codes)
      setShowBackupCodes(true)
      toast.success("New backup codes generated")
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate backup codes")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    setIsRevokingSession(sessionId)
    try {
      await authAPI.revokeSession(sessionId)
      setSessions(sessions.filter(s => s.id !== sessionId))
      toast.success("Session revoked successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke session")
    } finally {
      setIsRevokingSession(null)
    }
  }
  
  // Revoke all other sessions
  const handleRevokeAllSessions = async () => {
    setIsSubmitting(true)
    try {
      await authAPI.revokeAllOtherSessions()
      setSessions(sessions.filter(s => s.is_current))
      toast.success("All other sessions have been logged out")
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke sessions")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    toast.success("Backup codes copied to clipboard")
  }
  
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />
      case "tablet":
        return <Tablet className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Security & Privacy</h1>
          <p className="text-muted-foreground">Manage your account security settings</p>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a verification code in addition to your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Authenticator App</Label>
                <p className="text-sm text-muted-foreground">
                  Use an app like Google Authenticator or Authy
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {is2FAEnabled && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Enabled
                </Badge>
              )}
              <Switch
                checked={is2FAEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleSetup2FA()
                  } else {
                    setShowDisable2FA(true)
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {is2FAEnabled && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>Backup Codes</Label>
                    <p className="text-sm text-muted-foreground">
                      Use these codes if you lose access to your authenticator
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowBackupCodes(true)}>
                  View Codes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Password
          </CardTitle>
          <CardDescription>
            Keep your account secure with a strong password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings/change-password">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage devices where you are currently logged in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length > 0 ? (
            <>
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.device_type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.device_name}</span>
                        {session.is_current && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.browser} {session.location && `- ${session.location}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {new Date(session.last_active).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!session.is_current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={isRevokingSession === session.id}
                    >
                      {isRevokingSession === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </>
          ) : (
            <p className="py-4 text-center text-muted-foreground">No active sessions found</p>
          )}
        </CardContent>
        {sessions.length > 1 && (
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleRevokeAllSessions}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Log Out All Other Devices
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Security Tips */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Security Tips</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>Enable two-factor authentication for enhanced security</li>
            <li>Use a unique, strong password that you do not use elsewhere</li>
            <li>Regularly review your active sessions</li>
            <li>Never share your password or verification codes</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* 2FA Setup Dialog */}
      <Dialog open={showSetup2FA} onOpenChange={setShowSetup2FA}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the verification code.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center rounded-lg border bg-white p-4">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="2FA QR Code" className="h-48 w-48" />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </div>
            
            {/* Manual entry secret */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Cannot scan? Enter this code manually:
              </Label>
              <div className="flex items-center gap-2 rounded-md bg-muted p-2 font-mono text-sm">
                <span className="flex-1 break-all">{secret}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(secret)
                    toast.success("Secret copied to clipboard")
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Verification code input */}
            <div className="space-y-2">
              <Label>Enter verification code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetup2FA(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnable2FA} disabled={isSubmitting || verificationCode.length !== 6}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FA} onOpenChange={setShowDisable2FA}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to disable two-factor authentication. This will make your account less secure.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling 2FA reduces the security of your account. We recommend keeping it enabled.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisable2FA(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisable2FA} disabled={isSubmitting || !disablePassword}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Save these backup codes in a secure location. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Store these codes safely. If you lose access to your authenticator app, you can use these codes to sign in.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted p-4 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="rounded bg-background px-2 py-1">
                  {code}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={copyBackupCodes}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Codes
            </Button>
            <Button onClick={() => setShowBackupCodes(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
