/**
 * ArticleContent Component
 * Renders article body with paragraphs, headings, inline images, drop cap, and pull quote.
 * Supports a simple markdown subset within plain-text content:
 *   - `## Heading` lines become <h2>
 *   - `![alt](url)` lines become a <figure> with an inline image
 */

import React from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface ArticleContentProps {
  paragraphs: string[];
  pullQuote: string | null;
}

type Block =
  | { kind: 'text'; value: string }
  | { kind: 'heading'; value: string }
  | { kind: 'image'; alt: string; src: string };

const IMAGE_RE = /^!\[([^\]]*)\]\((\S+?)\)\s*$/;

function parseBlock(raw: string): Block {
  const line = raw.trim();
  const img = line.match(IMAGE_RE);
  if (img) return { kind: 'image', alt: img[1], src: img[2] };
  if (line.startsWith('## ')) return { kind: 'heading', value: line.slice(3).trim() };
  return { kind: 'text', value: raw };
}

export function ArticleContent({ paragraphs, pullQuote }: ArticleContentProps) {
  const blocks = paragraphs.map(parseBlock);
  let textIndex = -1;

  return (
    <div className="prose prose-lg mt-6 max-w-none dark:prose-invert">
      {blocks.map((block, i) => {
        if (block.kind === 'image') {
          return (
            <figure key={i} className="not-prose my-8">
              <img
                src={block.src}
                alt={block.alt}
                loading="eager"
                decoding="async"
                className="w-full rounded-lg object-cover"
              />
              {block.alt && (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                  {block.alt}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.kind === 'heading') {
          return <h2 key={i}>{block.value}</h2>;
        }

        textIndex += 1;
        const isFirstText = textIndex === 0;
        const showQuoteAfter = textIndex === 2 && pullQuote;

        return (
          <React.Fragment key={i}>
            <p className={isFirstText ? 'drop-cap' : undefined}>{block.value}</p>
            {showQuoteAfter && (
              <aside className="pull-quote not-prose">{pullQuote}</aside>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
