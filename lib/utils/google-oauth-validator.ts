/**
 * Google OAuth Configuration Validator
 * Validates environment setup and provides debugging information
 */

export interface OAuthValidationResult {
  isValid: boolean
  clientIdSet: boolean
  clientIdFormat: boolean
  googleSdkLoaded: boolean
  errors: string[]
  warnings: string[]
  debugInfo: Record<string, any>
}

/**
 * Validate Google OAuth Client ID format
 */
export function validateClientIdFormat(clientId: string): boolean {
  if (!clientId) return false
  // Format: digits-alphanumeric.apps.googleusercontent.com
  const pattern = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/i
  return pattern.test(clientId)
}

/**
 * Check if Google SDK is loaded in the browser
 */
export function isGoogleSdkLoaded(): boolean {
  if (typeof window === "undefined") return false
  return !!(window as any).google?.accounts?.oauth2
}

/**
 * Get comprehensive validation result
 */
export function validateGoogleOAuthConfig(): OAuthValidationResult {
  const result: OAuthValidationResult = {
    isValid: true,
    clientIdSet: false,
    clientIdFormat: false,
    googleSdkLoaded: false,
    errors: [],
    warnings: [],
    debugInfo: {},
  }

  // Check client ID environment variable
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  result.debugInfo.clientIdEnv = clientId ? "SET" : "NOT_SET"
  result.debugInfo.clientIdValue = clientId ? `${clientId.substring(0, 20)}...` : null

  if (!clientId) {
    result.errors.push(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is not set. " +
      "Add it to .env.local or Vercel environment variables."
    )
    result.isValid = false
    result.clientIdSet = false
  } else {
    result.clientIdSet = true

    // Validate client ID format
    if (validateClientIdFormat(clientId)) {
      result.clientIdFormat = true
    } else {
      result.errors.push(
        `Invalid Client ID format: ${clientId}. ` +
        "Should be: digits-alphanumeric.apps.googleusercontent.com"
      )
      result.isValid = false
      result.clientIdFormat = false
    }
  }

  // Check if running in browser
  if (typeof window === "undefined") {
    result.warnings.push("Google OAuth validation running on server-side. SDK check skipped.")
  } else {
    // Check Google SDK loaded
    result.googleSdkLoaded = isGoogleSdkLoaded()
    result.debugInfo.googleSdkStatus = result.googleSdkLoaded ? "LOADED" : "NOT_LOADED"

    if (!result.googleSdkLoaded) {
      result.errors.push(
        "Google Sign-In SDK is not loaded. " +
        "Ensure this script is in your layout: " +
        "<script src=\"https://accounts.google.com/gsi/client\" async defer></script>"
      )
      result.isValid = false
    }

    // Additional debug info
    result.debugInfo.userAgent = navigator.userAgent
    result.debugInfo.location = {
      origin: window.location.origin,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
    }
  }

  return result
}

/**
 * Log validation results for debugging
 */
export function logValidationResults(result: OAuthValidationResult): void {
  console.group("[v0] Google OAuth Configuration Validation")

  if (result.isValid) {
    console.log("✅ Configuration is valid")
  } else {
    console.error("❌ Configuration has errors")
  }

  if (result.errors.length > 0) {
    console.group("Errors:")
    result.errors.forEach((error) => console.error(`  • ${error}`))
    console.groupEnd()
  }

  if (result.warnings.length > 0) {
    console.group("Warnings:")
    result.warnings.forEach((warning) => console.warn(`  • ${warning}`))
    console.groupEnd()
  }

  console.group("Debug Info:")
  Object.entries(result.debugInfo).forEach(([key, value]) => {
    if (typeof value === "object") {
      console.log(`  ${key}:`, value)
    } else {
      console.log(`  ${key}: ${value}`)
    }
  })
  console.groupEnd()

  console.groupEnd()
}

/**
 * Quick fix suggestions based on validation result
 */
export function getFixSuggestions(result: OAuthValidationResult): string[] {
  const suggestions: string[] = []

  if (!result.clientIdSet) {
    suggestions.push(
      "1. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file"
    )
    suggestions.push(
      "2. Restart the development server: npm run dev"
    )
  }

  if (!result.clientIdFormat && result.clientIdSet) {
    suggestions.push(
      "1. Copy the Client ID exactly from Google Cloud Console"
    )
    suggestions.push(
      "2. Ensure it ends with: .apps.googleusercontent.com"
    )
  }

  if (!result.googleSdkLoaded) {
    suggestions.push(
      "1. Add Google SDK script to your app layout (app/layout.tsx):"
    )
    suggestions.push(
      '2. <script src="https://accounts.google.com/gsi/client" async defer></script>'
    )
    suggestions.push(
      "3. Restart the application"
    )
  }

  return suggestions
}

/**
 * Check authorized origins in Google Cloud Console
 */
export function getAuthorizedOriginsForEnvironment(): string[] {
  if (typeof window === "undefined") {
    return [
      "http://localhost:3000",
      "http://localhost",
      "http://127.0.0.1:3000",
    ]
  }

  const { origin, hostname } = window.location

  // Add all relevant origins
  const origins = new Set([origin])

  // Add localhost variants for development
  if (hostname.includes("localhost") || hostname === "127.0.0.1") {
    origins.add("http://localhost:3000")
    origins.add("http://localhost")
    origins.add("http://127.0.0.1:3000")
  }

  // Add Vercel preview URLs
  if (hostname.includes(".vercel.app")) {
    origins.add("https://" + hostname)
  }

  return Array.from(origins)
}

/**
 * Test OAuth initialization
 */
export async function testOAuthInitialization(): Promise<{
  success: boolean
  message: string
  clientId?: string
}> {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      return {
        success: false,
        message: "Client ID not configured",
      }
    }

    if (typeof window === "undefined" || !(window as any).google) {
      return {
        success: false,
        message: "Google SDK not available",
      }
    }

    const google = (window as any).google
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: () => {
        // Callback for testing
      },
    })

    if (!client) {
      return {
        success: false,
        message: "Failed to initialize OAuth client",
      }
    }

    console.log("[v0] OAuth client initialized successfully", {
      clientId: clientId.substring(0, 20) + "...",
    })

    return {
      success: true,
      message: "OAuth client initialized successfully",
      clientId: clientId.substring(0, 20) + "...",
    }
  } catch (error) {
    console.error("[v0] OAuth initialization failed:", error)
    return {
      success: false,
      message: `OAuth initialization failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
