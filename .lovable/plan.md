## Goal

Remove the raw `![…](https://…)` line that's showing as visible text between paragraphs in `/berita/timbalan-menteri-yuneswaran-sampaikan-takziah-kepada-keluarg-53ad0de8`.

## Change

Single DB update — strip the image markdown line (and its surrounding blank line) from the article's `content`, leaving paragraph 2 directly followed by the `## ஒற்றுமையின் வரலாற்று மரபு` subheading:

```sql
UPDATE articles
SET content = replace(content,
  E'\n\n![துணையமைச்சர் யுனேஸ்வரன் கார்த்தியின் குடும்பத்தினருடன் ஆறுதல் பகிர்ந்த தருணம்](https://dwopahjycvaocermgesw.supabase.co/storage/v1/object/public/article-images/editorial/2026-05-21/karthi-family.jpg)',
  '')
WHERE slug = 'timbalan-menteri-yuneswaran-sampaikan-takziah-kepada-keluarg-53ad0de8';
```

No frontend edits — the markdown-image support already added to `ArticleContent` is harmless and can stay for future use.

## Verify

Reload `/berita/timbalan-menteri-yuneswaran-sampaikan-takziah-kepada-keluarg-53ad0de8` and confirm paragraph 2 flows straight into the first subheading with no stray text or image.
