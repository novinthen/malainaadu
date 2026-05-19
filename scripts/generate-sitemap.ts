// Runs before `vite dev` and `vite build`; writes public/sitemap.xml
// by fetching the dynamic sitemap from the Supabase edge function.

import { writeFileSync } from "fs";
import { resolve } from "path";

const EDGE_SITEMAP_URL =
  "https://dwopahjycvaocermgesw.supabase.co/functions/v1/sitemap";

const STATIC_FALLBACK = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://malainaadu.com/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
  <url><loc>https://malainaadu.com/terkini</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>
  <url><loc>https://malainaadu.com/trending</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>
  <url><loc>https://malainaadu.com/kategori</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>https://malainaadu.com/cari</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>
  <url><loc>https://malainaadu.com/tentang</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://malainaadu.com/privasi</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>
  <url><loc>https://malainaadu.com/terma</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>
</urlset>`;

async function main() {
  const out = resolve("public/sitemap.xml");
  try {
    const res = await fetch(EDGE_SITEMAP_URL, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    if (!xml.includes("<urlset")) throw new Error("invalid xml");
    writeFileSync(out, xml);
    const count = (xml.match(/<url>/g) || []).length;
    console.log(`sitemap.xml written (${count} entries, from edge fn)`);
  } catch (err) {
    console.warn(`sitemap edge fn failed (${(err as Error).message}); using static fallback`);
    writeFileSync(out, STATIC_FALLBACK);
  }
}

main();
