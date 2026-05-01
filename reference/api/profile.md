# Profile API

Base path: `/api/v1/users/`
Authentication: Required (JWT)

Standard response format:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Media URLs:
- Image fields like `profile_photo` are returned as file URLs under `/media/`.
- Example: `/media/profiles/uuid_avatar.jpg`

Headers:
- `Authorization: Bearer <access_token>`

---

## 1) Get My Profile

`GET /api/v1/users/profile/me/`

Success response (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "Fitsum",
      "last_name": "Tesfaye",
      "is_email_verified": true,
      "is_phone_verified": false,
      "phone": null
    },
    "profile": {
      "bio": "Traveler",
      "profile_photo": "/media/profiles/uuid_avatar.jpg",
      "date_of_birth": null,
      "gender": null,
      "nationality": null,
      "preferred_language": "en",
      "preferred_currency": "USD",
      "timezone": "UTC",
      "travel_style": null,
      "interests": null,
      "dietary_restrictions": null,
      "accessibility_needs": null
    },
    "role": {
      "is_provider": false,
      "is_admin": false,
      "provider_flags": [],
      "admin_flags": [],
      "is_premium": false
    }
  },
  "message": "Profile fetched successfully",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 401 Unauthorized

---

## 2) Update My Profile

`PATCH /api/v1/users/profile/me/`

Request body (partial update):
```json
{
  "first_name": "Fitsum",
  "last_name": "Tesfaye",
  "bio": "Love Ethiopia",
  "date_of_birth": "1995-05-01",
  "gender": "male",
  "nationality": "Ethiopian",
  "preferred_language": "en",
  "preferred_currency": "USD",
  "timezone": "Africa/Addis_Ababa",
  "travel_style": "mid_range",
  "interests": ["history", "nature"],
  "dietary_restrictions": ["vegetarian"],
  "accessibility_needs": "Wheelchair access"
}
```

Validations:
- `preferred_currency` must be a 3-letter ISO code.
- `gender` and `travel_style` must match allowed choices.
- Only provided fields are updated.

Success response (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "Fitsum",
      "last_name": "Tesfaye",
      "is_email_verified": true,
      "is_phone_verified": false,
      "phone": null
    },
    "profile": {
      "bio": "Love Ethiopia",
      "profile_photo": "/media/profiles/uuid_avatar.jpg",
      "date_of_birth": "1995-05-01",
      "gender": "male",
      "nationality": "Ethiopian",
      "preferred_language": "en",
      "preferred_currency": "USD",
      "timezone": "Africa/Addis_Ababa",
      "travel_style": "mid_range",
      "interests": ["history", "nature"],
      "dietary_restrictions": ["vegetarian"],
      "accessibility_needs": "Wheelchair access"
    },
    "role": {
      "is_provider": false,
      "is_admin": false,
      "provider_flags": [],
      "admin_flags": [],
      "is_premium": false
    }
  },
  "message": "Profile updated successfully",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 400 Validation error
- 401 Unauthorized

---

## 3) Upload Profile Photo

`POST /api/v1/users/profile/photo/`

Content type: `multipart/form-data`

Form fields:
- `profile_photo` (image file, max 5MB)

Success response (200):
```json
{
  "success": true,
    "data": {
      "profile_photo": "profiles/uuid_avatar.jpg",
      "url": "/media/profiles/uuid_avatar.jpg"
    },
  "message": "Profile photo uploaded",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 400 Invalid file (not image or too large)
- 401 Unauthorized

---

## 4) Delete Profile Photo

`DELETE /api/v1/users/profile/photo/`

Success response (200):
```json
{
  "success": true,
  "data": null,
  "message": "Profile photo deleted",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 401 Unauthorized

---

## 5) List Emergency Contacts

`GET /api/v1/users/emergency-contacts/`

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Contact One",
      "relationship": "Friend",
      "phone": "+251911000000",
      "email": "friend@example.com"
    }
  ],
  "message": "Emergency contacts fetched",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 401 Unauthorized

---

## 6) Create Emergency Contact

`POST /api/v1/users/emergency-contacts/`

Request body:
```json
{
  "name": "Contact One",
  "relationship": "Friend",
  "phone": "+251911000000",
  "email": "friend@example.com"
}
```

Validations:
- `name`, `relationship`, `phone` required.
- `email` optional but must be valid if provided.

Success response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Contact One",
    "relationship": "Friend",
    "phone": "+251911000000",
    "email": "friend@example.com"
  },
  "message": "Emergency contact created",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 400 Validation error
- 401 Unauthorized

---

## 7) Update Emergency Contact

`PATCH /api/v1/users/emergency-contacts/{contact_id}/`

Request body (partial update):
```json
{
  "name": "Contact Two",
  "relationship": "Sibling"
}
```

Success response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Contact Two",
    "relationship": "Sibling",
    "phone": "+251911000000",
    "email": "friend@example.com"
  },
  "message": "Emergency contact updated",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 403 Not owner
- 404 Contact not found
- 401 Unauthorized

---

## 8) Delete Emergency Contact

`DELETE /api/v1/users/emergency-contacts/{contact_id}/`

Success response (200):
```json
{
  "success": true,
  "data": null,
  "message": "Emergency contact deleted",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 403 Not owner
- 404 Contact not found
- 401 Unauthorized
