import { describe, it, expect } from 'vitest';
import {
  calculateReadingTime,
  processContentToParagraphs,
  extractPullQuote,
  isUUID,
  UUID_REGEX,
} from '../article-utils';

describe('calculateReadingTime', () => {
  it('returns minimum 1 minute for empty content', () => {
    expect(calculateReadingTime('')).toBe(1);
  });

  it('returns 1 minute for short content', () => {
    expect(calculateReadingTime('Hello world')).toBe(1);
  });

  it('returns 1 minute for 200 words', () => {
    const words = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(1);
  });

  it('returns 2 minutes for 400 words', () => {
    const words = Array(400).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(2);
  });

  it('returns 5 minutes for 1000 words', () => {
    const words = Array(1000).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(5);
  });

  it('handles whitespace-only content', () => {
    expect(calculateReadingTime('   ')).toBe(1);
  });
});

describe('processContentToParagraphs', () => {
  it('splits content by newlines when present', () => {
    const content = 'Paragraph one.\n\nParagraph two.';
    expect(processContentToParagraphs(content)).toEqual([
      'Paragraph one.',
      'Paragraph two.',
    ]);
  });

  it('groups sentences when no newlines', () => {
    const content = 'Sentence one. Sentence two. Sentence three. Sentence four.';
    const result = processContentToParagraphs(content);
    expect(result.length).toBe(2);
    expect(result[0]).toContain('Sentence one.');
    expect(result[0]).toContain('Sentence three.');
  });

  it('filters empty paragraphs', () => {
    const content = 'Para one.\n\n\n\nPara two.';
    const result = processContentToParagraphs(content);
    expect(result).toEqual(['Para one.', 'Para two.']);
  });

  it('handles content with single newlines', () => {
    const content = 'Line one.\nLine two.\nLine three.';
    const result = processContentToParagraphs(content);
    expect(result).toEqual(['Line one.', 'Line two.', 'Line three.']);
  });

  it('returns array with original content if no sentences found', () => {
    const content = 'No punctuation here';
    const result = processContentToParagraphs(content);
    expect(result).toEqual(['No punctuation here']);
  });
});

describe('extractPullQuote', () => {
  it('returns null for empty array', () => {
    expect(extractPullQuote([])).toBeNull();
  });

  it('returns null when no suitable quote found', () => {
    const paragraphs = ['Short.', 'Also short.'];
    expect(extractPullQuote(paragraphs)).toBeNull();
  });

  it('skips first paragraph', () => {
    const paragraphs = [
      'This is a perfect quote that should be extracted from the content. It has good length and would work.',
      'Short second paragraph.',
    ];
    expect(extractPullQuote(paragraphs)).toBeNull();
  });

  it('extracts quote between 60-180 chars', () => {
    const paragraphs = [
      'First paragraph that will be skipped.',
      'This is a compelling sentence that has enough length to be extracted as a pull quote for display in the article.',
    ];
    const result = extractPullQuote(paragraphs);
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(60);
    expect(result!.length).toBeLessThan(180);
  });

  it('only looks at paragraphs 2-5', () => {
    const paragraphs = [
      'First - skipped.',
      'Second - too short.',
      'Third - too short.',
      'Fourth - too short.',
      'Fifth - too short.',
      'Sixth paragraph has enough content to be a valid pull quote but should be ignored because it is too far.',
    ];
    expect(extractPullQuote(paragraphs)).toBeNull();
  });
});

describe('isUUID', () => {
  it('returns true for valid lowercase UUID', () => {
    expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('returns true for valid uppercase UUID', () => {
    expect(isUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('returns true for mixed case UUID', () => {
    expect(isUUID('550e8400-E29B-41d4-A716-446655440000')).toBe(true);
  });

  it('returns false for invalid string', () => {
    expect(isUUID('not-a-uuid')).toBe(false);
  });

  it('returns false for truncated UUID', () => {
    expect(isUUID('550e8400-e29b-41d4-a716')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isUUID('')).toBe(false);
  });

  it('returns false for slug', () => {
    expect(isUUID('pm-anwar-berita-terkini')).toBe(false);
  });

  it('returns false for UUID with wrong characters', () => {
    expect(isUUID('550g8400-e29b-41d4-a716-446655440000')).toBe(false);
  });
});

describe('UUID_REGEX', () => {
  it('matches valid UUID format', () => {
    expect(UUID_REGEX.test('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true);
  });

  it('does not match invalid format', () => {
    expect(UUID_REGEX.test('not-valid')).toBe(false);
  });
});
