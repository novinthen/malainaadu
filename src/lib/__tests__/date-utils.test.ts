import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatTimeAgo,
  formatPublishDate,
  formatShortDate,
  formatTableDate,
  formatDateTimeLocal,
} from '../date-utils';

describe('formatTimeAgo', () => {
  it('returns null for null input', () => {
    expect(formatTimeAgo(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(formatTimeAgo(undefined)).toBeNull();
  });

  it('formats a Date object', () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 5);
    const result = formatTimeAgo(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('formats an ISO string', () => {
    const date = new Date();
    date.setHours(date.getHours() - 2);
    const result = formatTimeAgo(date.toISOString());
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('includes suffix for Malay locale', () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 30);
    const result = formatTimeAgo(date);
    // Should include "lalu" (ago) in Malay
    expect(result).toContain('lalu');
  });
});

describe('formatPublishDate', () => {
  it('returns null for null input', () => {
    expect(formatPublishDate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(formatPublishDate(undefined)).toBeNull();
  });

  it('formats date correctly with Malay month', () => {
    // Use a fixed date to ensure consistent testing
    const result = formatPublishDate('2024-01-15T14:30:00Z');
    expect(result).toBeTruthy();
    // Should contain Malay month name
    expect(result).toMatch(/Januari/);
    expect(result).toMatch(/2024/);
  });

  it('includes time in format', () => {
    const result = formatPublishDate('2024-06-20T09:15:00Z');
    expect(result).toBeTruthy();
    // Should contain colon for time
    expect(result).toContain(':');
  });
});

describe('formatShortDate', () => {
  it('returns null for null input', () => {
    expect(formatShortDate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(formatShortDate(undefined)).toBeNull();
  });

  it('formats date in short format', () => {
    const result = formatShortDate('2024-03-20T10:00:00Z');
    expect(result).toBeTruthy();
    // Should be abbreviated format
    expect(result).toMatch(/Mac|Mar/); // Malay abbreviation for March
    expect(result).toMatch(/2024/);
  });

  it('handles Date object', () => {
    const date = new Date('2024-12-25T00:00:00Z');
    const result = formatShortDate(date);
    expect(result).toBeTruthy();
    expect(result).toMatch(/2024/);
  });
});

describe('formatTableDate', () => {
  it('returns null for null input', () => {
    expect(formatTableDate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(formatTableDate(undefined)).toBeNull();
  });

  it('formats date as dd/MM/yyyy', () => {
    const result = formatTableDate('2024-06-25T10:00:00Z');
    expect(result).toBe('25/06/2024');
  });

  it('pads single digit day and month', () => {
    const result = formatTableDate('2024-01-05T10:00:00Z');
    expect(result).toBe('05/01/2024');
  });

  it('handles Date object', () => {
    const date = new Date('2024-11-30T00:00:00Z');
    const result = formatTableDate(date);
    expect(result).toBe('30/11/2024');
  });
});

describe('formatDateTimeLocal', () => {
  it('returns null for null input', () => {
    expect(formatDateTimeLocal(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(formatDateTimeLocal(undefined)).toBeNull();
  });

  it('formats for datetime-local input', () => {
    const result = formatDateTimeLocal('2024-01-15T14:30:00Z');
    expect(result).toBeTruthy();
    // Should match pattern yyyy-MM-ddTHH:mm
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('handles Date object', () => {
    const date = new Date('2024-07-04T18:45:00Z');
    const result = formatDateTimeLocal(date);
    expect(result).toBeTruthy();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('does not include seconds', () => {
    const result = formatDateTimeLocal('2024-01-15T14:30:45Z');
    expect(result).toBeTruthy();
    // Should not have seconds (only HH:mm, not HH:mm:ss)
    const parts = result!.split('T')[1].split(':');
    expect(parts.length).toBe(2);
  });
});
