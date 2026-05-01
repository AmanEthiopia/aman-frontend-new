# Bookings & Reservations API

Base path: `/api/v1/bookings/`

All responses follow the standard envelope: `{success, data, message, error, meta}`.

---

## Booking Flow

Here's what a real booking looks like from start to finish, for both a hotel and a restaurant.

---

### Hotel Booking — "Fitsum wants to book a room at Sheraton Addis"

**1. Traveler browses and picks a hotel**
The frontend already has the hotel `id` and room `id` from the hotel listing/detail pages.

**2. Traveler submits the booking**
`POST /api/v1/bookings/hotel/`
Send the hotel, rooms, dates, and guest info.
The backend checks room availability, calculates the total price, and creates the booking with status `pending`.

**3a. Hotel doesn't require payment (free booking)**
The response comes back with `payment.required: false`.
Done — Fitsum's booking is now `pending`, waiting for the hotel owner to accept.

**3b. Hotel requires payment upfront**
The response includes `payment.client_secret`.
The frontend uses Stripe.js to collect Fitsum's card and call `stripe.confirmPayment(client_secret)`.
Stripe processes the payment and sends a webhook to our server → booking `payment_status` becomes `paid`.

**4. Provider sees the booking**
`GET /api/v1/bookings/provider/hotel/?status=pending`
The hotel owner (provider) sees Fitsum's request in their dashboard with guest name, dates, rooms, and total.

**5. Provider confirms or rejects**
`POST /api/v1/bookings/provider/hotel/<booking_id>/confirm/`
or
`POST /api/v1/bookings/provider/hotel/<booking_id>/reject/`
If the hotel requires payment, the provider can only confirm after `payment_status = "paid"`.
On confirmation, booking status becomes `confirmed`.

**6. Fitsum checks his bookings**
`GET /api/v1/bookings/hotel/mine/`
He sees his booking is now `confirmed` with all the details.

**7. Fitsum needs to cancel**
`POST /api/v1/bookings/hotel/<booking_id>/cancel/`
Can cancel any `pending` or `confirmed` booking with an optional reason.

---

### Restaurant Reservation — "Sara wants to book a table at Lucy Restaurant for 4 people at 7pm"

**1. Sara picks the restaurant and a time slot**
Frontend has the restaurant `id` from the restaurant listing page.

**2. Sara submits the reservation**
`POST /api/v1/bookings/restaurant/`
Send restaurant, date, time, party size, and guest info.
If the restaurant charges a deposit (e.g. 50 ETB per person), `total_price` = 200 ETB and a `client_secret` is returned.

**3. Sara pays the deposit (if required)**
Same Stripe.js flow as above. After payment, `payment_status` becomes `paid`.

**4. Provider confirms the table**
`POST /api/v1/bookings/provider/restaurant/<reservation_id>/confirm/`
Sara gets her reservation confirmed.

**5. Sara checks her reservations**
`GET /api/v1/bookings/restaurant/mine/`

---

### Provider checks their dashboard

After a busy week, the provider wants to see how things are going:

- **Overview stats** → `GET /api/v1/bookings/provider/dashboard/`
  Shows pending bookings, this month's revenue, occupancy rate, and average rating.

- **Calendar view** → `GET /api/v1/bookings/provider/calendar/?year=2026&month=4`
  Shows all bookings for April with check-in/out dates, so the provider can see availability at a glance.

- **Earnings** → `GET /api/v1/bookings/provider/earnings/?period=this_month`
  Shows total revenue, number of bookings, average nightly rate, and a transaction list.

---

## Overview

| Feature | Who | Endpoints |
|---------|-----|-----------|
| Hotel booking | Traveler | `POST /hotel/`, `GET /hotel/mine/`, `GET /hotel/<id>/`, `POST /hotel/<id>/cancel/` |
| Hotel booking management | Provider | `GET /provider/hotel/`, `GET /provider/hotel/<id>/`, `POST /provider/hotel/<id>/confirm/`, `POST /provider/hotel/<id>/reject/` |
| Table reservation | Traveler | `POST /restaurant/`, `GET /restaurant/mine/`, `GET /restaurant/<id>/`, `POST /restaurant/<id>/cancel/` |
| Table reservation management | Provider | `GET /provider/restaurant/`, `POST /provider/restaurant/<id>/confirm/`, `POST /provider/restaurant/<id>/reject/` |
| Provider dashboard | Provider | `GET /provider/dashboard/`, `GET /provider/calendar/`, `GET /provider/earnings/` |
| Payments | Traveler | `POST /payment/hotel/<id>/create-intent/`, `POST /payment/restaurant/<id>/create-intent/` |
| Stripe webhook | Stripe | `POST /payment/webhook/` |

---

## Payment Flow

Hotels and restaurants can optionally require payment at booking:
- Set `payment_required = true` on a `Hotel` to require Stripe payment before the provider can confirm.
- Set `reservation_payment_required = true` and `reservation_deposit_per_person` on a `Restaurant`.

**Flow:**
1. Traveler creates booking/reservation → backend returns `payment.client_secret` if required.
2. Frontend uses `Stripe.js` (`stripe.confirmPayment(client_secret, ...)`) to complete payment.
3. Stripe sends webhook → backend marks `payment_status = "paid"`.
4. Provider can now confirm the booking.

If Stripe is temporarily down, `client_secret` is `null` in the creation response.
Use `POST /payment/hotel/<id>/create-intent/` to retry.

**Stripe env vars required:**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Booking & Reservation Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Created, awaiting provider action |
| `confirmed` | Provider accepted |
| `rejected` | Provider rejected |
| `cancelled` | Traveler or provider cancelled |
| `completed` | Stay/visit completed |
| `no_show` | Guest did not show up |

Payment status: `unpaid` | `paid` | `refunded`

---

## 1) Create Hotel Booking

`POST /api/v1/bookings/hotel/`
Auth: Traveler (Bearer token required)

Request body:
```json
{
  "hotel_id": "uuid",
  "check_in_date": "2026-04-10",
  "check_out_date": "2026-04-13",
  "rooms": [
    {"room_id": "uuid", "quantity": 1}
  ],
  "num_adults": 2,
  "num_children": 0,
  "guest_name": "Fitsum Tesfaye",
  "guest_email": "fitsum@example.com",
  "guest_phone": "+251911000000",
  "special_requests": "High floor preferred"
}
```

Validations:
- `check_in_date` cannot be in the past.
- `check_out_date` must be after `check_in_date`.
- Each room must belong to the hotel and be available.
- Room unit availability is checked against existing pending/confirmed bookings.

Success response (201):
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-A3FG7Z2X",
      "status": "pending",
      "payment_required": false,
      "payment_status": "unpaid",
      "hotel": {
        "id": "uuid",
        "name": "Sheraton Addis Hotel",
        "nickname": "ሼራቶን",
        "address": "Taitu Street, Addis Ababa",
        "check_in_time": "14:00:00",
        "check_out_time": "12:00:00"
      },
      "check_in_date": "2026-04-10",
      "check_out_date": "2026-04-13",
      "total_nights": 3,
      "rooms": [
        {
          "id": "uuid",
          "room_id": "uuid",
          "room_name": "Deluxe Suite",
          "bed_type": "king",
          "quantity": 1,
          "price_per_night": "150.00",
          "num_nights": 3,
          "subtotal": "450.00"
        }
      ],
      "num_adults": 2,
      "num_children": 0,
      "total_price": "450.00",
      "currency": "USD",
      "guest_name": "Fitsum Tesfaye",
      "guest_email": "fitsum@example.com",
      "guest_phone": "+251911000000",
      "special_requests": "High floor preferred",
      "confirmed_at": null,
      "cancelled_at": null,
      "cancellation_reason": null,
      "created_at": "2026-03-21T10:00:00Z"
    },
    "payment": {
      "required": true,
      "client_secret": "pi_xxx_secret_yyy",
      "payment_intent_id": "pi_xxx",
      "amount": "450.00",
      "currency": "USD"
    }
  },
  "message": "Booking created successfully",
  "error": null
}
```

Error responses:
- 400 Validation error (invalid dates, room unavailable)
- 404 Hotel not found

---

## 2) My Hotel Bookings (Traveler)

`GET /api/v1/bookings/hotel/mine/`
Auth: Traveler

Query params:
- `status` — filter by status (e.g. `pending`, `confirmed`)

Success response (200): list of booking summaries.

---

## 3) Hotel Booking Detail (Traveler)

`GET /api/v1/bookings/hotel/<booking_id>/`
Auth: Traveler (owns the booking)

---

## 4) Cancel Hotel Booking (Traveler)

`POST /api/v1/bookings/hotel/<booking_id>/cancel/`
Auth: Traveler (owns the booking)

Request body:
```json
{"reason": "Change of plans"}
```

- Only `pending` or `confirmed` bookings can be cancelled.

---

## 5) Provider: List Hotel Bookings

`GET /api/v1/bookings/provider/hotel/`
Auth: Provider (owns hotels)

Query params:
- `status` — filter by status
- `hotel_id` — filter by specific hotel UUID

Returns all bookings across all hotels owned by the authenticated provider.

---

## 6) Provider: Confirm Booking

`POST /api/v1/bookings/provider/hotel/<booking_id>/confirm/`
Auth: Provider (owns the hotel)

- If the hotel requires payment, the booking must have `payment_status = "paid"` before confirming.

Success response (200): full booking detail.
Error responses:
- 400 Payment not received (if payment required but not paid)
- 404 Booking not found or not pending

---

## 7) Provider: Reject Booking

`POST /api/v1/bookings/provider/hotel/<booking_id>/reject/`
Auth: Provider (owns the hotel)

Request body:
```json
{"reason": "No availability for those dates"}
```

- Can reject `pending` or `confirmed` bookings.
- Note: if payment was received and booking is rejected, a manual refund via the Stripe dashboard may be needed.

---

## 8) Create Table Reservation (Traveler)

`POST /api/v1/bookings/restaurant/`
Auth: Traveler

Request body:
```json
{
  "restaurant_id": "uuid",
  "reservation_date": "2026-04-10",
  "reservation_time": "19:00",
  "party_size": 4,
  "guest_name": "Fitsum Tesfaye",
  "guest_email": "fitsum@example.com",
  "guest_phone": "+251911000000",
  "special_requests": "Window seat please"
}
```

- `total_price` = `reservation_deposit_per_person × party_size` (0 if no deposit required).
- If `reservation_payment_required = true` on the restaurant, a Stripe `client_secret` is returned.

Success response (201): same envelope structure as hotel booking, with `reservation` + `payment` keys.

---

## 9) My Reservations (Traveler)

`GET /api/v1/bookings/restaurant/mine/`
Auth: Traveler

Query params:
- `status` — filter by status

---

## 10) Cancel Reservation (Traveler)

`POST /api/v1/bookings/restaurant/<reservation_id>/cancel/`
Auth: Traveler

Request body:
```json
{"reason": "Optional reason"}
```

---

## 11) Provider: List Restaurant Reservations

`GET /api/v1/bookings/provider/restaurant/`
Auth: Provider (owns restaurants)

Query params:
- `status` — filter by status
- `restaurant_id` — filter by specific restaurant UUID
- `date` — filter by date (`YYYY-MM-DD`)

---

## 12) Provider: Confirm Reservation

`POST /api/v1/bookings/provider/restaurant/<reservation_id>/confirm/`
Auth: Provider

---

## 13) Provider: Reject Reservation

`POST /api/v1/bookings/provider/restaurant/<reservation_id>/reject/`
Auth: Provider

Request body:
```json
{"reason": "Fully booked for that time"}
```

---

## 14) Provider: Hotel Dashboard

`GET /api/v1/bookings/provider/dashboard/`
Auth: Provider

Success response (200):
```json
{
  "success": true,
  "data": {
    "pending_bookings": 3,
    "confirmed_bookings_this_month": 24,
    "revenue_this_month": "15420.00",
    "occupancy_rate": 78.0,
    "average_rating": 4.8,
    "total_hotels": 1
  },
  "message": "Dashboard fetched"
}
```

---

## 15) Provider: Calendar View

`GET /api/v1/bookings/provider/calendar/`
Auth: Provider

Query params:
- `year` — default: current year
- `month` — 1–12, default: current month
- `hotel_id` — optional, filter by hotel

Success response (200):
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "booking_id": "uuid",
        "booking_number": "BK-A3FG7Z2X",
        "guest_name": "David Brown",
        "check_in_date": "2026-04-10",
        "check_out_date": "2026-04-13",
        "total_nights": 3,
        "status": "confirmed",
        "total_price": "450.00"
      }
    ],
    "month_stats": {
      "total_nights": 18,
      "total_guests": 24,
      "revenue": "4280.00"
    }
  },
  "message": "Calendar fetched"
}
```

---

## 16) Provider: Earnings

`GET /api/v1/bookings/provider/earnings/`
Auth: Provider

Query params:
- `period` — `this_month` (default) | `last_month` | `this_year`
- `hotel_id` — optional, filter by hotel

Success response (200):
```json
{
  "success": true,
  "data": {
    "period": "this_month",
    "total_revenue": "15420.00",
    "total_bookings": 24,
    "avg_nightly_rate": "145.00",
    "occupancy_rate": 78.0,
    "pending_balance": "680.00",
    "transactions": [
      {
        "id": "uuid",
        "booking_number": "BK-A3FG7Z2X",
        "guest_name": "David Brown",
        "amount": "450.00",
        "currency": "USD",
        "status": "confirmed",
        "date": "2026-04-10T12:00:00Z"
      }
    ]
  },
  "message": "Earnings fetched"
}
```

---

## 17) Create Payment Intent (retry / manual)

`POST /api/v1/bookings/payment/hotel/<booking_id>/create-intent/`
`POST /api/v1/bookings/payment/restaurant/<reservation_id>/create-intent/`
Auth: Traveler (owns the booking/reservation)

Use these if the `client_secret` was null in the booking creation response (e.g. Stripe was temporarily unavailable).

Success response (200):
```json
{
  "success": true,
  "data": {
    "client_secret": "pi_xxx_secret_yyy",
    "payment_intent_id": "pi_xxx",
    "amount": "450.00",
    "currency": "USD"
  },
  "message": "Payment intent created"
}
```

---

## 18) Stripe Webhook

`POST /api/v1/bookings/payment/webhook/`
Auth: None (Stripe signature verification)

Handles:
- `payment_intent.succeeded` → sets `payment_status = "paid"` on booking or reservation
- `payment_intent.payment_failed` → records failed status

Configure in Stripe Dashboard: `https://api.aman.yichalal.ai/api/v1/bookings/payment/webhook/`
