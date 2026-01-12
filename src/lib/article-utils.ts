/**
 * Article utility functions
 * Centralized utilities for article content processing
 */

// UUID v4 regex pattern for detecting old-style URLs
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute for Malay/English
 */
export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Process article content into paragraphs
 */
export function processContentToParagraphs(content: string): string[] {
  // Check if content has newlines
  if (content.includes('\n')) {
    return content
      .split(/\n+/)
      .filter((p) => p.trim());
  }
  // No newlines - break into sentence groups (3-4 sentences per paragraph)
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const groups: string[] = [];
  const sentencesPerGroup = 3;
  for (let i = 0; i < sentences.length; i += sentencesPerGroup) {
    groups.push(sentences.slice(i, i + sentencesPerGroup).join(' ').trim());
  }
  return groups;
}

/**
 * Extract a compelling pull quote from the article content
 */
export function extractPullQuote(paragraphs: string[]): string | null {
  // Look for a compelling sentence from paragraphs 2-4
  for (const p of paragraphs.slice(1, 5)) {
    const sentences = p.match(/[^.!?]+[.!?]+/g) || [];
    const quote = sentences.find(s => s.length > 60 && s.length < 180);
    if (quote) return quote.trim();
  }
  return null;
}

/**
 * Check if a string is a valid UUID
 */
export function isUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}
