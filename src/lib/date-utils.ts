/**
 * Date formatting utilities
 * Centralized date formatting for consistent display across the app
 * All times are displayed in Malaysia timezone (Asia/Kuala_Lumpur, UTC+8)
 */

import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { ms } from 'date-fns/locale';

const MALAYSIA_TZ = 'Asia/Kuala_Lumpur';

/**
 * Format a date as relative time (e.g., "2 jam lalu")
 */
export function formatTimeAgo(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  const now = toZonedTime(new Date(), MALAYSIA_TZ);
  const dateObj = toZonedTime(new Date(date), MALAYSIA_TZ);
  
  const minutes = differenceInMinutes(now, dateObj);
  const hours = differenceInHours(now, dateObj);
  const days = differenceInDays(now, dateObj);
  
  if (minutes < 1) return 'baru sahaja';
  if (minutes < 60) return `${minutes} minit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return 'semalam';
  if (days < 7) return `${days} hari lalu`;
  
  return formatInTimeZone(new Date(date), MALAYSIA_TZ, 'd MMM yyyy', { locale: ms });
}

/**
 * Format a date as short relative time for Tamil (e.g., "2 மணி நேரம் முன்")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const now = toZonedTime(new Date(), MALAYSIA_TZ);
  const dateObj = toZonedTime(new Date(date), MALAYSIA_TZ);
  
  const minutes = differenceInMinutes(now, dateObj);
  const hours = differenceInHours(now, dateObj);
  const days = differenceInDays(now, dateObj);
  
  // Show "இன்று HH:mm" for articles less than an hour old
  if (minutes < 60) return `இன்று ${formatInTimeZone(new Date(date), MALAYSIA_TZ, 'HH:mm')}`;
  if (hours < 24) return `${hours} மணி நேரம் முன்`;
  if (days === 1) return 'நேற்று';
  if (days < 7) return `${days} நாள் முன்`;
  
  return formatInTimeZone(new Date(date), MALAYSIA_TZ, 'd MMM', { locale: ms });
}

/**
 * Format a date for article display (e.g., "12 Januari 2024, 14:30")
 */
export function formatPublishDate(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  return formatInTimeZone(new Date(date), MALAYSIA_TZ, 'd MMMM yyyy, HH:mm', { locale: ms });
}

/**
 * Format a date in short format (e.g., "12 Jan 2024")
 */
export function formatShortDate(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  return formatInTimeZone(new Date(date), MALAYSIA_TZ, 'd MMM yyyy', { locale: ms });
}

/**
 * Format a date for admin tables (e.g., "12/01/2024")
 */
export function formatTableDate(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  return formatInTimeZone(new Date(date), MALAYSIA_TZ, 'dd/MM/yyyy', { locale: ms });
}

/**
 * Format datetime for forms (e.g., "2024-01-12T14:30")
 */
export function formatDateTimeLocal(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  return formatInTimeZone(new Date(date), MALAYSIA_TZ, "yyyy-MM-dd'T'HH:mm");
}
