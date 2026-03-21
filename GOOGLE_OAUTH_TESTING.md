# Google OAuth Sign-In Testing Checklist

## Pre-Testing Verification

### Environment Setup
- [ ] **Verify Environment Variable**
  - [ ] Open `.env.local` and confirm `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
  - [ ] Value matches Google Client ID from Cloud Console
  - [ ] No extra whitespace or special characters
  - [ ] Development server restarted after setting env var

- [ ] **Verify Google SDK Script**
  - [ ] Open DevTools Inspector → Elements tab
  - [ ] Search for `accounts.google.com/gsi/client`
  - [ ] Script tag present in `<head>`
  - [ ] Script has `async` and `defer` attributes
  - [ ] Script loaded successfully (Network tab → 200 status)

### Google Cloud Console Verification
- [ ] **OAuth Client Configuration**
  - [ ] Project created: "AMAN Ethiopia"
  - [ ] OAuth 2.0 Client ID created
  - [ ] Client type: "Web application"
  - [ ] Client ID matches `.env.local`

- [ ] **Authorized Origins (localhost)**
  - [ ] `http://localhost:3000` added
  - [ ] `http://localhost` added
  - [ ] `http://127.0.0.1:3000` added
  - [ ] No trailing slashes
  - [ ] Protocol is `http` (not https for local)

- [ ] **OAuth Consent Screen**
  - [ ] User Type: "External"
  - [ ] Scopes configured: openid, email, profile
  - [ ] Support email set
  - [ ] Authorized domains include: localhost
  - [ ] Test users added (if in External mode)

---

## Functional Testing

### Test 1: Page Load and Debug Panel

**Setup:**
- Start development server: `npm run dev`
- Navigate to `http://localhost:3000/login`

**Steps:**
1. [ ] Page loads without errors in console
2. [ ] Check DevTools console for `[v0]` debug messages
3. [ ] Scroll to bottom-right corner
4. [ ] Blue "OAuth Config Debug" panel visible
5. [ ] Click "Show" to expand debug panel

**Expected Results:**
- [ ] All status badges show "✓"
- [ ] Client ID shows partial value (first 20 chars)
- [ ] Current origin shows `http://localhost:3000`
- [ ] Authorized origins list includes localhost variants
- [ ] No errors displayed
- [ ] "Test OAuth Initialization" button clickable

**If Failed:**
- [ ] Check if running in development mode (not production)
- [ ] Verify env var is set correctly
- [ ] Check browser console for error messages

---

### Test 2: Google Sign-In Button

**Setup:**
- Stay on login page
- Debug panel expanded

**Steps:**
1. [ ] Locate "Sign in with Google" button
2. [ ] Button is visible and clickable
3. [ ] Click button
4. [ ] Click "Test OAuth Initialization" in debug panel

**Expected Results:**
- [ ] "Testing..." state shows during initialization
- [ ] Green success alert appears in debug panel
- [ ] Message: "OAuth client initialized successfully"
- [ ] Client ID shown (partial)
- [ ] No error messages in console

**If Failed:**
- [ ] Check if Google SDK loaded (SDK badge status)
- [ ] Verify Client ID format is correct
- [ ] Clear browser cache and retry

---

### Test 3: Google Consent Screen

**Setup:**
- Debug panel shows all ✓
- OAuth initialization test passed

**Steps:**
1. [ ] Click "Sign in with Google" button
2. [ ] Observe browser behavior
3. [ ] Google login popup or redirect appears
4. [ ] Consent dialog shows requested scopes
5. [ ] Scopes include: email, profile, openid

**Expected Results:**
- [ ] Google login page loads (or popup opens)
- [ ] User sees: "AMAN Ethiopia" app name
- [ ] Requested permissions shown:
  - [ ] See your email address
  - [ ] See your personal info
  - [ ] Verify your identity
- [ ] User can enter Google credentials
- [ ] "Continue" button functional

**If Failed:**
- [ ] Check OAuth Consent Screen in Google Cloud Console
- [ ] Verify app name is set to "AMAN Ethiopia"
- [ ] Confirm scopes are configured
- [ ] Wait 5-10 minutes for Google to propagate changes

---

### Test 4: Successful Authentication Flow

**Setup:**
- Google consent screen loaded
- Have a valid Google account ready

**Steps:**
1. [ ] Enter Google email address
2. [ ] Enter Google password
3. [ ] Review requested permissions
4. [ ] Click "Continue" or accept permissions
5. [ ] Monitor network requests in DevTools

**Expected Results:**
- [ ] Token request succeeds (Network → check for OAuth token call)
- [ ] Console shows: `[v0] Token sent to backend: ...`
- [ ] Backend responds with access token
- [ ] Console shows: `[v0] Backend response: {access_token, refresh_token, ...}`
- [ ] Page redirects to `/home` (traveler) or `/provider` (provider)
- [ ] Dashboard loads with user information

**If Failed:**
- [ ] Check Network tab for failed requests
- [ ] Look for CORS errors
- [ ] Verify backend API is running
- [ ] Check Console for error messages

---

### Test 5: User Profile Display

**Setup:**
- Logged in successfully
- On dashboard page

**Steps:**
1. [ ] Verify user name displayed correctly
2. [ ] Verify user email shown
3. [ ] Check user role (Traveler or Provider)
4. [ ] Navigate to settings page
5. [ ] Verify profile information

**Expected Results:**
- [ ] User name matches Google account
- [ ] Email matches Google account
- [ ] Role correctly assigned based on registration choice
- [ ] Settings page shows all user info
- [ ] Profile photo/avatar loads (if available)
- [ ] Edit profile functionality works

---

### Test 6: Registration Flow

**Setup:**
- Navigate to `http://localhost:3000/register`

**Steps:**
1. [ ] Click "Continue with Google" button
2. [ ] Select role: "Traveler"
3. [ ] Complete Google authentication
4. [ ] Observe redirect

**Expected Results:**
- [ ] Google auth flow same as login
- [ ] After consent, redirects to `/home`
- [ ] New user account created in system
- [ ] User profile shows "Traveler" role
- [ ] Can access traveler dashboard

**Repeat with Provider Role:**
1. [ ] Go back to `/register`
2. [ ] Click "Continue with Google"
3. [ ] Select role: "Provider"
4. [ ] Complete Google authentication
5. [ ] Should redirect to `/provider`

**Expected Results:**
- [ ] After auth, redirects to `/provider`
- [ ] User profile shows "Provider" role
- [ ] Provider dashboard accessible

---

### Test 7: Error Handling

**Test 7a: Missing Client ID**
1. [ ] Remove `NEXT_PUBLIC_GOOGLE_CLIENT_ID` from `.env.local`
2. [ ] Restart dev server
3. [ ] Open login page
4. [ ] Click "Sign in with Google"

**Expected Results:**
- [ ] Error message: "Google Sign-In is not configured"
- [ ] Debug panel shows error
- [ ] Console shows detailed error

**Test 7b: Invalid Client ID**
1. [ ] Change `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `invalid-id`
2. [ ] Refresh page
3. [ ] Click "Sign in with Google"

**Expected Results:**
- [ ] Debug panel shows format error
- [ ] Console shows validation error
- [ ] Error message provides fix suggestion

**Test 7c: User Cancels Consent**
1. [ ] Click "Sign in with Google"
2. [ ] At Google consent screen, click "Cancel"

**Expected Results:**
- [ ] Gracefully handles cancellation
- [ ] Returns to login page
- [ ] Shows error message or warning
- [ ] Can retry sign in

**Test 7d: Network Error**
1. [ ] Open DevTools → Network tab
2. [ ] Set throttling to "Offline"
3. [ ] Click "Sign in with Google"

**Expected Results:**
- [ ] Shows network error
- [ ] User can turn throttling back on
- [ ] Can retry after reconnecting

---

### Test 8: Cross-Browser Testing

**Test on Chrome:**
- [ ] Sign in with Google works
- [ ] All features functional
- [ ] No console errors

**Test on Firefox:**
- [ ] Sign in with Google works
- [ ] Debug panel displays correctly
- [ ] OAuth flow completes

**Test on Safari:**
- [ ] Sign in with Google works
- [ ] Cookies properly set
- [ ] Session persists

**Test on Mobile Chrome:**
- [ ] Button clickable on touch
- [ ] OAuth popup/redirect works
- [ ] Dashboard responsive

**Test on Mobile Safari:**
- [ ] OAuth flow completes
- [ ] No layout issues
- [ ] Touch interactions work

---

### Test 9: Session Management

**Setup:**
- Logged in with Google account

**Steps:**
1. [ ] Navigate between pages
2. [ ] Verify session persists
3. [ ] Refresh page
4. [ ] Check user still logged in
5. [ ] Click logout
6. [ ] Verify redirected to login
7. [ ] Verify user logged out
8. [ ] Try accessing protected page

**Expected Results:**
- [ ] Session maintained across navigation
- [ ] Refresh doesn't log out user
- [ ] Logout clears session
- [ ] Protected pages redirect to login
- [ ] Can log back in with different account

---

### Test 10: Token Refresh

**Setup:**
- Logged in with Google account

**Steps:**
1. [ ] Wait for access token to expire (if possible)
2. [ ] Make an API request
3. [ ] Observe refresh token usage

**Expected Results:**
- [ ] Automatically refreshes token if expired
- [ ] User stays logged in
- [ ] No interruption to user experience
- [ ] New token received in response

---

## Debugging Checklist

### If Sign-In Fails:

1. [ ] **Check DevTools Console**
   - [ ] Search for `[v0]` debug messages
   - [ ] Look for error messages
   - [ ] Check for CORS errors
   - [ ] Look for network failures

2. [ ] **Check Network Tab**
   - [ ] Look for failed requests
   - [ ] Check response status codes
   - [ ] Verify OAuth endpoint is hit
   - [ ] Check backend response

3. [ ] **Check Debug Panel**
   - [ ] Run "Test OAuth Initialization"
   - [ ] Check all status badges
   - [ ] Review error messages
   - [ ] Follow suggested fixes

4. [ ] **Check Google Cloud Console**
   - [ ] Verify Client ID correct
   - [ ] Check authorized origins
   - [ ] Verify OAuth consent screen
   - [ ] Check API limits/quotas

---

## Security Testing

- [ ] **Verify HTTPS in Production**
  - [ ] Authorized origins use `https://`
  - [ ] Secure cookie flag set
  - [ ] No credentials in localStorage

- [ ] **Test Token Security**
  - [ ] Tokens not exposed in URL
  - [ ] Tokens only in HTTP-only cookies
  - [ ] Refresh tokens stored securely
  - [ ] No tokens in local storage

- [ ] **Test CSRF Protection**
  - [ ] State parameter implemented
  - [ ] CSRF tokens validated
  - [ ] No direct cookie access

---

## Post-Testing Verification

- [ ] All tests passed
- [ ] No console errors in development
- [ ] Debug panel shows all ✓ in development
- [ ] Works across all browsers
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Ready for production deployment

---

## Troubleshooting Quick Reference

| Error | Solution |
|-------|----------|
| "Google is not defined" | Verify Google SDK script loaded |
| "Invalid Client ID" | Copy exact ID from Cloud Console |
| CORS error | Add origin to OAuth authorized origins |
| "Origin mismatch" | Check domain in authorized origins |
| Blank consent screen | Wait 5-10 min for Google propagation |
| Token request fails | Check backend API is running |
| Redirect loop | Verify redirect URL in auth context |
| Session not persisting | Check cookies enabled in browser |

---

## Support Resources

- **Google OAuth Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Google Sign-In JS Docs**: https://developers.google.com/identity/gsi/web
- **AMAN Setup Guide**: See `GOOGLE_OAUTH_SETUP.md`
- **Debug Validator**: Use `GoogleOAuthDebugPanel` component in development
