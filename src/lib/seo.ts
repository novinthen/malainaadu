import { SITE_CONFIG } from '@/constants/routes';

/**
 * Truncate text to a maximum length, adding ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Generate a meta description from article content
 */
export function generateMetaDescription(
  content: string,
  excerpt?: string | null,
  maxLength = 155
): string {
  const text = excerpt || content;
  // Remove extra whitespace and newlines
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return truncateText(cleaned, maxLength);
}

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}

/**
 * Format date for structured data (ISO 8601)
 */
export function formatDateForSchema(date: string | null | undefined): string | undefined {
  if (!date) return undefined;
  try {
    return new Date(date).toISOString();
  } catch {
    return undefined;
  }
}

/**
 * Generate article keywords from category and source
 */
export function generateArticleKeywords(
  categoryName?: string | null,
  sourceName?: string | null,
  additionalKeywords: string[] = []
): string[] {
  const keywords = ['berita', 'malaysia', 'terkini'];
  
  if (categoryName) {
    keywords.push(categoryName.toLowerCase());
  }
  
  if (sourceName) {
    keywords.push(sourceName.toLowerCase());
  }
  
  return [...keywords, ...additionalKeywords];
}

/**
 * Sanitize text for use in meta tags
 */
export function sanitizeMetaText(text: string): string {
  return text
    .replace(/[<>]/g, '')
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
