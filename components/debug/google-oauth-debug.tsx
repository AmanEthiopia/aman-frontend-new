"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  validateGoogleOAuthConfig,
  logValidationResults,
  getFixSuggestions,
  getAuthorizedOriginsForEnvironment,
  testOAuthInitialization,
  isGoogleSdkLoaded,
} from "@/lib/utils/google-oauth-validator"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

/**
 * Google OAuth Debug Component
 * Display configuration status and troubleshooting info
 * Only visible in development mode
 */
export function GoogleOAuthDebugPanel() {
  const [validationResult, setValidationResult] = useState<any>(null)
  const [initializationResult, setInitializationResult] = useState<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  useEffect(() => {
    // Run validation on component mount
    const result = validateGoogleOAuthConfig()
    setValidationResult(result)
    logValidationResults(result)
  }, [])

  const runTests = async () => {
    setIsLoading(true)
    try {
      const result = await testOAuthInitialization()
      setInitializationResult(result)
    } finally {
      setIsLoading(false)
    }
  }

  if (!validationResult) {
    return null
  }

  const suggestions = getFixSuggestions(validationResult)
  const origins = getAuthorizedOriginsForEnvironment()
  const sdkLoaded = isGoogleSdkLoaded()

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <CardTitle className="text-sm">OAuth Config Debug</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide" : "Show"}
            </Button>
          </div>
          <CardDescription className="text-xs mt-1">
            {validationResult.isValid ? "✅ Configuration Valid" : "⚠️ Issues Detected"}
          </CardDescription>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4 text-xs">
            {/* Status Badges */}
            <div className="space-y-2">
              <p className="font-semibold text-blue-900">Status:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={validationResult.clientIdSet ? "default" : "destructive"}>
                  Client ID: {validationResult.clientIdSet ? "✓" : "✗"}
                </Badge>
                <Badge variant={validationResult.clientIdFormat ? "default" : "destructive"}>
                  Format: {validationResult.clientIdFormat ? "✓" : "✗"}
                </Badge>
                <Badge variant={sdkLoaded ? "default" : "destructive"}>
                  SDK: {sdkLoaded ? "✓" : "✗"}
                </Badge>
              </div>
            </div>

            {/* Environment Info */}
            <div className="space-y-2">
              <p className="font-semibold text-blue-900">Environment:</p>
              <div className="bg-white p-2 rounded border border-blue-200 space-y-1">
                <div>
                  <span className="font-mono text-gray-600">Client ID: </span>
                  <span className="font-mono text-gray-900">
                    {validationResult.debugInfo.clientIdValue || "NOT SET"}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-gray-600">Current Origin: </span>
                  <span className="font-mono text-gray-900 break-all">
                    {validationResult.debugInfo.location?.origin || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Authorized Origins */}
            <div className="space-y-2">
              <p className="font-semibold text-blue-900">Add to Google Console:</p>
              <div className="bg-white p-2 rounded border border-blue-200 max-h-24 overflow-y-auto">
                {origins.map((origin, idx) => (
                  <div key={idx} className="font-mono text-xs text-gray-700 break-all">
                    {origin}
                  </div>
                ))}
              </div>
            </div>

            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-xs text-red-700">
                  <div className="font-semibold mb-1">Errors:</div>
                  {validationResult.errors.map((error: string, idx: number) => (
                    <div key={idx} className="mb-1">• {error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-xs text-yellow-700">
                  <div className="font-semibold mb-1">Fix Suggestions:</div>
                  {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="mb-1">{suggestion}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Test Button */}
            <Button
              onClick={runTests}
              disabled={isLoading}
              className="w-full"
              size="sm"
              variant="outline"
            >
              {isLoading ? "Testing..." : "Test OAuth Initialization"}
            </Button>

            {/* Test Results */}
            {initializationResult && (
              <Alert className={initializationResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <CheckCircle className={`h-4 w-4 ${initializationResult.success ? "text-green-600" : "text-red-600"}`} />
                <AlertDescription className={`text-xs ${initializationResult.success ? "text-green-700" : "text-red-700"}`}>
                  {initializationResult.message}
                  {initializationResult.clientId && (
                    <div className="mt-1 font-mono">{initializationResult.clientId}</div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default GoogleOAuthDebugPanel
