# Tour Guide Services API

Base path: `/api/v1/guides/`

All responses follow the standard envelope: `{success, data, message, error, meta}`.

---

## What is a Tour Guide Service?

A **Tour Guide** is a provider-created service listing — similar to how hotels or restaurants list their properties. A guide sets their service type (private tour, hiking guide, driver, etc.), pricing model (hourly, daily, per person, per group), languages they speak, and cities they operate in. Travelers can browse, view detail, and book a guide directly.

**Example:** "Abebe Girma — Private Tour Guide, Lalibela & Axum specialist. $80/day. Speaks English, Amharic, Tigrinya. 8 years experience."

---

## Service Types

| `service_type` | Description |
|----------------|-------------|
| `private_tour` | Private tour guide for one group |
| `group_tour` | Shared group tours |
| `driver` | Driver + guide combo |
| `photographer` | Travel photographer |
| `hiking_guide` | Hiking & trekking specialist |
| `cultural_guide` | Cultural experiences & ceremonies |
| `interpreter` | Language interpreter / translator |
| `custom` | Any other custom service |

## Pricing Types

| `pricing_type` | `total_price` calculation |
|----------------|--------------------------|
| `hourly` | `price × hours_requested` |
| `daily` | `price × 1` (one day flat) |
| `per_person` | `price × (num_adults + num_children)` |
| `per_group` | `price` (fixed, regardless of group size) |

---

## Overview

| Who | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Public | GET | `/` | Browse published guides |
| Public | GET | `/<slug>/` | Guide detail |
| Traveler | POST | `/bookings/` | Book a guide |
| Traveler | GET | `/bookings/mine/` | My bookings |
| Traveler | GET | `/bookings/<id>/` | Booking detail |
| Traveler | POST | `/bookings/<id>/cancel/` | Cancel booking |
| Provider | GET | `/provider/` | My guide listings |
| Provider | POST | `/provider/` | Create guide listing |
| Provider | GET | `/provider/<guide_id>/` | Guide detail (owner view) |
| Provider | PATCH | `/provider/<guide_id>/` | Update guide |
| Provider | DELETE | `/provider/<guide_id>/` | Unpublish guide |
| Provider | PUT | `/provider/<guide_id>/publish/` | Toggle publish/unpublish |
| Provider | GET/POST | `/provider/<guide_id>/cities/` | List / add operating cities |
| Provider | DELETE | `/provider/<guide_id>/cities/<city_entry_id>/` | Remove a city |
| Provider | GET/POST | `/provider/<guide_id>/photos/` | List / upload photos |
| Provider | DELETE | `/provider/<guide_id>/photos/<photo_id>/` | Delete a photo |
| Provider | GET | `/provider/bookings/` | Bookings for my guides |
| Provider | POST | `/provider/bookings/<id>/confirm/` | Confirm booking |
| Provider | POST | `/provider/bookings/<id>/reject/` | Reject booking |

---

## 1) List Guides (Public)

`GET /api/v1/guides/`
Auth: None

Query params:
- `service_type` — filter by service type
- `city` — city slug (returns guides that operate in this city)
- `language` — filter by language (e.g. `English`)
- `pricing_type` — `hourly` | `daily` | `per_person` | `per_group`
- `price_min` / `price_max` — price filter
- `search` — search title and description
- `sort` — `price_asc` | `price_desc` | `rating_desc` | `newest` (default)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Private Tour Guide — Lalibela & Axum",
      "nickname": "ላሊበላ አስጎብኚ",
      "slug": "private-tour-guide-lalibela-axum",
      "service_type": "private_tour",
      "pricing_type": "daily",
      "price": "80.00",
      "price_currency": "USD",
      "languages": ["English", "Amharic", "Tigrinya"],
      "max_group_size": 8,
      "years_experience": 8,
      "average_rating": "4.90",
      "review_count": 42,
      "is_published": true,
      "primary_photo": { "id": "uuid", "photo_url": "...", "is_primary": true },
      "cities": [
        { "id": "uuid", "city": { "id": "uuid", "name": "Lalibela", "nickname": "ላሊበላ", "slug": "lalibela" }, "order": 1 },
        { "id": "uuid", "city": { "id": "uuid", "name": "Axum", "nickname": "አክሱም", "slug": "axum" }, "order": 2 }
      ]
    }
  ],
  "meta": { "pagination": { "count": 1, "current_page": 1, "total_pages": 1 } }
}
```

---

## 2) Guide Detail (Public)

`GET /api/v1/guides/<slug>/`
Auth: None

Success response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Private Tour Guide — Lalibela & Axum",
    "nickname": "ላሊበላ አስጎብኚ",
    "slug": "private-tour-guide-lalibela-axum",
    "description": "I offer personalized private tours of Lalibela's rock-hewn churches and Axum's ancient obelisks...",
    "short_description": "Lalibela & Axum specialist with 8 years experience.",
    "service_type": "private_tour",
    "pricing_type": "daily",
    "price": "80.00",
    "price_currency": "USD",
    "languages": ["English", "Amharic", "Tigrinya"],
    "min_group_size": 1,
    "max_group_size": 8,
    "years_experience": 8,
    "certifications": ["Licensed Tour Guide — ETOA", "First Aid Certified"],
    "cancellation_policy": "Free cancellation up to 48 hours before the booking date.",
    "average_rating": "4.90",
    "review_count": 42,
    "is_published": true,
    "is_verified": true,
    "organizer": { "id": "uuid", "name": "Abebe Girma" },
    "cities": [...],
    "photos": [
      { "id": "uuid", "photo_url": "...", "caption": "Rock-Hewn Churches tour", "display_order": 0, "is_primary": true }
    ],
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-10T00:00:00Z"
  },
  "message": "Guide fetched successfully"
}
```

---

## 3) Create Guide Listing (Provider)

`POST /api/v1/guides/provider/`
Auth: Bearer token

Request body:
```json
{
  "title": "Private Tour Guide — Lalibela & Axum",
  "nickname": "ላሊበላ አስጎብኚ",
  "description": "I offer personalized private tours of Lalibela's rock-hewn churches...",
  "short_description": "Lalibela & Axum specialist with 8 years experience.",
  "service_type": "private_tour",
  "pricing_type": "daily",
  "price": "80.00",
  "price_currency": "USD",
  "languages": ["English", "Amharic", "Tigrinya"],
  "min_group_size": 1,
  "max_group_size": 8,
  "years_experience": 8,
  "certifications": ["Licensed Tour Guide — ETOA", "First Aid Certified"],
  "cancellation_policy": "Free cancellation up to 48 hours before the booking date."
}
```

Success response (201):
```json
{ "success": true, "data": { "id": "uuid", "slug": "private-tour-guide-lalibela-axum" }, "message": "Guide service created successfully" }
```

---

## 4) Add Operating City (Provider)

`POST /api/v1/guides/provider/<guide_id>/cities/`

```json
{ "city": "uuid-of-lalibela-city", "order": 1 }
```

---

## 5) Upload Photo (Provider)

`POST /api/v1/guides/provider/<guide_id>/photos/`
Content-Type: `multipart/form-data`

| Field | Type | Required |
|-------|------|---------|
| `photo_url` | file | yes |
| `caption` | string | no |
| `display_order` | integer | no |
| `is_primary` | boolean | no |

Max file size: **5 MB**. Setting `is_primary: true` clears all other primary flags.

---

## 6) Publish Guide (Provider)

`PUT /api/v1/guides/provider/<guide_id>/publish/`

Toggles between published and unpublished. Must have at least one photo to publish.

Success response (200):
```json
{ "success": true, "data": { "is_published": true }, "message": "Guide Published successfully" }
```

---

## 7) Book a Guide (Traveler)

`POST /api/v1/guides/bookings/`
Auth: Bearer token

```json
{
  "guide_id": "uuid",
  "booking_date": "2025-03-15",
  "start_time": "09:00",
  "hours_requested": 6,
  "num_adults": 2,
  "num_children": 0,
  "guest_name": "Fitsum Tesfaye",
  "guest_email": "fitsum@example.com",
  "guest_phone": "+251911000000",
  "special_requests": "Please arrange airport pickup"
}
```

Notes:
- `hours_requested` is **required** for `pricing_type = hourly` guides.
- `start_time` is optional but recommended.
- `total_price` is calculated automatically:
  - `hourly`: `price × hours_requested`
  - `daily` or `per_group`: `price` (flat)
  - `per_person`: `price × (num_adults + num_children)`

Success response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_number": "GB-A3FG7Z2X",
    "guide": {
      "id": "uuid",
      "title": "Private Tour Guide — Lalibela & Axum",
      "service_type": "private_tour",
      "pricing_type": "daily",
      "price": "80.00",
      "price_currency": "USD"
    },
    "status": "pending",
    "payment_status": "unpaid",
    "booking_date": "2025-03-15",
    "start_time": "09:00:00",
    "hours_requested": "6.0",
    "num_adults": 2,
    "num_children": 0,
    "total_price": "80.00",
    "currency": "USD",
    "guest_name": "Fitsum Tesfaye",
    "guest_email": "fitsum@example.com",
    "created_at": "2025-03-01T10:00:00Z"
  },
  "message": "Booking created successfully"
}
```

---

## 8) My Guide Bookings (Traveler)

`GET /api/v1/guides/bookings/mine/`
Auth: Bearer token

Query params:
- `status` — filter by status

---

## 9) Cancel Booking (Traveler)

`POST /api/v1/guides/bookings/<booking_id>/cancel/`
Auth: Bearer token (booking owner)

```json
{ "reason": "Change of plans" }
```

Only `pending` or `confirmed` bookings can be cancelled.

---

## 10) Provider: List Bookings

`GET /api/v1/guides/provider/bookings/`
Auth: Bearer token

Query params:
- `status` — filter by status
- `guide_id` — filter by specific guide UUID

---

## 11) Provider: Confirm Booking

`POST /api/v1/guides/provider/bookings/<booking_id>/confirm/`

---

## 12) Provider: Reject Booking

`POST /api/v1/guides/provider/bookings/<booking_id>/reject/`

```json
{ "reason": "Unavailable on that date" }
```

---

## Booking Status Flow

```
pending → confirmed → completed
       ↘ rejected
pending/confirmed → cancelled
```

| Status | Meaning |
|--------|---------|
| `pending` | Created, waiting for guide to confirm |
| `confirmed` | Guide accepted |
| `rejected` | Guide rejected |
| `cancelled` | Traveler cancelled |
| `completed` | Service completed |

---

## Migration

After pulling these changes, run:

```bash
docker compose exec web python manage.py makemigrations guides
docker compose exec web python manage.py migrate
```
