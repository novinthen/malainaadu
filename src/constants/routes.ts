export const ROUTES = {
  HOME: '/',
  ARTICLE: (id: string) => `/berita/${id}`,
  CATEGORY: (slug: string) => `/kategori/${slug}`,
  CATEGORIES: '/kategori',
  TRENDING: '/trending',
  LATEST: '/terkini',
  SEARCH: '/cari',
  ABOUT: '/tentang',
  PRIVACY: '/privasi',
  TERMS: '/terma',
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin',
    MODERATION: '/admin/moderation',
    ARTICLES: '/admin/articles',
    SOURCES: '/admin/sources',
    SETTINGS: '/admin/settings',
  },
} as const;

export const SITE_CONFIG = {
  name: 'Berita Malaysia',
  tagline: 'Portal Berita Terkini Malaysia',
  description: 'Portal berita terkini Malaysia. Dapatkan berita terbaru dari pelbagai sumber terpercaya di Malaysia.',
  url: 'https://beritamalaysia.com',
  locale: 'ms_MY',
  language: 'ms',
  author: 'Berita Malaysia',
  twitterHandle: '@BeritaMY',
} as const;
