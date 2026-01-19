export const ROUTES = {
  HOME: '/',
  ARTICLE: (slug: string) => `/berita/${slug}`,
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
  name: 'செய்தி மலேசியா',
  tagline: 'மலேசியாவின் சமீபத்திய செய்தி போர்டல்',
  description: 'மலேசியாவின் சமீபத்திய செய்தி போர்டல். மலேசியாவின் நம்பகமான பல ஆதாரங்களிலிருந்து சமீபத்திய செய்திகளைப் பெறுங்கள்.',
  url: 'https://malainaadu.com',
  locale: 'ta_MY',
  language: 'ta',
  author: 'செய்தி மலேசியா',
  twitterHandle: '@SeithiMY',
} as const;
