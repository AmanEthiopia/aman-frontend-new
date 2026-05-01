# Provider Dashboard API

Base path: `/api/v1/provider/`

All responses follow the standard envelope: `{success, data, message, error, meta}`.

These endpoints aggregate data across all of a provider's properties (hotels, restaurants, trips, drivers)
into a single unified view that the frontend provider dashboard consumes.

---

## Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/provider/properties/` | All properties (any type) owned by the provider |
| GET | `/provider/hotels/` | Provider's hotels only |
| GET | `/provider/restaurants/` | Provider's restaurants only |
| GET | `/provider/trips/` | Provider's travel packages only |
| GET | `/provider/drivers/` | Provider's driver services only |
| GET | `/provider/bookings/` | Aggregated bookings across all properties |
| GET | `/provider/stats/` | Summary counts and pending bookings |

All endpoints require a valid Bearer token. Each endpoint returns only the data belonging to the authenticated user.

---

## Pagination

All list endpoints support:
- `page` — page number (default: 1)
- `page_size` — items per page (default: 20, max: 100)

Pagination metadata is included in the response:
```json
{
  "meta": {
    "pagination": {
      "count": 42,
      "page": 1,
      "page_size": 20,
      "num_pages": 3,
      "next": null,
      "previous": null
    }
  }
}
```

---

## PropertyBase Object

All property list endpoints return items in a unified `PropertyBase` shape:

```json
{
  "id": "uuid",
  "name": "Sheraton Addis Hotel",
  "nickname": "ሼራቶን",
  "description": "Luxury hotel in Addis Ababa city center.",
  "category": "hotel",
  "city_id": "uuid",
  "city_name": "Addis Ababa",
  "address": "Taitu Street, Addis Ababa",
  "is_verified": true,
  "is_active": true,
  "cover_photo_url": "https://...",
  "average_rating": 4.8,
  "review_count": 142,
  "created_at": "2026-01-15T08:00:00Z",
  "updated_at": "2026-03-10T14:30:00Z"
}
```

The `category` field identifies the property type: `hotel` | `restaurant` | `trip` | `driver`

The `is_active` field maps to `is_published` on the underlying model.

---

## 1) All Properties

`GET /api/v1/provider/properties/`
Auth: Bearer token

Returns all property types (hotels + restaurants + trips + drivers) sorted newest first.

Query params:
- `category` — optional filter: `hotel` | `restaurant` | `trip` | `driver`
- `page`, `page_size` — pagination

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Sheraton Addis Hotel",
      "nickname": "ሼራቶን",
      "category": "hotel",
      "city_name": "Addis Ababa",
      "address": "Taitu Street",
      "is_verified": true,
      "is_active": true,
      "cover_photo_url": "https://...",
      "average_rating": 4.8,
      "review_count": 142,
      "created_at": "2026-01-15T08:00:00Z",
      "updated_at": "2026-03-10T14:30:00Z"
    },
    {
      "id": "uuid",
      "name": "Lucy Restaurant",
      "category": "restaurant",
      "city_name": "Addis Ababa",
      "is_active": false,
      "cover_photo_url": null,
      "average_rating": 0.0,
      "review_count": 0,
      "created_at": "2026-02-01T09:00:00Z",
      "updated_at": "2026-02-01T09:00:00Z"
    }
  ],
  "message": "Properties fetched successfully",
  "meta": { "pagination": { "count": 5, "page": 1, "page_size": 20, "num_pages": 1 } }
}
```

---

## 2) Hotels Only

`GET /api/v1/provider/hotels/`
Auth: Bearer token

Returns only hotels owned by the provider. Same `PropertyBase` shape with `"category": "hotel"`.

Query params: `page`, `page_size`

---

## 3) Restaurants Only

`GET /api/v1/provider/restaurants/`
Auth: Bearer token

Returns only restaurants owned by the provider. Same `PropertyBase` shape with `"category": "restaurant"`.

Query params: `page`, `page_size`

---

## 4) Trips Only

`GET /api/v1/provider/trips/`
Auth: Bearer token

Returns only travel packages (trips) organized by the provider. Same `PropertyBase` shape with `"category": "trip"`.

For the trip's `city_name`, the first `PackageCity` entry is used.

Query params: `page`, `page_size`

---

## 5) Driver Services Only

`GET /api/v1/provider/drivers/`
Auth: Bearer token

Returns only driver services owned by the provider. Same `PropertyBase` shape with `"category": "driver"`.

Note: `cover_photo_url` is always `null` for drivers (no photo model yet).

Query params: `page`, `page_size`

---

## 6) Aggregated Bookings

`GET /api/v1/provider/bookings/`
Auth: Bearer token

Returns all bookings across all of the provider's properties, merged and sorted newest first.

Aggregates:
- Hotel bookings (`Booking` model with `bookable_type=HOTEL`)
- Restaurant table reservations (`TableReservation` model)
- Travel package bookings (`PackageBooking` model)

Driver bookings are not included (no booking model for drivers yet).

Query params:
- `status` — filter by status (e.g. `pending`, `confirmed`, `cancelled`)
- `page`, `page_size` — pagination

### ProviderBooking Object

```json
{
  "id": "uuid",
  "property_id": "uuid",
  "property_name": "Sheraton Addis Hotel",
  "property_type": "hotel",
  "guest_id": "uuid",
  "guest_name": "Fitsum Tesfaye",
  "guest_email": "fitsum@example.com",
  "guest_phone": "+251911000000",
  "check_in": "2026-04-10",
  "check_out": "2026-04-13",
  "guests": 2,
  "total_price": 450.0,
  "status": "pending",
  "special_requests": "High floor preferred",
  "created_at": "2026-03-21T10:00:00Z",
  "updated_at": "2026-03-21T10:00:00Z"
}
```

Field notes by property type:

| Field | Hotel | Restaurant | Trip (Package) |
|-------|-------|------------|----------------|
| `property_type` | `"hotel"` | `"restaurant"` | `"trip"` |
| `check_in` | `check_in_date` | `reservation_date` | `start_date` |
| `check_out` | `check_out_date` | `null` | `null` |
| `guests` | `num_adults + num_children` | `party_size` | `num_adults + num_children` |
| `total_price` | from Booking | `0` (deposit handled separately) | from PackageBooking |

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "property_name": "Sheraton Addis Hotel",
      "property_type": "hotel",
      "guest_name": "Fitsum Tesfaye",
      "guest_email": "fitsum@example.com",
      "check_in": "2026-04-10",
      "check_out": "2026-04-13",
      "guests": 2,
      "total_price": 450.0,
      "status": "pending",
      "created_at": "2026-03-21T10:00:00Z",
      "updated_at": "2026-03-21T10:00:00Z"
    },
    {
      "id": "uuid",
      "property_id": "uuid",
      "property_name": "Lucy Restaurant",
      "property_type": "restaurant",
      "guest_name": "Sara Bekele",
      "guest_email": "sara@example.com",
      "check_in": "2026-04-11",
      "check_out": null,
      "guests": 4,
      "total_price": 0.0,
      "status": "confirmed",
      "created_at": "2026-03-20T18:00:00Z",
      "updated_at": "2026-03-20T19:00:00Z"
    }
  ],
  "message": "Bookings fetched successfully",
  "meta": { "pagination": { "count": 12, "page": 1, "page_size": 20, "num_pages": 1 } }
}
```

---

## 7) Stats

`GET /api/v1/provider/stats/`
Auth: Bearer token

Returns a summary of the provider's property counts and pending bookings.

Success response (200):
```json
{
  "success": true,
  "data": {
    "total_properties": 5,
    "hotels": 1,
    "restaurants": 2,
    "trips": 1,
    "drivers": 1,
    "pending_bookings": 3
  },
  "message": "Stats fetched successfully"
}
```

Field notes:
- `total_properties` — sum of all property counts
- `pending_bookings` — pending hotel bookings + pending restaurant reservations + pending package bookings

---

## Booking Management

To confirm or reject individual bookings, use the booking-type-specific endpoints:

| Action | Hotel | Restaurant | Trip (Package) |
|--------|-------|------------|----------------|
| Confirm | `POST /api/v1/bookings/provider/hotel/<id>/confirm/` | `POST /api/v1/bookings/provider/restaurant/<id>/confirm/` | `POST /api/v1/experiences/provider/bookings/<id>/confirm/` |
| Reject | `POST /api/v1/bookings/provider/hotel/<id>/reject/` | `POST /api/v1/bookings/provider/restaurant/<id>/reject/` | `POST /api/v1/experiences/provider/bookings/<id>/reject/` |

See [`bookings.md`](bookings.md) and [`packages.md`](packages.md) for full details.
