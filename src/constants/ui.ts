/**
 * UI Constants
 * Centralized UI strings, labels, and mappings in Malaysian Tamil
 */

import type { ArticleStatus } from '@/types/database';

// Status labels in Tamil
export const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'வரைவு',
  pending: 'நிலுவையில்',
  published: 'வெளியிடப்பட்டது',
  rejected: 'நிராகரிக்கப்பட்டது',
};

// Status badge colors using semantic tokens
export const STATUS_COLORS: Record<ArticleStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-destructive/10 text-destructive',
};

// Common UI text strings in Malaysian Tamil
export const UI_TEXT = {
  // Loading states
  loading: 'ஏற்றுகிறது...',
  
  // Empty states
  noResults: 'முடிவுகள் இல்லை',
  noArticles: 'செய்திகள் இல்லை',
  
  // Actions
  save: 'சேமி',
  cancel: 'ரத்து',
  delete: 'நீக்கு',
  edit: 'திருத்து',
  view: 'பார்',
  search: 'தேடு',
  filter: 'வடிகட்டு',
  back: 'திரும்பு',
  share: 'பகிர்',
  
  // Auth
  signIn: 'உள்நுழை',
  signOut: 'வெளியேறு',
  signInWithGoogle: 'Google மூலம் உள்நுழையுங்கள்',
  
  // Article
  readMore: 'மேலும் படிக்க',
  readOriginal: 'மூல தளத்தில் முழுமையாக படிக்க',
  views: 'பார்வைகள்',
  minRead: 'நிமிட வாசிப்பு',
  breakingNews: 'முக்கிய செய்தி',
  featured: 'சிறப்பு',
  
  // Navigation
  home: 'முகப்பு',
  categories: 'வகைகள்',
  trending: 'டிரெண்டிங்',
  latest: 'சமீபத்திய',
  
  // Errors
  notFound: 'கிடைக்கவில்லை',
  articleNotFound: 'செய்தி கிடைக்கவில்லை',
  articleNotFoundDesc: 'மன்னிக்கவும், நீங்கள் தேடும் செய்தி கிடைக்கவில்லை.',
  errorOccurred: 'பிழை ஏற்பட்டது',
  
  // Success messages
  linkCopied: 'இணைப்பு நகலெடுக்கப்பட்டது!',
  articleUpdated: 'செய்தி புதுப்பிக்கப்பட்டது!',
  articleDeleted: 'செய்தி நீக்கப்பட்டது!',
  
  // Error messages
  updateFailed: 'செய்தியைப் புதுப்பிக்க முடியவில்லை',
  deleteFailed: 'செய்தியை நீக்க முடியவில்லை',
  signInFailed: 'Google மூலம் உள்நுழைய முடியவில்லை',
  signOutFailed: 'வெளியேற முடியவில்லை',
  signOutSuccess: 'வெற்றிகரமாக வெளியேறினீர்கள்',

  // Bulk actions
  selectAll: 'அனைத்தையும் தேர்',
  selected: 'தேர்ந்தெடுக்கப்பட்டது',
  bulkPublish: 'வெளியிடு',
  bulkFeature: 'சிறப்பு',
  bulkUnfeature: 'சிறப்பு நீக்கு',
  bulkDeleteConfirmTitle: 'செய்திகளை நீக்க விரும்புகிறீர்களா?',
  bulkDeleteConfirmDesc: '{count} செய்திகளை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? இந்தச் செயலை மீட்க முடியாது.',
  bulkPublishSuccess: '{count} செய்திகள் வெளியிடப்பட்டன!',
  bulkDeleteSuccess: '{count} செய்திகள் நீக்கப்பட்டன!',
  bulkFeatureSuccess: '{count} செய்திகள் சிறப்பாக்கப்பட்டன!',
  bulkUnfeatureSuccess: '{count} செய்திகளில் சிறப்பு நீக்கப்பட்டது!',
} as const;

// Default limits
export const DEFAULTS = {
  articlesPerPage: 20,
  trendingLimit: 5,
  relatedArticlesLimit: 4,
  breakingNewsLimit: 10,
  adminArticlesLimit: 100,
} as const;
