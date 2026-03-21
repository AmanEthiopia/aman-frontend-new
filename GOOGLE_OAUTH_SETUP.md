# Google OAuth 2.0 Configuration Guide for AMAN Frontend

## Overview
This guide provides step-by-step instructions for setting up, troubleshooting, and testing Google Sign-In integration in the AMAN Ethiopia frontend application.

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Google Cloud Console Configuration](#google-cloud-console-configuration)
3. [OAuth Client Configuration](#oauth-client-configuration)
4. [Frontend Implementation](#frontend-implementation)
5. [Troubleshooting](#troubleshooting)
6. [Testing & Verification](#testing--verification)
7. [Security Best Practices](#security-best-practices)

---

## Environment Setup

### Step 1: Set Environment Variables

The frontend requires the Google OAuth Client ID to be set as an environment variable:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

**Important:** This variable must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

### Step 2: Verify Environment Variable is Loaded

In development, create a `.env.local` file in the project root:

```env
# .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=860009345086-f0iqbtvo37vhj2rqi42pogsc6fei5a4v.apps.googleusercontent.com
```

In production (Vercel), add the variable through:
- Vercel Dashboard → Project Settings → Environment Variables
- Or via Vercel CLI: `vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID`

**Testing Environment Variable:**
Open browser DevTools console and run:
```javascript
console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
```
If undefined, the environment variable is not loaded correctly.

---

## Google Cloud Console Configuration

### Step 1: Create or Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `AMAN Ethiopia`
5. Click "CREATE"

### Step 2: Enable Required APIs

1. In the Google Cloud Console, navigate to "APIs & Services" → "Library"
2. Search for and enable the following APIs:
   - **Google+ API** (for user identity)
   - **People API** (for user profile information)
   - **OAuth 2.0 Playground** (for testing)

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select **User Type**: "External" (for external testers)
3. Fill in the following:
   - **App name**: AMAN Ethiopia
   - **User support email**: support@aman.yichalal.ai
   - **Authorized domains**: 
     - localhost (for development)
     - yichalal.ai (for production)
     - *.vercel.app (for Vercel deployments)

4. Under "Scopes for Google APIs", add these required scopes:
   - `openid` - For identity verification
   - `email` - To access user email
   - `profile` - To access user profile information

5. Add test users if in External mode:
   - Your email address
   - Any test email addresses

**Important for Development:**
- For local development (localhost), you don't need to add test users
- For staging/production, add all team member emails as test users

---

## OAuth Client Configuration

### Step 1: Create OAuth 2.0 Client ID

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Fill in the following:
   - **Name**: AMAN Frontend

### Step 2: Configure Authorized URIs

For development:
```
Authorized JavaScript origins:
- http://localhost:3000
- http://localhost

Authorized redirect URIs:
- http://localhost:3000
- http://localhost/api/auth/callback
```

For staging/production:
```
Authorized JavaScript origins:
- https://app.aman.yichalal.ai
- https://aman-staging.vercel.app

Authorized redirect URIs:
- https://app.aman.yichalal.ai
- https://app.aman.yichalal.ai/api/auth/callback
- https://aman-staging.vercel.app
- https://aman-staging.vercel.app/api/auth/callback
```

### Step 3: Download and Store Client Credentials

1. After creating the client, click the download icon (📥)
2. Save the JSON file securely
3. Store the **Client ID** and **Client Secret** (if needed for backend)
4. **NEVER** commit credentials to version control

---

## Frontend Implementation

### Step 1: Load Google Sign-In Library

The Google Sign-In library is loaded via CDN in the application layout:

```html
<script 
  src="https://accounts.google.com/gsi/client" 
  async 
  defer
></script>
```

### Step 2: Implement OAuth Handler

The frontend uses Google's OAuth 2.0 Token Client for authentication:

```typescript
const handleGoogleSignIn = async () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  
  if (!clientId) {
    setError("Google Sign-In is not configured")
    return
  }

  const google = (window as any).google
  const client = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: "openid email profile",
    callback: handleTokenResponse,
  })

  client.requestAccessToken()
}
```

### Step 3: Handle Token Response

The token response is sent to the backend OAuth endpoint:

```typescript
const handleTokenResponse = async (response: any) => {
  try {
    const result = await authAPI.registerWithGoogle(
      response.access_token,
      accountType
    )
    // Handle successful authentication
  } catch (error) {
    // Handle authentication error
  }
}
```

---

## Troubleshooting

### Issue 1: "Google Sign-In is not configured"

**Cause:** Environment variable `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is not set

**Solutions:**
1. Verify the environment variable is loaded:
   ```bash
   echo $NEXT_PUBLIC_GOOGLE_CLIENT_ID
   ```

2. If using `.env.local`, restart the development server:
   ```bash
   npm run dev
   ```

3. In Vercel, redeploy after setting environment variables:
   ```bash
   vercel --prod
   ```

4. Check for typos in the environment variable name

### Issue 2: "Google is not defined" or "Unexpected window reference"

**Cause:** Google SDK script not loaded or executed on server-side

**Solutions:**
1. Verify the Google SDK script is loaded in the layout:
   ```html
   <script src="https://accounts.google.com/gsi/client" async defer></script>
   ```

2. Ensure the OAuth handler is only called client-side:
   ```typescript
   if (typeof window === "undefined") return
   const google = (window as any).google
   ```

3. Check browser console for CSP (Content Security Policy) errors

### Issue 3: CORS or "Origin mismatch" Error

**Cause:** Domain not configured in Google Cloud Console

**Solutions:**
1. Verify JavaScript origin is correct:
   - Development: `http://localhost:3000`
   - Production: `https://app.aman.yichalal.ai`

2. Check for trailing slashes or incorrect protocol (http vs https)

3. Update Google Console with all valid domains:
   ```
   - localhost
   - 127.0.0.1
   - Your-app.vercel.app
   - Your-custom-domain.com
   ```

4. Wait 5-10 minutes for Google Cloud configuration to propagate

### Issue 4: "Invalid Client ID" Error

**Cause:** Incorrect or expired Client ID

**Solutions:**
1. Verify the Client ID format (should end with `.apps.googleusercontent.com`)
2. Copy the exact Client ID from Google Cloud Console
3. Check if the Client ID has been deleted or regenerated
4. Ensure no whitespace or special characters in the environment variable

### Issue 5: Token Request Shows "access_denied"

**Cause:** Scopes not authorized or user cancelled

**Solutions:**
1. Verify scopes are correctly configured:
   ```typescript
   scope: "openid email profile"
   ```

2. Ensure user authorized the scopes when prompted

3. Check OAuth consent screen configuration in Google Cloud Console

4. Clear browser cookies and try again

### Issue 6: Redirect Loop After Authentication

**Cause:** Backend OAuth endpoint not handling token correctly

**Solutions:**
1. Verify backend receives the token:
   ```typescript
   console.log("[v0] Token sent to backend:", response.access_token)
   ```

2. Check backend API response:
   ```typescript
   console.log("[v0] Backend response:", result)
   ```

3. Ensure redirect URL is correct in auth context

### Issue 7: "Invalid redirect URI" in OAuth Consent Screen

**Cause:** Redirect URI not configured in Google Cloud Console

**Solutions:**
1. Add the following redirect URIs:
   ```
   http://localhost/api/auth/callback
   http://localhost:3000/api/auth/callback
   https://app.aman.yichalal.ai/api/auth/callback
   ```

2. Note: Include protocol (http/https) and port

---

## Testing & Verification

### Checklist: Pre-Deployment Testing

- [ ] **Environment Variable Set**
  - Run: `echo $NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - Should output: `860009345086-f0iqbtvo37vhj2rqi42pogsc6fei5a4v.apps.googleusercontent.com`

- [ ] **Google SDK Loaded**
  - Open DevTools → Network tab
  - Filter: `accounts.google.com/gsi/client`
  - Should see successful (200) response

- [ ] **Token Client Initialized**
  - Open DevTools → Console
  - Run: `console.log(window.google?.accounts?.oauth2)`
  - Should show an object (not undefined)

- [ ] **OAuth Consent Screen**
  - Sign in → Should see consent dialog
  - Verify scopes requested: openid, email, profile

- [ ] **Token Response Received**
  - After consent, DevTools → Console
  - Should see: `[v0] Token sent to backend: ...`

- [ ] **Backend Authentication**
  - Should see: `[v0] Backend response: {access_token, refresh_token, ...}`

- [ ] **Redirect to Dashboard**
  - After successful auth, redirected to `/home` (traveler) or `/provider` (provider)

### Manual Testing Steps

1. **Test Sign-In Flow:**
   ```bash
   npm run dev
   # Navigate to http://localhost:3000/login
   # Click "Sign in with Google"
   # Complete OAuth flow
   # Verify redirect to dashboard
   ```

2. **Test Registration Flow:**
   ```bash
   # Navigate to http://localhost:3000/register
   # Click "Continue with Google"
   # Select role (Traveler or Provider)
   # Complete OAuth flow
   # Verify redirect to appropriate dashboard
   ```

3. **Test with Different Browsers:**
   - Chrome
   - Firefox
   - Safari
   - Mobile Chrome/Safari

4. **Test Error Scenarios:**
   - Remove environment variable (should show error)
   - Use wrong Client ID (should show CORS error)
   - Cancel OAuth consent (should handle gracefully)

### Automated Testing

Create a test file for OAuth configuration validation:

```typescript
// __tests__/google-oauth.test.ts
describe("Google OAuth Configuration", () => {
  it("should have NEXT_PUBLIC_GOOGLE_CLIENT_ID set", () => {
    expect(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID).toBeDefined()
  })

  it("should have valid Client ID format", () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    expect(clientId).toMatch(/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/)
  })
})
```

---

## Security Best Practices

### 1. Never Expose Client Secret

- Only the **Client ID** should be in frontend code
- Client Secret must stay on backend only
- Use `NEXT_PUBLIC_` prefix only for Client ID

### 2. Validate Tokens on Backend

- Never trust tokens solely on frontend
- Always verify JWT signature on backend
- Check token expiration and issuer

### 3. Use HTTPS in Production

- Google OAuth requires HTTPS for production domains
- Update authorized origins with https protocol

### 4. Implement CSRF Protection

- Use state parameter to prevent CSRF attacks
- Verify state matches before exchanging token

### 5. Rate Limiting

- Implement rate limiting on OAuth endpoints
- Prevent brute force token requests

### 6. Secure Cookie Storage

- Store tokens in HTTP-only cookies
- Set Secure flag for production
- Set SameSite=Strict

### 7. Regular Security Audits

- Review authorized domains quarterly
- Rotate credentials periodically
- Monitor authentication logs for suspicious activity

---

## Debugging with Console Logs

Enable detailed logging by looking for `[v0]` prefixed console messages:

```javascript
// Development: Open DevTools Console

// Check environment variable
console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

// Check Google SDK
console.log(window.google?.accounts?.oauth2)

// Monitor OAuth flow
// Look for: [v0] Token sent to backend
// Look for: [v0] Backend response
// Look for: [v0] Redirect to dashboard
```

---

## FAQ

**Q: Can I use the same Client ID for multiple environments?**
A: Yes, but you must add all authorized origins (localhost, staging, production) to the OAuth consent screen.

**Q: What's the difference between access_token and id_token?**
A: access_token is for API requests, id_token is for user identity verification.

**Q: Do I need to set up a backend OAuth endpoint?**
A: Yes, the backend must exchange the token for user session/JWT.

**Q: Can users sign in with multiple Google accounts?**
A: Yes, they can choose which account to use each time.

**Q: How long does Google take to update consent screen?**
A: Usually 5-10 minutes, sometimes up to 24 hours.

---

## Support

For issues not covered here:
1. Check [Google OAuth 2.0 Official Docs](https://developers.google.com/identity/protocols/oauth2)
2. Review [Google Sign-In JS Library Docs](https://developers.google.com/identity/gsi/web)
3. Contact: support@aman.yichalal.ai
