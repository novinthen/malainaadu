# Berita Malaysia - Site Documentation

> Portal Berita Terkini Malaysia | Malaysian News Aggregation Platform

## Overview

**Berita Malaysia** is a Malaysian news aggregation platform that collects and curates news from various trusted Malaysian news sources. The platform presents news in Malay (Bahasa Malaysia) with a modern, responsive interface.

- **URL**: https://beritamalaysia.com
- **Locale**: ms_MY (Malaysian Malay)
- **Twitter**: @BeritaMY

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18 with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | TanStack React Query v5 |
| Routing | React Router v7 |
| Backend | Lovable Cloud (Supabase) |
| SEO | react-helmet-async, JSON-LD |
| Charts | Recharts |
| Icons | Lucide React |

---

## Features

### Public Features

| Feature | Description |
|---------|-------------|
| Breaking News Ticker | Animated ticker displaying urgent news |
| Featured Articles | Hero section with highlighted stories |
| Trending Section | Top 5 most-viewed articles with rankings |
| Category Navigation | Browse by 10+ news categories |
| Full-Text Search | Search articles by title/content |
| Article Views | View count tracking per article |
| Reading Progress | Progress indicator while reading |
| Related Articles | Content suggestions on article pages |
| Dark Mode | Theme toggle support |
| Mobile Bottom Nav | Touch-friendly mobile navigation |

### Admin Features

| Feature | Description |
|---------|-------------|
| Analytics Dashboard | Views, publishing, category charts |
| Real-time Feed | Live activity monitoring |
| Article Moderation | Approve/reject workflow |
| Source Management | Configure RSS feed sources |
| Bulk Actions | Edit/delete multiple articles |

---

## Site Structure

### Public Routes

```
/                    → Homepage (featured, trending, latest)
/berita/:slug        → Article detail page
/kategori            → All categories listing
/kategori/:slug      → Category-specific articles
/trending            → Trending articles page
/terkini             → Latest news page
/cari                → Search page
/tentang             → About us
/privasi             → Privacy policy
/terma               → Terms of use
```

### Admin Routes (Protected)

```
/admin/login         → Google OAuth login
/admin               → Dashboard with analytics
/admin/moderation    → Article moderation queue
/admin/articles      → Article management table
/admin/sources       → RSS source configuration
/admin/settings      → Site settings
```

---

## Data Models

### Articles

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| slug | string | URL-friendly identifier |
| title | string | Article headline |
| content | text | Full article body |
| excerpt | string | Short summary |
| image_url | string | Featured image |
| status | enum | draft, pending, published, rejected |
| is_featured | boolean | Featured flag |
| is_breaking | boolean | Breaking news flag |
| view_count | integer | Total views |
| publish_date | timestamp | Publication date |
| source_id | UUID | Foreign key to sources |
| category_id | UUID | Foreign key to categories |

### Categories

| Name (Malay) | Slug |
|--------------|------|
| Antarabangsa | antarabangsa |
| Ekonomi | ekonomi |
| Hiburan | hiburan |
| Jenayah | jenayah |
| Kesihatan | kesihatan |
| Nasional | nasional |
| Pendidikan | pendidikan |
| Politik | politik |
| Sukan | sukan |
| Teknologi | teknologi |

### Sources

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | string | Source name |
| rss_url | string | RSS feed URL |
| logo_url | string | Source logo |
| is_active | boolean | Active status |

---

## Backend Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `fetch-rss` | Cron (hourly) | Fetches articles from RSS sources |
| `reprocess-articles` | Manual | Reformats article content with AI |
| `sitemap` | HTTP GET | Generates XML sitemap |
| `mobile-api` | HTTP | Mobile app REST API with caching & versioning |

> **Mobile API Documentation**: See [docs/MOBILE_API.md](docs/MOBILE_API.md) for full API reference.

---

## SEO Implementation

### Meta Tags
- Dynamic title/description per page
- Open Graph tags for social sharing
- Twitter Card support
- Canonical URLs

### Structured Data (JSON-LD)
- `NewsArticle` schema for articles
- `WebSite` schema with search action
- `Organization` schema for publisher
- `BreadcrumbList` for navigation

### Technical SEO
- Dynamic XML sitemap at `/sitemap.xml`
- Google News compatible
- Semantic HTML (`<article>`, `<header>`, `<main>`)
- robots.txt configuration

---

## Component Architecture

### Layout Components
```
src/components/layout/
├── Header.tsx          → Main navigation
├── Footer.tsx          → Site footer
├── BottomNav.tsx       → Mobile navigation
├── MainLayout.tsx      → Page wrapper
└── header/
    ├── Logo.tsx        → Site logo
    ├── DesktopNav.tsx  → Desktop menu
    ├── MobileNav.tsx   → Mobile menu (sheet)
    ├── DesktopActions.tsx → Search, theme, auth
    ├── AuthButton.tsx  → Login button
    └── UserMenu.tsx    → User dropdown
```

### Article Components
```
src/components/article/
├── ArticleCard.tsx     → Card wrapper with variants
├── FeaturedCard.tsx    → Large hero card
├── DefaultCard.tsx     → Standard card
├── CompactCard.tsx     → Minimal list item
├── ArticleMeta.tsx     → Date, views, source
├── ArticleBadges.tsx   → Breaking, featured badges
├── ArticleContent.tsx  → Formatted body
├── ArticleHeader.tsx   → Title, breadcrumb
└── ArticleBreadcrumb.tsx → Navigation trail
```

### Admin Components
```
src/components/admin/
├── AdminLayout.tsx     → Admin page wrapper
├── ProtectedRoute.tsx  → Auth guard
├── LiveIndicator.tsx   → Pulse animation
├── RealtimeActivityFeed.tsx → Activity log
├── articles/           → Article management
└── charts/             → Analytics visualizations
```

---

## Design System

### Colors (HSL)
```css
--primary: 0 72.2% 50.6%       /* Red accent */
--background: 0 0% 100%        /* White background */
--foreground: 222.2 84% 4.9%   /* Dark text */
--muted: 210 40% 96.1%         /* Subtle backgrounds */
--accent: 210 40% 96.1%        /* Hover states */
```

### Typography
- **Headings**: Bold, responsive sizing
- **Body**: Clean, readable (1rem base)
- **UI Text**: Muted colors for secondary info

### Breakpoints
- Mobile: < 768px (with bottom nav)
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## Performance

| Optimization | Implementation |
|--------------|----------------|
| Code Splitting | Lazy-loaded admin routes |
| Data Caching | React Query (5min stale, 30min GC) |
| Image Loading | Lazy loading, optimized formats |
| Error Handling | Error boundaries per section |
| Animations | Scroll reveal, framer-motion ready |

---

## Development

### Scripts
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run test         # Run unit tests
npm run lint         # ESLint check
```

### Project Structure
```
src/
├── components/      # React components
├── hooks/           # Custom hooks
├── lib/             # Utilities
├── pages/           # Route pages
├── constants/       # Config values
├── types/           # TypeScript types
└── integrations/    # Supabase client

supabase/
├── functions/       # Edge functions
├── migrations/      # Database migrations
└── config.toml      # Supabase config
```

---

## Contact

**Berita Malaysia**  
Portal Berita Terkini Malaysia

- Website: https://beritamalaysia.com
- Twitter: @BeritaMY
