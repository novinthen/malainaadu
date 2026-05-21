## Goal

Embed the second photo (deputy minister with the family) inline inside the article body of `/article/timbalan-menteri-yuneswaran-sampaikan-takziah-kepada-keluarg-53ad0de8`, placed between paragraph 2 and the `## ஒற்றுமையின் வரலாற்று மரபு` subheading.

The image is already uploaded at `article-images/editorial/2026-05-21/karthi-family.jpg` — no new upload needed.

## Approach

The current renderer (`ArticleContent` + `processContentToParagraphs`) only emits `<p>` tags from newline-split text. To support inline images cleanly and reusably for future articles, I'll extend it to also recognize a simple markdown image line: `![alt](url)`.

### 1. Frontend changes

**`src/lib/article-utils.ts`**
- Change `processContentToParagraphs` to return `Array<{ type: 'text' | 'image' | 'heading', value: string, alt?: string }>` (still splits on newlines; lines matching `![alt](url)` become image blocks, lines starting with `## ` become heading blocks).
- Update `extractPullQuote` to only consider text blocks.

**`src/components/article/ArticleContent.tsx`**
- Iterate over the new block array. Render text as `<p>`, image as a `<figure>` with `OptimizedImage` (full-width, rounded, with optional caption from alt text), heading as `<h2>`.
- Keep drop-cap on the first text block and pull-quote after the third text block.

**`src/pages/ArticlePage.tsx`**
- No prop changes needed; types update flows through `useMemo`.

**Tests**
- Update `src/lib/__tests__/article-utils.test.ts` for the new return shape (text/image/heading blocks).

### 2. Database change

Update the article's `content` to insert one new line between paragraph 2 and the first `##` heading:

```
![துணையமைச்சர் யுனேஸ்வரன் கார்த்தியின் குடும்பத்தினருடன்](https://dwopahjycvaocermgesw.supabase.co/storage/v1/object/public/article-images/editorial/2026-05-21/karthi-family.jpg)
```

Done via a single `UPDATE articles SET content = ...` (insert tool).

### 3. Verification

- Visit `/article/timbalan-menteri-yuneswaran-sampaikan-takziah-kepada-keluarg-53ad0de8` in preview and confirm the photo appears between paragraph 2 and the "ஒற்றுமையின் வரலாற்று மரபு" heading, with proper aspect ratio and caption.
- Run vitest on `article-utils` to make sure parsing still works for older articles (plain-text only).

## Question

Placement — embed between paragraph 2 and the first subheading (my default), or somewhere else (e.g., right before "## அடிப்படைத் தலைவர்களுக்கு அங்கீகாரம்")? Reply "go" for the default.
