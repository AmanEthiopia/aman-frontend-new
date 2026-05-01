# Drivers (Private Transport) API

Base path: `/api/v1/drivers/`

Also accessible at: `/api/v1/transport/drivers/`

All responses follow the standard envelope: `{success, data, message, error, meta}`.

> **Note:** "Drivers" represent private transfer / chauffeur services listed by providers.
> They are distinct from the bus operators and scheduled routes in `/api/v1/transport/`.

---

## Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/drivers/` | List the provider's driver services |
| POST | `/drivers/` | Create a new driver service |
| GET | `/drivers/<driver_id>/` | Get driver detail |
| PATCH | `/drivers/<driver_id>/` | Update a driver service |
| DELETE | `/drivers/<driver_id>/` | Delete a driver service |
| POST | `/drivers/<driver_id>/publish/` | Toggle publish / unpublish |

All endpoints require a valid Bearer token. Only the owning provider can manage their driver listings.

---

## Vehicle Types

`sedan` | `suv` | `van` | `minibus` | `bus` | `motorcycle`

---

## 1) List Driver Services (Provider)

`GET /api/v1/drivers/`
Auth: Bearer token

Returns all driver services owned by the authenticated provider.

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Addis Airport Transfer",
      "nickname": "አዲስ ሽርሽር",
      "description": "Reliable airport pick-up and drop-off in a comfortable SUV.",
      "vehicle_type": "suv",
      "vehicle_make": "Toyota",
      "vehicle_model": "Land Cruiser",
      "vehicle_year": 2022,
      "license_plate": "AA 12345",
      "max_passengers": 6,
      "languages": ["English", "Amharic"],
      "services": ["airport_pickup", "city_tour"],
      "price_per_km": 5.00,
      "price_per_hour": null,
      "price_per_day": 150.00,
      "is_airport_pickup": true,
      "is_available_24h": false,
      "is_published": true,
      "is_verified": false,
      "average_rating": 0.0,
      "review_count": 0,
      "city_id": "uuid",
      "city_name": "Addis Ababa",
      "address": "Bole, Addis Ababa",
      "slug": "addis-airport-transfer",
      "created_at": "2026-03-21T10:00:00Z",
      "updated_at": "2026-03-21T10:00:00Z"
    }
  ],
  "message": "Drivers fetched"
}
```

---

## 2) Create Driver Service (Provider)

`POST /api/v1/drivers/`
Auth: Bearer token

Request body:
```json
{
  "name": "Addis Airport Transfer",
  "nickname": "አዲስ ሽርሽር",
  "description": "Reliable airport pick-up and drop-off in a comfortable SUV.",
  "city_id": "uuid",
  "address": "Bole, Addis Ababa",
  "vehicle_type": "suv",
  "vehicle_make": "Toyota",
  "vehicle_model": "Land Cruiser",
  "vehicle_year": 2022,
  "license_plate": "AA 12345",
  "max_passengers": 6,
  "languages": ["English", "Amharic"],
  "services": ["airport_pickup", "city_tour"],
  "price_per_km": 5.00,
  "price_per_hour": null,
  "price_per_day": 150.00,
  "is_airport_pickup": true,
  "is_available_24h": false
}
```

Required fields: `name`, `description`, `vehicle_type`, `max_passengers`

Optional fields (all others above). `city_id` must be a valid City UUID if provided.

A unique slug is auto-generated from `name`.

Success response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Addis Airport Transfer",
    "vehicle_type": "suv",
    "max_passengers": 6,
    "is_published": false,
    "slug": "addis-airport-transfer",
    "created_at": "2026-03-21T10:00:00Z",
    "updated_at": "2026-03-21T10:00:00Z"
  },
  "message": "Driver created successfully"
}
```

Error responses:
- 400 — Required field missing or invalid `vehicle_type`
- 400 — `city_id` does not exist

---

## 3) Driver Detail (Provider)

`GET /api/v1/drivers/<driver_id>/`
Auth: Bearer token (driver owner only)

Success response (200): full driver object (same shape as list item).

Error responses:
- 404 — Driver not found or not owned by requesting user

---

## 4) Update Driver Service (Provider)

`PATCH /api/v1/drivers/<driver_id>/`
Auth: Bearer token (driver owner only)

Send only the fields to update (partial update).

```json
{
  "price_per_km": 6.00,
  "is_available_24h": true,
  "max_passengers": 7
}
```

Success response (200): updated driver object.

Error responses:
- 404 — Driver not found or not owned by requesting user

---

## 5) Delete Driver Service (Provider)

`DELETE /api/v1/drivers/<driver_id>/`
Auth: Bearer token (driver owner only)

Permanently deletes the driver service listing.

Success response (200):
```json
{ "success": true, "data": null, "message": "Driver deleted successfully" }
```

Error responses:
- 404 — Driver not found or not owned by requesting user

---

## 6) Publish / Unpublish Driver Service (Provider)

`POST /api/v1/drivers/<driver_id>/publish/`
Auth: Bearer token (driver owner only)

Toggles the `is_published` state. No request body needed.

Success response (200):
```json
{ "success": true, "data": { "is_published": true }, "message": "Driver published successfully" }
```

Error responses:
- 404 — Driver not found or not owned by requesting user

---

## Notes

- Driver services appear in the provider dashboard via `GET /api/v1/provider/properties/?category=driver`.
- Driver service bookings are not yet implemented. Currently drivers are listed as properties but have no associated booking model.
- The `services` field is a free-form JSON array (e.g. `["airport_pickup", "city_tour", "day_trip"]`).
- The `languages` field is a free-form JSON array (e.g. `["English", "Amharic", "French"]`).
