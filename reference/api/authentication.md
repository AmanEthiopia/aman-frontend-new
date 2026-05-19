# Authentication API Documentation

Base path: `/api/v1/auth/`

All responses follow the standard format from `apps.core.responses.standard`:

Success:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "error": null
}
```

Error:
```json
{
  "success": false,
  "data": null,
  "message": "Error message here",
  "error": {
    "field_name": ["Error detail"]
  }
}
```

Notes:
- OTP codes are 6 digits and expire in 15 minutes.
- OTP delivery is sent via Brevo transactional email API.
- JWT is provided by `rest_framework_simplejwt`. Logout blacklists refresh tokens.
- Login requires `is_email_verified = true`.
- Every user has a `role`: `"traveler"` (default) or `"provider"`. Admins return `"admin"`.
- The `role` field is returned in all login and register responses inside the `user` object.

---

## 1) Register

`POST /api/v1/auth/register/`

Create a new user and send an email verification OTP.

Request body:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "confirm_password": "StrongPass123!",
  "first_name": "Fitsum",
  "last_name": "Tesfaye",
  "phone": "+251911000000",
  "role": "traveler"
}
```

Fields:
- `email` — required, must be unique
- `password` / `confirm_password` — required, must match, min 8 chars, passes Django validators
- `first_name` / `last_name` — required
- `phone` — optional, must be unique if provided
- `role` — optional, `"traveler"` (default) or `"provider"`

Success response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Fitsum",
    "last_name": "Tesfaye",
    "is_email_verified": false,
    "role": "traveler"
  },
  "message": "Verification email sent",
  "error": null
}
```

Error responses:
- 400 Validation error (email exists, password mismatch, weak password)

---

## 2) Verify Email

`POST /api/v1/auth/verify-email/`

Verify email using OTP.

Request body:
```json
{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

Validations:
- OTP must exist, match contact, not used, not expired.

Success response (200):
```json
{
  "success": true,
  "data": null,
  "message": "Email verified successfully",
  "error": null
}
```

Error responses:
- 400 Invalid OTP
- 410 OTP expired

---

## 3) Resend Verification OTP

`POST /api/v1/auth/resend-verification/`

Request a new email OTP.

Request body:
```json
{
  "email": "user@example.com"
}
```

Validations:
- User must exist.
- User must not already be verified.
- Old unused OTPs are invalidated.

Success response (200):
```json
{
  "success": true,
  "data": null,
  "message": "Verification email sent",
  "error": null
}
```

Error responses:
- 404 User not found
- 400 Email already verified

---

## 4) Login

`POST /api/v1/auth/login/`

Login using email and password.

Request body:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

Validations:
- Email must exist.
- User must be active.
- Email must be verified.
- Password must be correct.

Success response (200):
```json
{
  "success": true,
  "data": {
    "access_token": "access",
    "refresh_token": "refresh",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "Fitsum",
      "last_name": "Tesfaye",
      "is_email_verified": true,
      "role": "traveler"
    }
  },
  "message": "Login successful",
  "error": null
}
```

Notes:
- `role` will be `"traveler"`, `"provider"`, or `"admin"` depending on the account type.

Error responses:
- 401 Invalid credentials
- 403 Account inactive or email not verified

---

## 5) Refresh Token

`POST /api/v1/auth/refresh-token/`

Exchange refresh token for a new access token.

Request body:
```json
{
  "refresh_token": "refresh_token_here"
}
```

Validations:
- Refresh token must be valid and not blacklisted.

Success response (200):
```json
{
  "success": true,
  "data": {
    "access_token": "new_access"
  },
  "message": "Token refreshed",
  "error": null
}
```

Error responses:
- 401 Invalid token

---

## 6) Logout

`POST /api/v1/auth/logout/`

Blacklist refresh token. Requires auth.

Headers:
- `Authorization: Bearer <access_token>`

Request body:
```json
{
  "refresh_token": "refresh_token_here"
}
```

Success response (200):
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful",
  "error": null
}
```

Error responses:
- 401 Invalid token

---

## 7) Forgot Password

`POST /api/v1/auth/forgot-password/`

Send password reset OTP. Always returns success to avoid user enumeration.

Request body:
```json
{
  "email": "user@example.com"
}
```

Success response (200):
```json
{
  "success": true,
  "data": null,
  "message": "If the email exists, a reset code has been sent",
  "error": null
}
```

---

## 8) Reset Password

`POST /api/v1/auth/reset-password/`

Reset password using OTP.

Request body:
```json
{
  "email": "user@example.com",
  "otp_code": "123456",
  "new_password": "StrongPass123!",
  "confirm_password": "StrongPass123!"
}
```

Validations:
- OTP must exist, match contact, not used, not expired.
- New password and confirm password must match.
- New password must pass Django password validation.

Success response (200):
```json
{
  "success": true,
  "data": null,
  "message": "Password reset successful",
  "error": null
}
```

Error responses:
- 400 Invalid OTP or validation error
- 410 OTP expired

---

## 9) Change Password

`POST /api/v1/auth/change-password/`

Change password for authenticated user.

Headers:
- `Authorization: Bearer <access_token>`

Request body:
```json
{
  "old_password": "OldPass123!",
  "new_password": "StrongPass123!",
  "confirm_password": "StrongPass123!"
}
```

Validations:
- Old password must match.
- New password must be different.
- New password must pass Django password validation.
- New and confirm passwords must match.

Success response (200):
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully",
  "error": null
}
```

Error responses:
- 401 Incorrect old password
- 400 Validation error

---

## 10) Send Phone OTP

`POST /api/v1/auth/phone/send-otp/`

Send OTP to verify a phone number.

Headers:
- `Authorization: Bearer <access_token>`

Request body:
```json
{
  "phone": "+251911000000"
}
```

Validations:
- Phone length must be 7 to 20 characters.

Success response (200):
```json
{
  "success": true,
  "data": null,
  "message": "OTP sent successfully",
  "error": null
}
```

Error responses:
- 400 Invalid phone number

---

## 11) Verify Phone OTP

`POST /api/v1/auth/phone/verify-otp/`

Verify phone OTP and update user phone.

Headers:
- `Authorization: Bearer <access_token>`

Request body:
```json
{
  "phone": "+251911000000",
  "otp_code": "123456"
}
```

Validations:
- OTP must match phone, user, not used, not expired.

Success response (200):
```json
{
  "success": true,
  "data": null,
  "message": "Phone verified successfully",
  "error": null
}
```

Error responses:
- 400 Invalid OTP
- 410 OTP expired

---

## 12) Google OAuth (ID Token)

`POST /api/v1/auth/social/google/`

Authenticate using a Google ID token (JWT). Creates a new account if the email does not exist.

Request body:
```json
{
  "id_token": "google_id_token",
  "role": "traveler"
}
```

Fields:
- `id_token` — Google ID token from Google Identity Services (use `"test"` in local dev to simulate a valid token)
- `role` — optional, `"traveler"` (default) or `"provider"`. Only used when creating a **new** account. Existing accounts keep their current role.

Notes:
- Email is auto-verified (`is_email_verified: true`) for Google sign-ups.
- If the user already exists with that Google email, they are logged in and `role` in the payload is ignored.

Success response (200):
```json
{
  "success": true,
  "data": {
    "access_token": "access",
    "refresh_token": "refresh",
    "user": {
      "id": "uuid",
      "email": "google.user@example.com",
      "first_name": "Google",
      "last_name": "User",
      "is_email_verified": true,
      "role": "traveler"
    }
  },
  "message": "Login successful",
  "error": null
}
```

Error responses:
- 400 Invalid token
