# Verification, Reviews & Messaging API

Base URL: `https://api.aman.yichalal.ai/api/v1/`

Standard response envelope: `{ success, data, message, error, meta }`

---

## FEATURE 1: VERIFICATION

### How it works

| Entity | Verification targets | Who manages |
|--------|---------------------|-------------|
| Hotel | The property itself | Admin (existing flow via `/api/v1/admin/hotels/`) |
| Restaurant | The property itself | Admin (unified flow) |
| Experience | The experience listing | Admin (unified flow) |
| Tour Guide | The guide as a person | Admin (unified flow) |
| Package | The package listing | Admin (unified flow) |

**Flow:**
```
1. Provider submits → POST /api/v1/admin/verifications/submit/
2. Admin reviews documents, may set requirements → PUT  /api/v1/admin/verifications/<id>/requirements/
3. Admin approves with public comment          → POST /api/v1/admin/verifications/<id>/approve/
   └─ is_verified=True set on the entity
   └─ Admin's verification_comment auto-creates the first pinned review
4. OR Admin rejects                            → POST /api/v1/admin/verifications/<id>/reject/
5. Provider checks status                      → GET  /api/v1/admin/verifications/status/
```

---

### Endpoints

#### Provider: Submit for Verification

`POST /api/v1/admin/verifications/submit/?entity_type=restaurant&entity_id=<uuid>`
Auth: Bearer token (listing owner)

```json
{
  "documents": [
    "https://cdn.example.com/docs/business-license.pdf",
    "https://cdn.example.com/docs/owner-id.jpg"
  ],
  "submitter_notes": "We've been operating since 2018. Inspection can be arranged any weekday."
}
```

Response (201):
```json
{ "success": true, "data": { "id": "uuid", "status": "pending" }, "message": "Verification request submitted successfully" }
```

**entity_type values:** `hotel` | `restaurant` | `experience` | `guide` | `package`

---

#### Provider: Check Verification Status

`GET /api/v1/admin/verifications/status/?entity_type=restaurant&entity_id=<uuid>`
Auth: Bearer token

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "in_review",
    "requirements": ["business_license", "national_id", "physical_inspection"],
    "reviewed_at": null
  }
}
```

**status values:** `pending` | `in_review` | `approved` | `rejected`

---

#### Admin: List All Verification Requests

`GET /api/v1/admin/verifications/`
Auth: Bearer token (admin)

Query params: `status` | `entity_type`

Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entity_type": "restaurant",
      "entity_id": "uuid",
      "status": "pending",
      "submitted_by_email": "owner@example.com",
      "reviewed_by_email": null,
      "reviewed_at": null,
      "created_at": "2026-03-20T10:00:00Z"
    }
  ],
  "meta": { "pagination": { ... } }
}
```

---

#### Admin: View Verification Detail

`GET /api/v1/admin/verifications/<verification_id>/`
Auth: Bearer token (admin)

Response includes: `requirements`, `documents` (submitted URLs), `submitter_notes`, `admin_notes`, `verification_comment`.

---

#### Admin: Set Requirements

`PUT /api/v1/admin/verifications/<verification_id>/requirements/`
Auth: Bearer token (admin)

```json
{ "requirements": ["business_license", "national_id", "physical_inspection"] }
```

Sets status to `in_review`. Provider sees the requirements list when they check status.

---

#### Admin: Approve

`POST /api/v1/admin/verifications/<verification_id>/approve/`
Auth: Bearer token (admin)

```json
{
  "admin_notes": "Visited property on 2026-03-20. Clean, well-maintained.",
  "verification_comment": "AMAN verified this restaurant in person. Staff is welcoming and food quality was excellent during our visit."
}
```

- Sets `is_verified=True` on the entity.
- `verification_comment` auto-creates the first **pinned review** on the listing (shown above all user reviews with the "AMAN Verified" badge).
- `admin_notes` is **internal only** — never shown to travelers.

---

#### Admin: Reject

`POST /api/v1/admin/verifications/<verification_id>/reject/`
Auth: Bearer token (admin)

```json
{ "admin_notes": "Documents submitted were expired. Please resubmit with valid business license." }
```

---

## FEATURE 2: REVIEWS

### Rules

| Rule | Details |
|------|---------|
| First review | Always the admin's `verification_comment` (pinned, labeled "AMAN Verified") |
| Who can review | Only travelers with a **completed** booking or reservation |
| One review per user per listing | Enforced at API level |
| Provider reply | Only the listing owner can reply; one reply per review |
| Admin controls | Can approve/hide/feature any review |

### Permission Matrix

| Action | Who |
|--------|-----|
| Read reviews | Anyone |
| Submit review | Authenticated + completed booking |
| Reply to review | Listing owner only |
| Update/delete reply | Reply author only |
| Approve/feature/hide | Admin only |

---

### Endpoints

#### List Reviews for a Listing

`GET /api/v1/reviews/?type=hotel&id=<uuid>`
Auth: None

Query params:
- `type` — `hotel` | `restaurant` | `experience` (required)
- `id` — UUID of the listing (required)
- `rating` — filter by rating (1–5)

Response (200):
```json
{
  "success": true,
  "pinned": [
    {
      "id": "uuid",
      "author": { "id": null, "name": "AMAN Verified", "is_admin": true },
      "rating": 5,
      "title": "Verified by AMAN",
      "comment": "AMAN verified this restaurant in person. Staff is welcoming...",
      "is_admin_verification": true,
      "is_featured": true,
      "helpful_count": 0,
      "photos": [],
      "response": null,
      "created_at": "2026-03-20T12:00:00Z"
    }
  ],
  "data": [
    {
      "id": "uuid",
      "author": { "id": "uuid", "name": "Fitsum T.", "is_admin": false },
      "rating": 4,
      "title": "Great experience",
      "comment": "Food was amazing, service was a bit slow.",
      "cleanliness_rating": null,
      "location_rating": 5,
      "value_rating": 4,
      "service_rating": 3,
      "food_rating": 5,
      "is_verified_stay": true,
      "is_featured": false,
      "is_admin_verification": false,
      "helpful_count": 12,
      "photos": [],
      "response": {
        "id": "uuid",
        "responder": { "id": "uuid", "name": "Yod Abyssinia" },
        "response_text": "Thank you for your feedback! We're working on improving our service speed.",
        "created_at": "2026-03-22T09:00:00Z"
      },
      "created_at": "2026-03-21T08:00:00Z"
    }
  ],
  "meta": { "pagination": { "count": 24, "current_page": 1, "total_pages": 2 } }
}
```

---

#### Submit a Review (Traveler)

`POST /api/v1/reviews/submit/`
Auth: Bearer token

```json
{
  "reviewable_type": "restaurant",
  "reviewable_id": "uuid",
  "reservation_id": "uuid",
  "rating": 4,
  "title": "Great food, slow service",
  "comment": "The injera was perfect. Service could be faster.",
  "food_rating": 5,
  "service_rating": 3,
  "value_rating": 4,
  "location_rating": 5
}
```

For hotel reviews use `booking_id` instead of `reservation_id`. For experiences use `booking_id`.

**Validation:**
- Returns `400` if user has no completed booking/reservation for this listing.
- Returns `400` if user already submitted a review for this listing.

Response (201):
```json
{ "success": true, "data": { "id": "uuid" }, "message": "Review submitted successfully" }
```

**Sub-ratings by listing type:**

| Type | Available sub-ratings |
|------|----------------------|
| hotel | `cleanliness_rating`, `location_rating`, `value_rating`, `service_rating` |
| restaurant | `food_rating`, `service_rating`, `value_rating`, `location_rating` |
| experience | `value_rating`, `service_rating` |

---

#### Provider: Reply to a Review

`POST /api/v1/reviews/<review_id>/response/`
Auth: Bearer token (listing owner)

```json
{ "response_text": "Thank you for your kind words! We look forward to hosting you again." }
```

Returns `403` if the requester doesn't own the listing.
Returns `400` if a response already exists (use PATCH to update).

`PATCH /api/v1/reviews/<review_id>/response/` — update existing response
`DELETE /api/v1/reviews/<review_id>/response/` — delete response

---

#### Mark Review as Helpful

`POST /api/v1/reviews/<review_id>/helpful/`
Auth: Bearer token

Toggles the helpful vote. Call again to remove.

---

#### Admin: List All Reviews

`GET /api/v1/reviews/admin/`
Auth: Bearer token (admin)

Query params: `is_approved=true|false` | `type=hotel|restaurant|experience`

---

#### Admin: Approve / Feature / Hide a Review

`PATCH /api/v1/reviews/admin/<review_id>/`
Auth: Bearer token (admin)

```json
{ "is_approved": false }
```
or
```json
{ "is_featured": true }
```

---

## FEATURE 3: MESSAGING

### Design

- Travelers **initiate** — a conversation must be linked to a context (hotel, restaurant, experience, or booking).
- Providers **respond** within the same thread.
- **Short polling** — frontend calls `GET /messages/<id>/messages/?after=<timestamp>` on an interval (e.g. every 5 seconds) to check for new messages.
- Admins can **view any conversation** and **resolve disputes** when a traveler flags an issue.
- A conversation between the same two users about the same resource is **reused** (no duplicate threads).

---

### Endpoints

#### List My Conversations

`GET /api/v1/messages/`
Auth: Bearer token

Query params: `related_to_type` — filter by context type

Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "subject": "Question about Room 302",
      "related_to_type": "hotel",
      "related_to_id": "uuid",
      "last_message_at": "2026-03-22T10:30:00Z",
      "is_flagged": false,
      "is_resolved": false,
      "last_message": { "text": "Is breakfast included?", "created_at": "2026-03-22T10:30:00Z" },
      "other_participant": { "id": "uuid", "name": "Sheraton Addis" },
      "unread_count": 2,
      "created_at": "2026-03-22T09:00:00Z"
    }
  ],
  "meta": { "pagination": { ... } }
}
```

---

#### Start a Conversation (Traveler)

`POST /api/v1/messages/start/`
Auth: Bearer token

```json
{
  "recipient_id": "uuid",
  "related_to_type": "hotel",
  "related_to_id": "uuid",
  "subject": "Question about early check-in",
  "message": "Hi, is early check-in available on March 25?"
}
```

**`related_to_type` values:** `hotel` | `restaurant` | `experience` | `booking` | `general`

If a conversation already exists between the same two users about the same resource, it is **reused** (`data.reused = true`).

Response (201):
```json
{ "success": true, "data": { "id": "uuid", "reused": false }, "message": "Conversation started successfully" }
```

---

#### Conversation Detail

`GET /api/v1/messages/<conversation_id>/`
Auth: Bearer token (participant only)

Returns conversation metadata + participants list. Does NOT include messages (use the messages endpoint).

---

#### List Messages (Polling)

`GET /api/v1/messages/<conversation_id>/messages/`
Auth: Bearer token (participant only)

Query params:
- `after` — ISO datetime string. Returns only messages **newer** than this timestamp. Use for polling.

**Polling implementation (Next.js):**
```js
// Store the timestamp of the last message received
let lastFetch = new Date().toISOString();

setInterval(async () => {
  const res = await fetch(
    `/api/v1/messages/${conversationId}/messages/?after=${lastFetch}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  if (data.data.length > 0) {
    appendMessages(data.data);
    lastFetch = new Date().toISOString();
  }
}, 5000); // poll every 5 seconds
```

Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sender": { "id": "uuid", "name": "Fitsum Tesfaye" },
      "message_text": "Hi, is early check-in available on March 25?",
      "attachment_url": null,
      "is_system_message": false,
      "created_at": "2026-03-22T09:01:00Z"
    }
  ],
  "meta": { "pagination": { ... } }
}
```

---

#### Send a Message

`POST /api/v1/messages/<conversation_id>/messages/send/`
Auth: Bearer token (participant only)

```json
{
  "message_text": "Yes, early check-in is available from 10:00 AM for an additional fee.",
  "attachment_url": null
}
```

Response (201):
```json
{ "success": true, "data": { "id": "uuid", "sender": {...}, "message_text": "...", "created_at": "..." }, "message": "Message sent" }
```

---

#### Mark Conversation as Read

`POST /api/v1/messages/<conversation_id>/read/`
Auth: Bearer token

Updates `last_read_at` for the current user → clears unread count.

---

#### Flag Conversation as Dispute (Traveler)

`POST /api/v1/messages/<conversation_id>/flag/`
Auth: Bearer token (participant)

```json
{ "reason": "Provider is not responding and I need a refund for my booking." }
```

- Sets `is_flagged=True` on the conversation.
- Adds a system message to the thread: `[Dispute raised]: <reason>`
- Admin can now see this in the flagged conversations queue.

---

#### Admin: List Flagged Conversations

`GET /api/v1/messages/admin/flagged/`
Auth: Bearer token (admin)

Query params: `is_resolved=true|false`

---

#### Admin: View Any Conversation

`GET /api/v1/messages/admin/<conversation_id>/`
Auth: Bearer token (admin)

Returns full conversation detail including all messages. Admin can access any conversation regardless of participation.

---

#### Admin: Resolve Dispute

`POST /api/v1/messages/admin/<conversation_id>/resolve/`
Auth: Bearer token (admin)

```json
{ "resolution_note": "Refund has been processed. Provider has been warned." }
```

- Sets `is_resolved=True`.
- Adds a system message: `[Admin resolved dispute]: <resolution_note>`

---

## Migration

Run after pulling:
```bash
docker compose exec web python manage.py makemigrations admin_panel reviews messaging
docker compose exec web python manage.py migrate
```

---

## Next.js Integration Summary

### Verification
```js
// Provider submits listing for verification
await fetch(`/api/v1/admin/verifications/submit/?entity_type=restaurant&entity_id=${id}`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ documents: [...], submitter_notes: '...' })
});

// Provider checks status
const status = await fetch(`/api/v1/admin/verifications/status/?entity_type=restaurant&entity_id=${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Reviews
```js
// Fetch reviews (public)
const reviews = await fetch(`/api/v1/reviews/?type=hotel&id=${hotelId}`);

// Pinned admin review is in reviews.pinned[]
// User reviews are in reviews.data[]

// Submit a review
await fetch('/api/v1/reviews/submit/', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ reviewable_type: 'hotel', reviewable_id: id, booking_id: bookingId, rating: 5, comment: '...' })
});

// Provider reply
await fetch(`/api/v1/reviews/${reviewId}/response/`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ response_text: 'Thank you!' })
});
```

### Messaging
```js
// Start a conversation
const conv = await fetch('/api/v1/messages/start/', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipient_id: providerId,
    related_to_type: 'hotel',
    related_to_id: hotelId,
    subject: 'Check-in question',
    message: 'Is early check-in possible?'
  })
});
const { id: conversationId } = conv.data;

// Send a message
await fetch(`/api/v1/messages/${conversationId}/messages/send/`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ message_text: 'Hello!' })
});

// Poll for new messages (every 5 seconds)
let lastFetch = new Date().toISOString();
setInterval(async () => {
  const res = await fetch(`/api/v1/messages/${conversationId}/messages/?after=${lastFetch}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const { data } = await res.json();
  if (data.length > 0) { appendMessages(data); lastFetch = new Date().toISOString(); }
}, 5000);

// Flag a dispute
await fetch(`/api/v1/messages/${conversationId}/flag/`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ reason: 'Provider is unresponsive.' })
});
```
