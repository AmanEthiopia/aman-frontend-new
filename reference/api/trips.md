# Trips API

Base path: `/api/v1/trips/`

All responses follow the standard envelope: `{success, data, message, error, meta}`.

> **Note:** "Trips" are powered by the `TravelPackage` model (also used by `/api/v1/experiences/`).
> The `/trips/` endpoints are a frontend-friendly alias designed to match the provider dashboard's
> expected field names. For traveler-facing listing and booking, see [`packages.md`](packages.md).

---

## Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/trips/` | List the provider's trips |
| POST | `/trips/` | Create a new trip |
| GET | `/trips/<trip_id>/` | Get trip detail |
| PATCH | `/trips/<trip_id>/` | Update a trip |
| DELETE | `/trips/<trip_id>/` | Delete a trip |
| POST | `/trips/<trip_id>/publish/` | Toggle publish / unpublish |

All endpoints require a valid Bearer token. Only the owning provider can manage their trips.

---

## Field Mapping

The `/trips/` API uses frontend-friendly field names that map to the underlying `TravelPackage` model:

| Frontend field | TravelPackage field |
|----------------|---------------------|
| `name` | `title` |
| `trip_type` | `category` (see table below) |
| `included_services` | `what_included` |
| `excluded_services` | `what_excluded` |
| `terms_conditions` | `cancellation_policy` |
| `important_info` | `short_description` |
| `start_city_id` | First `PackageCity` entry |
| `cities_covered` | All `PackageCity` entries |

### `trip_type` → `category` mapping

| `trip_type` (frontend) | `category` (stored) |
|------------------------|---------------------|
| `day_trip` | `city_tour` |
| `multi_day` | `multi_city` |
| `tour_package` | `multi_city` |
| `cultural_event` | `culture` |
| `adventure` | `adventure` |
| `nature` | `nature` |
| `food` | `food` |
| `spiritual` | `spiritual` |
| `historical` | `historical` |

---

## 1) List Trips (Provider)

`GET /api/v1/trips/`
Auth: Bearer token

Returns all trips owned by the authenticated provider.

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "7 Days Ethiopia Highlights",
      "nickname": "ኢትዮጵያ ጉዞ",
      "description": "A carefully curated 7-day journey...",
      "short_description": "The best of Ethiopia in one week.",
      "category": "trip",
      "trip_type": "multi_day",
      "duration_days": 7,
      "price_per_person": 450.0,
      "min_group_size": 2,
      "max_group_size": 12,
      "included_services": ["Accommodation", "Breakfast daily", "Airport transfer"],
      "excluded_services": ["Flights", "Visa"],
      "terms_conditions": "Free cancellation up to 7 days before start date.",
      "important_info": "The best of Ethiopia in one week.",
      "cities_covered": ["uuid1", "uuid2"],
      "is_published": true,
      "is_verified": false,
      "average_rating": 4.8,
      "review_count": 24,
      "cover_photo_url": "https://...",
      "slug": "7-days-ethiopia-highlights",
      "created_at": "2026-03-21T10:00:00Z",
      "updated_at": "2026-03-21T10:00:00Z"
    }
  ],
  "message": "Trips fetched successfully"
}
```

---

## 2) Create Trip (Provider)

`POST /api/v1/trips/`
Auth: Bearer token

Request body:
```json
{
  "name": "7 Days Ethiopia Highlights",
  "nickname": "ኢትዮጵያ ጉዞ",
  "description": "A carefully curated 7-day journey through Ethiopia's top destinations.",
  "important_info": "The best of Ethiopia in one week.",
  "trip_type": "multi_day",
  "duration_days": 7,
  "price_per_person": 450.00,
  "price_currency": "USD",
  "min_group_size": 2,
  "max_group_size": 12,
  "included_services": ["Accommodation", "Breakfast daily", "Airport transfer", "Guide"],
  "excluded_services": ["Flights", "Visa", "Personal expenses"],
  "terms_conditions": "Free cancellation up to 7 days before start date.",
  "languages": ["English", "Amharic"],
  "start_city_id": "uuid",
  "cities_covered": ["uuid1", "uuid2"]
}
```

Required fields: `name`

All other fields are optional with these defaults:
- `trip_type`: `"multi_day"`
- `duration_days`: `1`
- `price_per_person`: `0`
- `min_group_size`: `1`
- `max_group_size`: `20`
- `included_services` / `excluded_services`: `[]`

Notes:
- `included_services` and `excluded_services` can be a JSON array (`["item1", "item2"]`) or a comma-separated string (`"item1, item2"`).
- `start_city_id` and `cities_covered` are merged and deduplicated when creating `PackageCity` entries.
- A unique slug is auto-generated from `name`.

Success response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "7 Days Ethiopia Highlights",
    "nickname": "ኢትዮጵያ ጉዞ",
    "trip_type": "multi_day",
    "duration_days": 7,
    "price_per_person": 450.0,
    "cities_covered": ["uuid1", "uuid2"],
    "is_published": false,
    "slug": "7-days-ethiopia-highlights",
    "created_at": "2026-03-21T10:00:00Z",
    "updated_at": "2026-03-21T10:00:00Z"
  },
  "message": "Trip created successfully"
}
```

Error responses:
- 400 — `name` is missing or numeric field is invalid

---

## 3) Trip Detail (Provider)

`GET /api/v1/trips/<trip_id>/`
Auth: Bearer token (trip owner only)

Success response (200): full trip object (same shape as list item).

Error responses:
- 404 — Trip not found or not owned by requesting user

---

## 4) Update Trip (Provider)

`PATCH /api/v1/trips/<trip_id>/`
Auth: Bearer token (trip owner only)

Send only the fields to update (partial update). All fields from the create payload are accepted.

```json
{
  "name": "8 Days Ethiopia Highlights",
  "price_per_person": 480.00,
  "cities_covered": ["uuid1", "uuid2", "uuid3"]
}
```

Notes:
- If `cities_covered` or `start_city_id` is included, all existing city entries for the trip are replaced.
- Omitting both `cities_covered` and `start_city_id` leaves existing cities unchanged.

Success response (200): updated trip object.

Error responses:
- 404 — Trip not found or not owned by requesting user

---

## 5) Delete Trip (Provider)

`DELETE /api/v1/trips/<trip_id>/`
Auth: Bearer token (trip owner only)

Permanently deletes the trip and all associated `PackageCity`, `PackageDay`, and `PackagePhoto` records.

Success response (200):
```json
{ "success": true, "data": null, "message": "Trip deleted successfully" }
```

Error responses:
- 404 — Trip not found or not owned by requesting user

---

## 6) Publish / Unpublish Trip (Provider)

`POST /api/v1/trips/<trip_id>/publish/`
Auth: Bearer token (trip owner only)

Toggles the `is_published` state. No request body needed.

Success response (200):
```json
{ "success": true, "data": { "is_published": true }, "message": "Trip published successfully" }
```

or when unpublishing:
```json
{ "success": true, "data": { "is_published": false }, "message": "Trip unpublished successfully" }
```

Error responses:
- 404 — Trip not found or not owned by requesting user

---

## Relationship to `/experiences/` API

The `/trips/` endpoints are a provider dashboard alias for `TravelPackage`. The same trip is accessible via:

- `/api/v1/trips/<id>/` — provider management (this API)
- `/api/v1/experiences/<slug>/` — public traveler-facing detail
- `/api/v1/experiences/provider/<id>/` — original provider endpoint (still works)

For day-by-day itinerary building (adding days, items, attractions), use the `/experiences/provider/` endpoints documented in [`packages.md`](packages.md).
