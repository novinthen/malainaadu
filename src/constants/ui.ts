/**
 * UI Constants
 * Centralized UI strings, labels, and mappings
 */

import type { ArticleStatus } from '@/types/database';

// Status labels in Malay
export const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'Draf',
  pending: 'Menunggu',
  published: 'Diterbitkan',
  rejected: 'Ditolak',
};

// Status badge colors using semantic tokens
export const STATUS_COLORS: Record<ArticleStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-destructive/10 text-destructive',
};

// Common UI text strings in Malay
export const UI_TEXT = {
  // Loading states
  loading: 'Memuatkan...',
  
  // Empty states
  noResults: 'Tiada hasil ditemui',
  noArticles: 'Tiada artikel ditemui',
  
  // Actions
  save: 'Simpan',
  cancel: 'Batal',
  delete: 'Padam',
  edit: 'Edit',
  view: 'Lihat',
  search: 'Cari',
  filter: 'Tapis',
  back: 'Kembali',
  share: 'Kongsi',
  
  // Auth
  signIn: 'Log Masuk',
  signOut: 'Log Keluar',
  signInWithGoogle: 'Log Masuk dengan Google',
  
  // Article
  readMore: 'Baca lagi',
  readOriginal: 'Baca penuh di sumber asal',
  views: 'paparan',
  minRead: 'min bacaan',
  breakingNews: 'Terkini',
  featured: 'Pilihan',
  
  // Navigation
  home: 'Utama',
  categories: 'Kategori',
  trending: 'Trending',
  latest: 'Terkini',
  
  // Errors
  notFound: 'Tidak Ditemui',
  articleNotFound: 'Berita Tidak Ditemui',
  articleNotFoundDesc: 'Maaf, berita yang anda cari tidak dapat ditemui.',
  errorOccurred: 'Ralat telah berlaku',
  
  // Success messages
  linkCopied: 'Pautan telah disalin!',
  articleUpdated: 'Artikel telah dikemaskini!',
  articleDeleted: 'Artikel telah dipadam!',
  
  // Error messages
  updateFailed: 'Gagal mengemaskini artikel',
  deleteFailed: 'Gagal memadam artikel',
  signInFailed: 'Gagal log masuk dengan Google',
  signOutFailed: 'Gagal log keluar',
  signOutSuccess: 'Berjaya log keluar',
} as const;

// Default limits
export const DEFAULTS = {
  articlesPerPage: 20,
  trendingLimit: 5,
  relatedArticlesLimit: 4,
  breakingNewsLimit: 10,
  adminArticlesLimit: 100,
} as const;
