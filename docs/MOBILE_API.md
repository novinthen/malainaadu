# Malainaadu Mobile API Documentation

> Version: v1  
> Last Updated: January 2026

## Overview

The Malainaadu Mobile API provides RESTful endpoints for fetching Tamil news articles, categories, and managing push notification subscriptions. This API is designed specifically for mobile applications (Android & iOS).

### Base URL

```
https://dwopahjycvaocermgesw.supabase.co/functions/v1/mobile-api
```

### Key Features

- **HTTPS Only** - All connections are encrypted
- **CORS Enabled** - Works with web and mobile apps
- **JSON Format** - All responses are JSON
- **ETag Support** - Efficient caching with conditional requests
- **API Versioning** - URL path versioning for backward compatibility

---

## API Versioning

Include the version prefix in your URL path. Current version is `v1`.

```
/v1/news/featured
/v1/categories
/v1/news/trending
```

**Backward Compatibility:** Requests without version prefix default to `v1`:
```
/news/featured → /v1/news/featured
```

---

## Authentication

**No authentication required** for read endpoints. All news and category endpoints are publicly accessible.

Push notification endpoints require valid device tokens but no user authentication.

---

## Common Headers

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes (POST) | `application/json` for POST requests |
| `If-None-Match` | No | ETag value for conditional requests |
| `X-Platform` | No | `android` or `ios` (for analytics) |
| `X-Device-Token` | No | Device identifier (for push) |

### Response Headers

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `X-API-Version` | Current API version (e.g., `v1`) |
| `ETag` | Resource hash for caching |
| `Cache-Control` | Caching directives |
| `Last-Modified` | Last modification timestamp |

---

## Pagination

All list endpoints support pagination with the following query parameters:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number (1-indexed) |
| `per_page` | integer | 20 | 50 | Items per page |
| `since` | ISO date | - | - | Filter articles published after this date |
| `order` | string | `desc` | - | Sort order: `asc` or `desc` |

### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "api_version": "v1"
  }
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5,
    "api_version": "v1"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 304 | Not Modified (cache hit) |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Caching & ETags

The API uses HTTP caching headers to reduce bandwidth and improve performance.

### Cache-Control Settings

| Endpoint | max-age | stale-while-revalidate | Notes |
|----------|---------|------------------------|-------|
| `/health` | 30s | 60s | Frequently changes |
| `/stats` | 30s | 60s | Frequently changes |
| `/categories` | 1 hour | 2 hours | Rarely changes |
| `/news/featured` | 1 min | 5 min | Updates regularly |
| `/news/trending` | 2 min | 10 min | View counts change |
| `/news/breaking` | 30s | 1 min | Time-sensitive |
| `/news/:slug` | 5 min | 30 min | Content stable |

### Using ETags (Conditional Requests)

1. **First request** - Store the `ETag` header value:
   ```
   ETag: "a1b2c3d4"
   ```

2. **Subsequent requests** - Send `If-None-Match` header:
   ```
   If-None-Match: "a1b2c3d4"
   ```

3. **If content unchanged** - Server returns `304 Not Modified` (no body)

4. **If content changed** - Server returns `200 OK` with new data and ETag

### Example Implementation (Kotlin)

```kotlin
val request = Request.Builder()
    .url("$BASE_URL/v1/news/featured")
    .header("If-None-Match", cachedETag)
    .build()

val response = client.newCall(request).execute()

if (response.code == 304) {
    // Use cached data
} else {
    // Parse new data
    val newETag = response.header("ETag")
    // Store newETag for next request
}
```

---

## Endpoints

### Health Check

#### `GET /v1/health`

Check API health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-22T10:30:00.000Z",
    "version": "v1"
  }
}
```

---

### Categories

#### `GET /v1/categories`

List all news categories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Nasional",
      "slug": "nasional"
    },
    {
      "id": "uuid",
      "name": "Antarabangsa",
      "slug": "antarabangsa"
    }
  ]
}
```

---

### Featured Articles

#### `GET /v1/news/featured`

Get featured and latest articles.

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| `page` | Page number |
| `per_page` | Items per page (max 50) |
| `since` | ISO date filter |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "article-slug-abc123",
      "title": "Article Title",
      "excerpt": "Brief summary...",
      "image_url": "https://...",
      "category": {
        "id": "uuid",
        "name": "Nasional",
        "slug": "nasional"
      },
      "source": {
        "name": "Source Name",
        "logo_url": "https://..."
      },
      "is_featured": true,
      "is_breaking": false,
      "view_count": 1234,
      "publish_date": "2026-01-22T08:00:00.000Z",
      "read_time": 5
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "api_version": "v1"
  }
}
```

---

### Trending Articles

#### `GET /v1/news/trending`

Get articles sorted by view count.

**Query Parameters:** Same as featured

**Response:** Same structure as featured

---

### Breaking News

#### `GET /v1/news/breaking`

Get breaking news articles only.

**Query Parameters:** Same as featured

**Response:** Same structure as featured (only articles with `is_breaking: true`)

---

### Category Articles

#### `GET /v1/news/category/:slug`

Get articles by category.

**Path Parameters:**
| Parameter | Description |
|-----------|-------------|
| `slug` | Category slug (e.g., `nasional`, `sukan`) |

**Query Parameters:** Same as featured

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid",
      "name": "Nasional",
      "slug": "nasional"
    },
    "articles": [...]
  },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3,
    "api_version": "v1"
  }
}
```

---

### Search Articles

#### `GET /v1/news/search`

Search articles by title, content, or excerpt.

**Query Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `q` | Yes | Search query (min 2 characters) |
| `page` | No | Page number |
| `per_page` | No | Items per page |

**Example:**
```
GET /v1/news/search?q=ekonomi&page=1&per_page=10
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 25,
    "total_pages": 3,
    "query": "ekonomi",
    "api_version": "v1"
  }
}
```

---

### Article Detail

#### `GET /v1/news/:slug`

Get single article with full content.

**Path Parameters:**
| Parameter | Description |
|-----------|-------------|
| `slug` | Article slug |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "article-slug-abc123",
    "title": "Full Article Title",
    "content": "<p>Full HTML content...</p>",
    "excerpt": "Brief summary...",
    "image_url": "https://...",
    "category": {
      "id": "uuid",
      "name": "Nasional",
      "slug": "nasional"
    },
    "source": {
      "name": "Source Name",
      "logo_url": "https://..."
    },
    "is_featured": true,
    "is_breaking": false,
    "view_count": 1235,
    "publish_date": "2026-01-22T08:00:00.000Z",
    "read_time": 5,
    "original_url": "https://source.com/article",
    "created_at": "2026-01-22T07:00:00.000Z",
    "updated_at": "2026-01-22T08:00:00.000Z"
  },
  "meta": {
    "api_version": "v1"
  }
}
```

**Slug Redirects:** If an article's slug has changed, the API automatically redirects:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "redirected_from": "old-article-slug",
    "api_version": "v1"
  }
}
```

---

### Push Notifications

#### `POST /v1/notifications/subscribe`

Subscribe a device for push notifications.

**Request Body:**
```json
{
  "device_token": "fcm_token_string",
  "platform": "android",
  "device_info": {
    "model": "Samsung Galaxy S24",
    "os_version": "14"
  },
  "categories": ["nasional", "sukan"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `device_token` | string | Yes | FCM/APNS token |
| `platform` | string | Yes | `android` or `ios` |
| `device_info` | object | No | Device metadata |
| `categories` | string[] | No | Category slugs to subscribe |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "subscribed": true,
    "categories": ["nasional", "sukan"]
  }
}
```

---

#### `POST /v1/notifications/unsubscribe`

Unsubscribe a device from push notifications.

**Request Body:**
```json
{
  "device_token": "fcm_token_string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unsubscribed": true
  }
}
```

---

### API Stats

#### `GET /v1/stats`

Get API statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_articles": 1500,
    "total_categories": 10,
    "active_subscribers": 250,
    "api_version": "v1"
  }
}
```

---

## Error Handling

### Common Errors

| Error | Code | Description |
|-------|------|-------------|
| Category not found | 404 | Invalid category slug |
| Article not found | 404 | Invalid article slug |
| Search query too short | 400 | Query must be ≥2 characters |
| Missing required fields | 400 | POST body missing fields |
| Invalid platform | 400 | Platform must be android/ios |

### Error Response Example

```json
{
  "success": false,
  "error": "Category not found"
}
```

---

## Rate Limiting

Currently no rate limiting is enforced, but please implement reasonable request patterns:

- Cache responses using ETags
- Implement exponential backoff on errors
- Batch requests where possible
- Use `since` parameter for incremental sync

---

## Best Practices

### 1. Use Conditional Requests

Always store and send ETags to minimize bandwidth:

```kotlin
// Store ETag from response
val etag = response.header("ETag")
prefs.edit().putString("featured_etag", etag).apply()

// Send on next request
val request = Request.Builder()
    .url(url)
    .header("If-None-Match", prefs.getString("featured_etag", ""))
    .build()
```

### 2. Implement Offline-First

- Cache article lists locally
- Use `since` parameter to fetch only new articles
- Show cached content while fetching updates

### 3. Incremental Sync

```kotlin
// Get last sync time
val lastSync = prefs.getString("last_sync", null)

// Fetch only new articles
val url = "$BASE_URL/v1/news/featured?since=$lastSync"
```

### 4. Handle Redirects

Check `meta.redirected_from` to update stored article slugs:

```kotlin
response.meta?.redirected_from?.let { oldSlug ->
    // Update local database with new slug
    db.updateArticleSlug(oldSlug, article.slug)
}
```

---

## Support

For API issues or questions, contact the Malainaadu development team.

---

## Changelog

### v1 (January 2026)
- Initial API release
- Added ETag and Cache-Control support
- Added API versioning with `/v1/` prefix
- Push notification subscription endpoints
