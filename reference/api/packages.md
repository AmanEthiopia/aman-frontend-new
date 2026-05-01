# Travel Packages API

Base path: `/api/v1/experiences/`

All responses follow the standard envelope: `{success, data, message, error, meta}`.

---

## What is a Travel Package?

A **Travel Package** is a curated, multi-day itinerary assembled by a provider (tour operator) that combines AMAN platform resources — hotels, restaurants, and attractions — together with custom activities, into a single bookable product at a fixed price per person.

**Example:** _"5 Days Ethiopia Highlights — 1 night in Addis Ababa at Sheraton, 2 nights in Lalibela (Tukul Village), visit Bete Giyorgis church, dinner at a traditional restaurant, and a custom sunrise hike."_

The provider builds the package day by day, linking to existing hotels, restaurants, and attractions from the platform's database, or adding their own custom activity descriptions. Once published, travelers can browse and book the package directly.

---

## Package Building Flow (Provider)

```
1. POST /experiences/provider/                     ← Create package (title, price, days)
2. POST /experiences/provider/<pkg_id>/cities/     ← Add covered cities
3. POST /experiences/provider/<pkg_id>/days/       ← Add Day 1, Day 2, …
4. POST /experiences/provider/<pkg_id>/days/<day_id>/items/   ← Add hotel/restaurant/attraction/activity to each day
5. PUT  /experiences/provider/<pkg_id>/publish/    ← Publish when ready
```

---

## Booking Flow (Traveler)

```
1. GET  /experiences/                              ← Browse published packages
2. GET  /experiences/<slug>/                       ← View full itinerary
3. POST /experiences/bookings/                     ← Create booking (returns client_secret if payment required)
4. [Stripe.js] stripe.confirmPayment(client_secret) ← If payment required
5. GET  /experiences/bookings/mine/                ← Check booking status
6. POST /experiences/bookings/<id>/cancel/         ← Cancel if needed
```

Provider sees the booking at:
```
GET  /experiences/provider/bookings/?status=pending
POST /experiences/provider/bookings/<id>/confirm/
POST /experiences/provider/bookings/<id>/reject/
```

---

## Overview

| Who | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| Public | GET | `/` | List published packages |
| Public | GET | `/<slug>/` | Package detail + full itinerary |
| Traveler | POST | `/bookings/` | Book a package |
| Traveler | GET | `/bookings/mine/` | My bookings |
| Traveler | GET | `/bookings/<id>/` | Booking detail |
| Traveler | POST | `/bookings/<id>/cancel/` | Cancel booking |
| Traveler | POST | `/bookings/<id>/create-intent/` | Retry Stripe PaymentIntent |
| Provider | GET | `/provider/` | My packages |
| Provider | POST | `/provider/` | Create package |
| Provider | GET | `/provider/<pkg_id>/` | Package detail (owner view) |
| Provider | PATCH | `/provider/<pkg_id>/` | Update package |
| Provider | DELETE | `/provider/<pkg_id>/` | Unpublish package |
| Provider | PUT | `/provider/<pkg_id>/publish/` | Toggle publish/unpublish |
| Provider | GET/POST | `/provider/<pkg_id>/cities/` | List / add cities |
| Provider | DELETE | `/provider/<pkg_id>/cities/<city_entry_id>/` | Remove a city |
| Provider | GET/POST | `/provider/<pkg_id>/days/` | List / add days |
| Provider | PATCH/DELETE | `/provider/<pkg_id>/days/<day_id>/` | Update / delete a day |
| Provider | GET/POST | `/provider/<pkg_id>/days/<day_id>/items/` | List / add items |
| Provider | PATCH/DELETE | `/provider/<pkg_id>/days/<day_id>/items/<item_id>/` | Update / delete an item |
| Provider | GET | `/provider/bookings/` | Bookings for my packages |
| Provider | POST | `/provider/bookings/<id>/confirm/` | Confirm booking |
| Provider | POST | `/provider/bookings/<id>/reject/` | Reject booking |

---

## Package Categories

`city_tour` | `multi_city` | `adventure` | `culture` | `food` | `nature` | `spiritual` | `historical`

## Package Item Types

| `item_type` | Required FK field | Description |
|-------------|-------------------|-------------|
| `hotel` | `hotel_id` | Links to a hotel in the platform |
| `restaurant` | `restaurant_id` | Links to a restaurant in the platform |
| `attraction` | `attraction_id` | Links to an attraction in the platform |
| `activity` | _(none)_ | Free-form custom activity (use `title` + `description`) |

---

## 1) List Packages (Public)

`GET /api/v1/experiences/`
Auth: None

Query params:
- `category` — filter by category
- `city` — UUID of a city (returns packages that include this city)
- `min_days` / `max_days` — duration filter
- `price_min` / `price_max` — price per person filter
- `search` — search title and description
- `sort` — `price_asc` | `price_desc` | `rating_desc` | `duration_asc` | `newest` (default)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "7 Days Ethiopia Highlights",
      "nickname": "ኢትዮጵያ ጉዞ",
      "slug": "7-days-ethiopia-highlights",
      "category": "multi_city",
      "duration_days": 7,
      "price_per_person": "450.00",
      "price_currency": "USD",
      "max_group_size": 12,
      "average_rating": "4.80",
      "review_count": 24,
      "is_published": true,
      "primary_photo": { "id": "uuid", "photo_url": "...", "is_primary": true, "display_order": 0 },
      "cities": [
        { "id": "uuid", "city": { "id": "uuid", "name": "Addis Ababa", "nickname": "አዲስ አበባ", "slug": "addis-ababa" }, "order": 1, "night_count": 1 },
        { "id": "uuid", "city": { "id": "uuid", "name": "Lalibela", "nickname": "ላሊበላ", "slug": "lalibela" }, "order": 2, "night_count": 3 }
      ]
    }
  ],
  "message": "Packages fetched successfully"
}
```

---

## 2) Package Detail (Public)

`GET /api/v1/experiences/<slug>/`
Auth: None

Returns the full package including all days and each day's items, with linked hotel/restaurant/attraction details.

Success response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "7 Days Ethiopia Highlights",
    "nickname": "ኢትዮጵያ ጉዞ",
    "slug": "7-days-ethiopia-highlights",
    "short_description": "The best of Ethiopia in one week.",
    "description": "A carefully curated 7-day journey...",
    "category": "multi_city",
    "duration_days": 7,
    "price_per_person": "450.00",
    "price_currency": "USD",
    "child_price": "250.00",
    "payment_required": true,
    "min_group_size": 2,
    "max_group_size": 12,
    "min_age": null,
    "meeting_point": "Bole International Airport, Addis Ababa",
    "languages": ["English", "Amharic"],
    "what_included": ["Accommodation", "Breakfast daily", "Airport transfer", "Guide"],
    "what_excluded": ["Flights", "Visa", "Personal expenses"],
    "what_to_bring": ["Comfortable shoes", "Light jacket"],
    "cancellation_policy": "Free cancellation up to 7 days before start date.",
    "average_rating": "4.80",
    "review_count": 24,
    "organizer": { "id": "uuid", "name": "Abebe Tours" },
    "cities": [...],
    "days": [
      {
        "id": "uuid",
        "day_number": 1,
        "title": "Arrival in Addis Ababa",
        "description": "Arrive, check in, and explore the city.",
        "city": { "id": "uuid", "name": "Addis Ababa", "nickname": "አዲስ አበባ", "slug": "addis-ababa" },
        "items": [
          {
            "id": "uuid",
            "item_type": "hotel",
            "order": 1,
            "hotel": { "id": "uuid", "name": "Sheraton Addis Hotel", "nickname": "ሼራቶን", "slug": "sheraton-addis-hotel", "star_rating": 5, "address": "Taitu Street", "average_rating": "4.80" },
            "restaurant": null,
            "attraction": null,
            "title": null,
            "description": null,
            "duration_minutes": null,
            "notes": "Check-in from 14:00"
          },
          {
            "id": "uuid",
            "item_type": "attraction",
            "order": 2,
            "hotel": null,
            "restaurant": null,
            "attraction": { "id": "uuid", "name": "National Museum of Ethiopia", "nickname": "ብሔራዊ ሙዚየም", "slug": "national-museum-of-ethiopia", "category": "museum" },
            "title": null,
            "description": null,
            "duration_minutes": 120,
            "notes": null
          },
          {
            "id": "uuid",
            "item_type": "activity",
            "order": 3,
            "hotel": null,
            "restaurant": null,
            "attraction": null,
            "title": "Traditional Coffee Ceremony",
            "description": "Experience the full Ethiopian coffee ceremony at a local home.",
            "duration_minutes": 90,
            "notes": "Included in package price"
          }
        ]
      }
    ],
    "photos": [...]
  },
  "message": "Package fetched successfully"
}
```

---

## 3) Create Package (Provider)

`POST /api/v1/experiences/provider/`
Auth: Bearer token (any authenticated user)

Request body:
```json
{
  "title": "7 Days Ethiopia Highlights",
  "nickname": "ኢትዮጵያ ጉዞ",
  "description": "A carefully curated 7-day journey through Ethiopia's top destinations.",
  "short_description": "The best of Ethiopia in one week.",
  "category": "multi_city",
  "duration_days": 7,
  "price_per_person": "450.00",
  "price_currency": "USD",
  "child_price": "250.00",
  "payment_required": true,
  "min_group_size": 2,
  "max_group_size": 12,
  "min_age": null,
  "meeting_point": "Bole International Airport, Addis Ababa",
  "languages": ["English", "Amharic"],
  "what_included": ["Accommodation", "Breakfast daily", "Airport transfer", "Guide"],
  "what_excluded": ["Flights", "Visa"],
  "what_to_bring": ["Comfortable shoes"],
  "cancellation_policy": "Free cancellation up to 7 days before start date."
}
```

Success response (201):
```json
{ "success": true, "data": { "id": "uuid", "slug": "7-days-ethiopia-highlights" }, "message": "Package created successfully" }
```

---

## 4) Add City to Package (Provider)

`POST /api/v1/experiences/provider/<pkg_id>/cities/`
Auth: Bearer token (package owner)

```json
{ "city_id": "uuid", "order": 1, "night_count": 1 }
```

---

## 5) Add Day to Package (Provider)

`POST /api/v1/experiences/provider/<pkg_id>/days/`
Auth: Bearer token (package owner)

```json
{
  "day_number": 1,
  "title": "Arrival in Addis Ababa",
  "description": "Arrive at Bole International Airport and transfer to your hotel.",
  "city_id": "uuid"
}
```

`day_number` must be unique within the package. Add days 1, 2, 3 … in order.

---

## 6) Add Item to a Day (Provider)

`POST /api/v1/experiences/provider/<pkg_id>/days/<day_id>/items/`
Auth: Bearer token (package owner)

**Hotel item:**
```json
{ "item_type": "hotel", "hotel_id": "uuid", "order": 1, "notes": "Check-in from 14:00" }
```

**Restaurant item:**
```json
{ "item_type": "restaurant", "restaurant_id": "uuid", "order": 2, "notes": "Lunch included" }
```

**Attraction item:**
```json
{ "item_type": "attraction", "attraction_id": "uuid", "order": 3, "duration_minutes": 120 }
```

**Custom activity:**
```json
{
  "item_type": "activity",
  "order": 4,
  "title": "Traditional Coffee Ceremony",
  "description": "Full Ethiopian coffee ceremony at a local home.",
  "duration_minutes": 90,
  "notes": "Included in package price"
}
```

---

## 7) Publish Package (Provider)

`PUT /api/v1/experiences/provider/<pkg_id>/publish/`
Auth: Bearer token (package owner)

- Toggles between published and unpublished.
- Must have at least one day before publishing.

Success response (200):
```json
{ "success": true, "data": { "is_published": true }, "message": "Package Published successfully" }
```

---

## 8) Update Package (Provider)

`PATCH /api/v1/experiences/provider/<pkg_id>/`
Auth: Bearer token (package owner)

Send only the fields to update (partial update).

---

## 9) Delete / Unpublish Package (Provider)

`DELETE /api/v1/experiences/provider/<pkg_id>/`
Auth: Bearer token (package owner)

- Unpublishes the package (does not hard-delete).
- Returns 400 if active bookings exist.

---

## 10) Book a Package (Traveler)

`POST /api/v1/experiences/bookings/`
Auth: Bearer token

Request body:
```json
{
  "package_id": "uuid",
  "start_date": "2026-05-10",
  "num_adults": 2,
  "num_children": 1,
  "guest_name": "Fitsum Tesfaye",
  "guest_email": "fitsum@example.com",
  "guest_phone": "+251911000000",
  "special_requests": "Vegetarian meals please"
}
```

Price calculated as: `price_per_person × num_adults + child_price × num_children`

Success response (201):
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "PB-A3FG7Z2X",
      "status": "pending",
      "payment_required": true,
      "payment_status": "unpaid",
      "package": {
        "id": "uuid",
        "title": "7 Days Ethiopia Highlights",
        "nickname": "ኢትዮጵያ ጉዞ",
        "slug": "7-days-ethiopia-highlights",
        "duration_days": 7,
        "price_per_person": "450.00",
        "currency": "USD"
      },
      "start_date": "2026-05-10",
      "num_adults": 2,
      "num_children": 1,
      "total_price": "1150.00",
      "currency": "USD",
      "guest_name": "Fitsum Tesfaye",
      "guest_email": "fitsum@example.com",
      "created_at": "2026-03-21T10:00:00Z"
    },
    "payment": {
      "required": true,
      "client_secret": "pi_xxx_secret_yyy",
      "payment_intent_id": "pi_xxx",
      "amount": "1150.00",
      "currency": "USD"
    }
  },
  "message": "Package booking created successfully"
}
```

If `payment_required = false` on the package, the `payment` field is `{ "required": false }`.

---

## 11) My Package Bookings (Traveler)

`GET /api/v1/experiences/bookings/mine/`
Auth: Bearer token

Query params:
- `status` — filter by status

---

## 12) Cancel Package Booking (Traveler)

`POST /api/v1/experiences/bookings/<booking_id>/cancel/`
Auth: Bearer token (booking owner)

```json
{ "reason": "Change of plans" }
```

Only `pending` or `confirmed` bookings can be cancelled.

---

## 13) Provider: List Bookings

`GET /api/v1/experiences/provider/bookings/`
Auth: Bearer token

Query params:
- `status` — filter by status
- `package_id` — filter by specific package UUID

---

## 14) Provider: Confirm Booking

`POST /api/v1/experiences/provider/bookings/<booking_id>/confirm/`
Auth: Bearer token (package organizer)

- If package has `payment_required = true`, booking must have `payment_status = "paid"` first.

---

## 15) Provider: Reject Booking

`POST /api/v1/experiences/provider/bookings/<booking_id>/reject/`
Auth: Bearer token

```json
{ "reason": "Not enough participants for this date" }
```

---

## Booking Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Created, waiting for provider action |
| `confirmed` | Provider accepted |
| `rejected` | Provider rejected |
| `cancelled` | Traveler or provider cancelled |
| `completed` | Trip completed |

Payment status: `unpaid` | `paid` | `refunded`

---

## Migration & Running

After pulling these changes, run:

```bash
docker compose exec web python manage.py makemigrations experiences
docker compose exec web python manage.py migrate
```
