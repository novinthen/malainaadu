/**
 * Date formatting utilities
 * Centralized date formatting for consistent display across the app
 */

import { formatDistanceToNow, format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { ms } from 'date-fns/locale';

/**
 * Format a date as relative time (e.g., "2 jam lalu")
 */
export function formatTimeAgo(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ms });
}

/**
 * Format a date as short relative time for Tamil (e.g., "2 மணி நேரம் முன்")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const now = new Date();
  const dateObj = new Date(date);
  
  const minutes = differenceInMinutes(now, dateObj);
  const hours = differenceInHours(now, dateObj);
  const days = differenceInDays(now, dateObj);
  
  // Show "இன்று HH:mm" for articles less than an hour old
  if (minutes < 60) return `இன்று ${format(dateObj, 'HH:mm')}`;
  if (hours < 24) return `${hours} மணி நேரம் முன்`;
  if (days === 1) return 'நேற்று';
  if (days < 7) return `${days} நாள் முன்`;
  
  return format(dateObj, 'd MMM', { locale: ms });
}

/**
 * Format a date for article display (e.g., "12 Januari 2024, 14:30")
 */
export function formatPublishDate(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  return format(new Date(date), 'd MMMM yyyy, HH:mm', { locale: ms });
}

/**
 * Format a date in short format (e.g., "12 Jan 2024")
 */
export function formatShortDate(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  return format(new Date(date), 'd MMM yyyy', { locale: ms });
}

/**
 * Format a date for admin tables (e.g., "12/01/2024")
 */
export function formatTableDate(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  return format(new Date(date), 'dd/MM/yyyy', { locale: ms });
}

/**
 * Format datetime for forms (e.g., "2024-01-12T14:30")
 */
export function formatDateTimeLocal(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
}
