# Traveler Itinerary API

Base path: `/api/v1/itinerary/`

All responses follow the standard envelope: `{success, data, message, error, meta}`.

---

## What is an Itinerary?

A personal travel plan that a traveler builds themselves — day by day, activity by activity — using platform resources (hotels, restaurants, attractions, experiences, tour guides) plus their own custom items. It is **private** (only visible to the traveler who created it).

**Example:** "Ethiopian Highlands Adventure — Jan 15–22, 2025. Day 1: Check-in at Sheraton (hotel), Dinner at Yod Abyssinia (restaurant). Day 2: Visit Rock-Hewn Churches (attraction), Coffee Ceremony (custom)."

---

## UI Tab → API Mapping

| UI Tab | Query param | What it returns |
|--------|-------------|-----------------|
| **Current Trip** | `?tab=current` | Trips where `start_date <= today <= end_date` |
| **Upcoming** | `?tab=upcoming` | Trips where `start_date > today` |
| **Past Trips** | `?tab=past` | Trips where `end_date < today` |

---

## Item Types

| `item_type` | Required FK | Description |
|-------------|-------------|-------------|
| `hotel` | `hotel_id` | Links to a hotel on the platform |
| `restaurant` | `restaurant_id` | Links to a restaurant on the platform |
| `attraction` | `attraction_id` | Links to an attraction on the platform |
| `experience` | `experience_id` | Links to an experience on the platform |
| `guide` | `guide_id` | Links to a tour guide on the platform |
| `transport` | _(none)_ | Free-text transport entry (use `title`) |
| `custom` | _(none)_ | Any custom activity (use `title`) |

## Item Status

| `status` | Description |
|----------|-------------|
| `planned` | Added to plan but not yet booked/confirmed |
| `confirmed` | Booked and confirmed |

---

## Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | List my trip plans (supports tab filter) |
| POST | `/` | Create a new trip plan |
| GET | `/<trip_id>/` | Full trip detail with all days + items |
| PATCH | `/<trip_id>/` | Update trip (title, dates, status, cover photo) |
| DELETE | `/<trip_id>/` | Delete trip plan |
| GET | `/<trip_id>/days/` | List all days in a trip |
| POST | `/<trip_id>/days/` | Add a day to the trip |
| PATCH | `/<trip_id>/days/<day_id>/` | Update a day |
| DELETE | `/<trip_id>/days/<day_id>/` | Delete a day |
| GET | `/<trip_id>/days/<day_id>/items/` | List items in a day |
| POST | `/<trip_id>/days/<day_id>/items/` | Add an item to a day |
| PATCH | `/<trip_id>/days/<day_id>/items/<item_id>/` | Update an item (status, time, notes) |
| DELETE | `/<trip_id>/days/<day_id>/items/<item_id>/` | Remove an item |

All endpoints require **Bearer token** authentication.

---

## 1) List My Trip Plans

`GET /api/v1/itinerary/`

Query params:
- `tab` — `current` | `upcoming` | `past`
- `status` — `draft` | `active` | `completed` | `archived` (ignored if `tab` is set)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Ethiopian Highlands Adventure",
      "description": "A week exploring Ethiopia's historical gems.",
      "start_date": "2025-01-15",
      "end_date": "2025-01-22",
      "duration_days": 7,
      "status": "active",
      "day_count": 7,
      "city_count": 3,
      "confirmed_count": 5,
      "planned_count": 2,
      "cover_photo": "https://api.aman.yichalal.ai/media/itinerary/covers/img.jpg",
      "created_at": "2025-01-10T08:00:00Z"
    }
  ],
  "meta": { "pagination": { "count": 1, "current_page": 1, "total_pages": 1 } }
}
```

---

## 2) Create Trip Plan

`POST /api/v1/itinerary/`

Request body:
```json
{
  "title": "Ethiopian Highlands Adventure",
  "description": "A week exploring Ethiopia's historical gems.",
  "start_date": "2025-01-15",
  "end_date": "2025-01-22",
  "cover_photo": "<file upload — optional>"
}
```

Success response (201):
```json
{ "success": true, "data": { "id": "uuid" }, "message": "Trip plan created successfully" }
```

---

## 3) Trip Detail

`GET /api/v1/itinerary/<trip_id>/`

Returns the full plan including all days and each day's items with linked resource details.

Success response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Ethiopian Highlands Adventure",
    "description": "A week exploring Ethiopia's historical gems.",
    "start_date": "2025-01-15",
    "end_date": "2025-01-22",
    "duration_days": 7,
    "status": "active",
    "cover_photo": "https://...",
    "days": [
      {
        "id": "uuid",
        "date": "2025-01-15",
        "title": "Arrival Day",
        "notes": "Arrive at Bole International Airport.",
        "items": [
          {
            "id": "uuid",
            "item_type": "hotel",
            "status": "confirmed",
            "order": 1,
            "time_slot": "14:00:00",
            "duration_minutes": null,
            "hotel": {
              "id": "uuid",
              "name": "Sheraton Addis Hotel",
              "slug": "sheraton-addis-hotel",
              "star_rating": 5,
              "address": "Taitu Street, Addis Ababa",
              "average_rating": "4.80"
            },
            "restaurant": null,
            "attraction": null,
            "experience": null,
            "guide": null,
            "title": null,
            "description": null,
            "location": "Addis Ababa",
            "notes": "Check-in from 14:00"
          },
          {
            "id": "uuid",
            "item_type": "restaurant",
            "status": "planned",
            "order": 2,
            "time_slot": "19:00:00",
            "duration_minutes": 90,
            "hotel": null,
            "restaurant": {
              "id": "uuid",
              "name": "Yod Abyssinia",
              "slug": "yod-abyssinia",
              "cuisine_type": "Ethiopian",
              "address": "Addis Ababa",
              "average_rating": "4.60"
            },
            "attraction": null,
            "experience": null,
            "guide": null,
            "title": null,
            "description": "Traditional Ethiopian cuisine with cultural show",
            "location": "Addis Ababa",
            "notes": null
          },
          {
            "id": "uuid",
            "item_type": "custom",
            "status": "planned",
            "order": 3,
            "time_slot": "10:00:00",
            "duration_minutes": 60,
            "hotel": null, "restaurant": null, "attraction": null, "experience": null, "guide": null,
            "title": "Visit local market",
            "description": "Explore Merkato, Africa's largest open-air market.",
            "location": "Merkato, Addis Ababa",
            "notes": null
          }
        ]
      }
    ],
    "created_at": "2025-01-10T08:00:00Z",
    "updated_at": "2025-01-12T10:30:00Z"
  },
  "message": "Trip plan fetched successfully"
}
```

---

## 4) Update Trip Plan

`PATCH /api/v1/itinerary/<trip_id>/`

Send only the fields to update:
```json
{
  "title": "Updated Title",
  "status": "completed"
}
```

Trip `status` values: `draft` | `active` | `completed` | `archived`

---

## 5) Delete Trip Plan

`DELETE /api/v1/itinerary/<trip_id>/`

---

## 6) Add a Day

`POST /api/v1/itinerary/<trip_id>/days/`

```json
{
  "date": "2025-01-15",
  "title": "Arrival Day",
  "notes": "Arrive at Bole International Airport."
}
```

- `date` must be within `start_date` and `end_date` of the trip.
- Each date can only appear once per trip.

Success response (201):
```json
{ "success": true, "data": { "id": "uuid", "date": "2025-01-15" }, "message": "Day added successfully" }
```

---

## 7) Add an Item to a Day

`POST /api/v1/itinerary/<trip_id>/days/<day_id>/items/`

**Hotel item:**
```json
{
  "item_type": "hotel",
  "hotel_id": "uuid",
  "order": 1,
  "time_slot": "14:00",
  "status": "confirmed",
  "location": "Addis Ababa",
  "notes": "Check-in from 14:00"
}
```

**Restaurant item:**
```json
{
  "item_type": "restaurant",
  "restaurant_id": "uuid",
  "order": 2,
  "time_slot": "19:00",
  "duration_minutes": 90,
  "description": "Traditional Ethiopian cuisine with cultural show"
}
```

**Attraction item:**
```json
{
  "item_type": "attraction",
  "attraction_id": "uuid",
  "order": 3,
  "time_slot": "10:00",
  "duration_minutes": 120
}
```

**Experience item:**
```json
{
  "item_type": "experience",
  "experience_id": "uuid",
  "order": 4,
  "time_slot": "08:00"
}
```

**Guide item:**
```json
{
  "item_type": "guide",
  "guide_id": "uuid",
  "order": 5,
  "time_slot": "09:00",
  "duration_minutes": 240
}
```

**Custom item:**
```json
{
  "item_type": "custom",
  "order": 6,
  "time_slot": "16:00",
  "duration_minutes": 60,
  "title": "Visit local market",
  "description": "Explore Merkato, Africa's largest open-air market.",
  "location": "Merkato, Addis Ababa"
}
```

Success response (201):
```json
{ "success": true, "data": { "id": "uuid" }, "message": "Item added successfully" }
```

---

## 8) Update an Item

`PATCH /api/v1/itinerary/<trip_id>/days/<day_id>/items/<item_id>/`

Updatable fields:
```json
{
  "status": "confirmed",
  "order": 2,
  "time_slot": "15:00",
  "duration_minutes": 120,
  "title": "Updated title",
  "description": "Updated description",
  "location": "New location",
  "notes": "Updated notes"
}
```

Use this to **mark an item as confirmed** after booking:
```json
{ "status": "confirmed" }
```

---

## Trip Status Flow

```
draft → active → completed
              ↘ archived
```

| Status | Meaning |
|--------|---------|
| `draft` | Being built, not started yet |
| `active` | Trip is ongoing |
| `completed` | Trip is done |
| `archived` | Hidden from main view |

---

## Migration

After pulling these changes, run:

```bash
docker compose exec web python manage.py makemigrations itinerary
docker compose exec web python manage.py migrate
```
