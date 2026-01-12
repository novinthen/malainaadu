/**
 * ArticleContent Component
 * Renders article body with paragraphs, drop cap, and pull quote
 */

import React from 'react';

interface ArticleContentProps {
  paragraphs: string[];
  pullQuote: string | null;
}

export function ArticleContent({ paragraphs, pullQuote }: ArticleContentProps) {
  return (
    <div className="prose prose-lg mt-6 max-w-none dark:prose-invert">
      {paragraphs.map((paragraph, i) => (
        <React.Fragment key={i}>
          <p className={i === 0 ? 'drop-cap' : undefined}>{paragraph}</p>
          {i === 2 && pullQuote && (
            <aside className="pull-quote not-prose">{pullQuote}</aside>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
