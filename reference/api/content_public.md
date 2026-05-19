# Content API (Public)

Base path: `/api/v1/content/`
Authentication: Not required

Standard response format:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "error": null,
  "meta": {
    "pagination": {},
    "request_id": "uuid"
  }
}
```

Media URLs:
- Image fields (for example, `cover_photo_url`, `photo_url`, `cover_image_url`) are returned as file URLs under `/media/`.
- Example: `/media/content/cities/addis.jpg`

Pagination:
- List endpoints return `meta.pagination` with `count`, `page`, `page_size`, `num_pages`, `next`, `previous`.
- Detail endpoints may include `meta.request_id` only.

---

## 1) List Cities

`GET /api/v1/content/cities/`

Query params:
- `is_popular` (boolean)
- `search` (string)
- `page` (int)
- `page_size` (int)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Addis Ababa",
      "nickname": "አዲስ አበባ",
      "slug": "addis-ababa",
      "country": "Ethiopia",
      "short_description": "Capital city",
      "cover_photo_url": "/media/content/cities/addis.jpg",
      "is_popular": true,
      "display_order": 1
    }
  ],
  "message": "Cities fetched successfully",
  "error": null,
  "meta": {
    "pagination": {
      "count": 1,
      "page": 1,
      "page_size": 10,
      "num_pages": 1,
      "next": null,
      "previous": null
    }
  }
}
```

---

## 2) City Detail

`GET /api/v1/content/cities/{slug}/`

Path params:
- `slug` (string)

Success response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Addis Ababa",
    "nickname": "አዲስ አበባ",
    "slug": "addis-ababa",
    "country": "Ethiopia",
    "description": "Capital city details",
    "short_description": "Capital city",
    "latitude": 9.032,
    "longitude": 38.747,
    "timezone": "Africa/Addis_Ababa",
    "is_popular": true,
    "display_order": 1,
    "cover_photo_url": "/media/content/cities/addis.jpg",
    "meta_title": "Visit Addis Ababa",
    "meta_description": "Explore the capital",
    "attractions_count": 12,
    "safety_info_summary": {
      "total": 3,
      "levels": {
        "safe": 2,
        "caution": 1
      }
    }
  },
  "message": "City fetched successfully",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 404 City not found

---

## 3) List Attractions

`GET /api/v1/content/attractions/`

Query params:
- `city` (uuid)
- `category` (string, one of Attraction.Category)
- `is_active` (boolean)
- `page` (int)
- `page_size` (int)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "National Museum",
      "nickname": "ብሔራዊ ሙዚየም",
      "slug": "national-museum",
      "category": "museum",
      "city": "uuid",
      "city_name": "Addis Ababa",
      "photo_url": "/media/content/attractions/museum.jpg",
      "is_active": true
    }
  ],
  "message": "Attractions fetched successfully",
  "error": null,
  "meta": {
    "pagination": {
      "count": 1,
      "page": 1,
      "page_size": 10,
      "num_pages": 1,
      "next": null,
      "previous": null
    }
  }
}
```

---

## 4) Attraction Detail

`GET /api/v1/content/attractions/{slug}/`

Path params:
- `slug` (string)

Success response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "city": "uuid",
    "city_name": "Addis Ababa",
    "name": "National Museum",
    "nickname": "ብሔራዊ ሙዚየም",
    "slug": "national-museum",
    "description": "Historic artifacts",
    "category": "museum",
    "address": "Museum Road",
    "latitude": 9.04,
    "longitude": 38.76,
    "opening_hours": {"monday": "09:00-17:00"},
    "entry_fee": "200.00",
    "photo_url": "/media/content/attractions/museum.jpg",
    "photos": ["/media/content/attractions/museum_2.jpg"],
    "is_active": true,
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-02T10:00:00Z"
  },
  "message": "Attraction fetched successfully",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 404 Attraction not found

---

## 5) List Safety Information

`GET /api/v1/content/safety/`

Query params:
- `city` (uuid)
- `safety_level` (string, one of SafetyInformation.SafetyLevel)
- `page` (int)
- `page_size` (int)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "city": "uuid",
      "area_name": "Downtown",
      "safety_level": "safe",
      "title": "Downtown Safety",
      "description": "Generally safe area",
      "tips": ["Keep valuables secure"],
      "emergency_numbers": ["911"],
      "last_updated_by": "uuid",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-02T10:00:00Z"
    }
  ],
  "message": "Safety information fetched successfully",
  "error": null,
  "meta": {
    "pagination": {
      "count": 1,
      "page": 1,
      "page_size": 10,
      "num_pages": 1,
      "next": null,
      "previous": null
    }
  }
}
```

---

## 6) List Cultural Guides

`GET /api/v1/content/cultural-guides/`

Query params:
- `category` (string, one of CulturalGuide.Category)
- `page` (int)
- `page_size` (int)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Local Etiquette",
      "slug": "local-etiquette",
      "category": "etiquette",
      "content": "Be respectful",
      "icon": "handshake",
      "display_order": 1,
      "is_published": true,
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-02T10:00:00Z"
    }
  ],
  "message": "Cultural guides fetched successfully",
  "error": null,
  "meta": {
    "pagination": {
      "count": 1,
      "page": 1,
      "page_size": 10,
      "num_pages": 1,
      "next": null,
      "previous": null
    }
  }
}
```

---

## 7) Cultural Guide Detail

`GET /api/v1/content/cultural-guides/{slug}/`

Path params:
- `slug` (string)

Success response (200): Same shape as list item with full `content`.

Error responses:
- 404 Cultural guide not found

---

## 8) List Scam Warnings

`GET /api/v1/content/scam-warnings/`

Query params:
- `severity` (string, one of ScamWarning.Severity)
- `category` (string, one of ScamWarning.Category)
- `page` (int)
- `page_size` (int)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Taxi Scam",
      "description": "Overcharging tourists",
      "prevention_tips": ["Agree price before ride"],
      "severity": "moderate",
      "category": "taxi",
      "is_active": true,
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-02T10:00:00Z"
    }
  ],
  "message": "Scam warnings fetched successfully",
  "error": null,
  "meta": {
    "pagination": {
      "count": 1,
      "page": 1,
      "page_size": 10,
      "num_pages": 1,
      "next": null,
      "previous": null
    }
  }
}
```

---

## 9) Scam Warning Detail

`GET /api/v1/content/scam-warnings/{warning_id}/`

Path params:
- `warning_id` (uuid)

Success response (200): Same shape as list item.

Error responses:
- 404 Scam warning not found

---

## 10) List FAQs

`GET /api/v1/content/faqs/`

Query params:
- `category` (string)
- `page` (int)
- `page_size` (int)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "category": "booking",
      "question": "How do I book a hotel?",
      "answer": "Use the booking endpoint.",
      "display_order": 1,
      "view_count": 0,
      "is_published": true,
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-02T10:00:00Z"
    }
  ],
  "message": "FAQs fetched successfully",
  "error": null,
  "meta": {
    "pagination": {
      "count": 1,
      "page": 1,
      "page_size": 10,
      "num_pages": 1,
      "next": null,
      "previous": null
    }
  }
}
```

---

## 11) FAQ Detail

`GET /api/v1/content/faqs/{faq_id}/`

Path params:
- `faq_id` (uuid)

Success response (200): Same shape as list item.

Error responses:
- 404 FAQ not found

---

## 12) List Blog Posts

`GET /api/v1/content/blog/`

Query params:
- `category` (string)
- `search` (string, matches title or content)
- `page` (int)
- `page_size` (int)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Top 5 places",
      "slug": "top-5-places",
      "excerpt": "Highlights",
      "cover_image_url": "/media/content/blog/top5.jpg",
      "category": "travel",
      "is_published": true,
      "is_featured": false,
      "published_at": "2025-01-01T10:00:00Z",
      "view_count": 10
    }
  ],
  "message": "Blog posts fetched successfully",
  "error": null,
  "meta": {
    "pagination": {
      "count": 1,
      "page": 1,
      "page_size": 10,
      "num_pages": 1,
      "next": null,
      "previous": null
    }
  }
}
```

---

## 13) Blog Post Detail

`GET /api/v1/content/blog/{slug}/`

Path params:
- `slug` (string)

Success response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "author_id": "uuid",
    "title": "Top 5 places",
    "slug": "top-5-places",
    "excerpt": "Highlights",
    "content": "Full content",
    "cover_image_url": "/media/content/blog/top5.jpg",
    "category": "travel",
    "tags": ["addis", "history"],
    "is_published": true,
    "is_featured": false,
    "published_at": "2025-01-01T10:00:00Z",
    "view_count": 10,
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-02T10:00:00Z"
  },
  "message": "Blog post fetched successfully",
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Error responses:
- 404 Blog post not found

---

## 14) List Exchange Rates

`GET /api/v1/content/exchange-rates/`

Query params:
- `from_currency` (string, 3-letter ISO)
- `to_currency` (string, 3-letter ISO)
- `effective_date` (YYYY-MM-DD)
- `page` (int)
- `page_size` (int)

Success response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "from_currency": "USD",
      "to_currency": "ETB",
      "rate": "55.123456",
      "effective_date": "2025-01-01",
      "is_active": true,
      "created_at": "2025-01-01T10:00:00Z"
    }
  ],
  "message": "Exchange rates fetched successfully",
  "error": null,
  "meta": {
    "pagination": {
      "count": 1,
      "page": 1,
      "page_size": 10,
      "num_pages": 1,
      "next": null,
      "previous": null
    }
  }
}
```
