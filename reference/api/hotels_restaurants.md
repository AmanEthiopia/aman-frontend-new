# Hotels & Restaurants API

Base paths:
- Hotels: `/api/v1/hotels/`
- Restaurants: `/api/v1/restaurants/`

All responses follow the standard envelope: `{success, data, message, error, meta}`.

---

## Hotels

### Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/hotels/` | List published hotels (public) |
| GET | `/hotels/<slug>/` | Hotel detail (public) |
| POST | `/hotels/provider/` | Create a hotel (provider) |
| GET | `/hotels/provider/` | List provider's hotels |
| GET | `/hotels/provider/<hotel_id>/` | Hotel detail (owner view) |
| PATCH | `/hotels/provider/<hotel_id>/` | Update hotel |
| DELETE | `/hotels/provider/<hotel_id>/` | Delete hotel |
| PUT | `/hotels/provider/<hotel_id>/publish/` | Toggle publish state |
| POST | `/hotels/provider/<hotel_id>/photos/` | Upload photo |
| DELETE | `/hotels/provider/<hotel_id>/photos/<photo_id>/` | Delete photo |

---

### Create Hotel (Provider)

`POST /api/v1/hotels/provider/`
Auth: Bearer token

Request body:
```json
{
  "name": "Sheraton Addis Hotel",
  "nickname": "ሼራቶን",
  "description": "Luxury hotel in the heart of Addis Ababa.",
  "city_id": "uuid",
  "address": "Taitu Street, Addis Ababa",
  "star_rating": 5,
  "check_in_time": "14:00",
  "check_out_time": "12:00",
  "cancellation_policy": "Free cancellation up to 48 hours before check-in.",
  "payment_required": false,
  "amenities": ["wifi", "pool", "gym", "spa", "restaurant"],
  "languages": ["English", "Amharic"]
}
```

**Required fields:** `name`, `description`, `city_id`, `address`

**Optional fields:**
- `nickname` — local name or secondary name (default: `""`)
- `star_rating` — 1–5 (default: `3`)
- `check_in_time` — HH:MM format (default: `"14:00"`)
- `check_out_time` — HH:MM format (default: `"12:00"`)
- `cancellation_policy` — free-text (default: `""`)
- `payment_required` — boolean, require Stripe payment at booking (default: `false`)
- `amenities` — array of amenity strings; each creates a `HotelAmenity` record (default: `[]`)
- `languages` — array of language strings (default: `[]`)

**Notes:**
- `city_id` must be a valid UUID from `/api/v1/content/cities/`.
- A unique URL slug is auto-generated from `name`.
- Amenity strings are stored individually in the `HotelAmenity` table linked to the hotel.
- The hotel is created unpublished (`is_published = false`). Use the publish endpoint to make it visible.

Success response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Sheraton Addis Hotel",
    "nickname": "ሼራቶን",
    "slug": "sheraton-addis-hotel",
    "city": { "id": "uuid", "name": "Addis Ababa" },
    "address": "Taitu Street, Addis Ababa",
    "star_rating": 5,
    "is_published": false,
    "is_verified": false,
    "created_at": "2026-03-21T10:00:00Z"
  },
  "message": "Hotel created successfully"
}
```

Error responses:
- 400 — Required field missing or `city_id` invalid

---

### Publish Hotel (Provider)

`PUT /api/v1/hotels/provider/<hotel_id>/publish/`
Auth: Bearer token (hotel owner)

Toggles `is_published`. No request body needed.

Success response (200):
```json
{ "success": true, "data": { "is_published": true }, "message": "Hotel Published successfully" }
```

---

### Upload Hotel Photo (Provider)

`POST /api/v1/hotels/provider/<hotel_id>/photos/`
Auth: Bearer token (hotel owner)
Content-Type: `multipart/form-data`

Fields:
- `photo` — image file (required)
- `is_primary` — boolean (default: false)
- `display_order` — integer (default: 0)

---

## Restaurants

### Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/restaurants/` | List published restaurants (public) |
| GET | `/restaurants/<slug>/` | Restaurant detail (public) |
| POST | `/restaurants/provider/` | Create a restaurant (provider) |
| GET | `/restaurants/provider/` | List provider's restaurants |
| GET | `/restaurants/provider/<restaurant_id>/` | Restaurant detail (owner view) |
| PATCH | `/restaurants/provider/<restaurant_id>/` | Update restaurant |
| DELETE | `/restaurants/provider/<restaurant_id>/` | Delete restaurant |
| PUT | `/restaurants/provider/<restaurant_id>/publish/` | Toggle publish state |
| POST | `/restaurants/provider/<restaurant_id>/photos/` | Upload photo |

---

### Create Restaurant (Provider)

`POST /api/v1/restaurants/provider/`
Auth: Bearer token

Request body:
```json
{
  "name": "Lucy Restaurant",
  "nickname": "ሉሲ",
  "description": "Traditional Ethiopian cuisine in a cozy atmosphere.",
  "city_id": "uuid",
  "address": "Bole Road, Addis Ababa",
  "cuisine_type": "ethiopian",
  "price_range": "moderate",
  "phone": "+251911000000",
  "email": "info@lucyrestaurant.com",
  "website": "https://lucyrestaurant.com",
  "opening_hours": {
    "monday": { "open": "08:00", "close": "22:00" },
    "tuesday": { "open": "08:00", "close": "22:00" }
  },
  "seating_capacity": 80,
  "has_delivery": true,
  "has_takeaway": false,
  "has_dine_in": true,
  "category": "restaurant"
}
```

**Required fields:** `name`, `description`, `city_id`, `address`, `cuisine_type`

**Optional fields:**
- `nickname` — local name or secondary name (default: `""`)
- `price_range` — `budget` | `moderate` | `upscale` | `fine_dining` (default: `moderate`)
- `phone` — contact phone (default: `""`)
- `email` — contact email
- `website` — URL
- `opening_hours` — JSON object keyed by weekday (default: `{}`)
- `seating_capacity` — integer
- `has_delivery` — boolean; maps to `delivery_available` field (default: `false`)
- `has_takeaway` — accepted but currently not stored (ignored after validation)
- `has_dine_in` — accepted but currently not stored (ignored after validation)
- `category` — accepted but currently not stored (ignored after validation)

**Price range mapping:**

The API accepts both the stored value and a frontend alias:

| Sent value | Stored as |
|------------|-----------|
| `budget` | `budget` |
| `moderate` | `moderate` |
| `mid_range` | `moderate` ← alias, auto-mapped |
| `upscale` | `upscale` |
| `fine_dining` | `fine_dining` |

**Notes:**
- `city_id` must be a valid UUID from `/api/v1/content/cities/`.
- A unique URL slug is auto-generated from `name`.
- The restaurant is created unpublished (`is_published = false`).

Success response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Lucy Restaurant",
    "nickname": "ሉሲ",
    "slug": "lucy-restaurant",
    "city": { "id": "uuid", "name": "Addis Ababa" },
    "address": "Bole Road, Addis Ababa",
    "cuisine_type": "ethiopian",
    "price_range": "moderate",
    "is_published": false,
    "is_verified": false,
    "created_at": "2026-03-21T10:00:00Z"
  },
  "message": "Restaurant created successfully"
}
```

Error responses:
- 400 — Required field missing or `city_id` invalid

---

### Publish Restaurant (Provider)

`PUT /api/v1/restaurants/provider/<restaurant_id>/publish/`
Auth: Bearer token (restaurant owner)

Toggles `is_published`. No request body needed.

Success response (200):
```json
{ "success": true, "data": { "is_published": true }, "message": "Restaurant Published successfully" }
```

---

### Upload Restaurant Photo (Provider)

`POST /api/v1/restaurants/provider/<restaurant_id>/photos/`
Auth: Bearer token (restaurant owner)
Content-Type: `multipart/form-data`

Fields:
- `photo` — image file (required)
- `is_primary` — boolean (default: false)
- `display_order` — integer (default: 0)

---

## Booking / Reservation

For hotel booking and restaurant table reservation, see [`bookings.md`](bookings.md).

For provider dashboard aggregated view of all bookings, see [`provider_dashboard.md`](provider_dashboard.md).
