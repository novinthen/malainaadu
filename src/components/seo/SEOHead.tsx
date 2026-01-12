import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/constants/routes';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  noIndex?: boolean;
}

export function SEOHead({
  title,
  description = SITE_CONFIG.description,
  canonicalUrl,
  ogImage = '/og-image.png',
  ogType = 'website',
  article,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`;

  const fullCanonicalUrl = canonicalUrl
    ? `${SITE_CONFIG.url}${canonicalUrl}`
    : undefined;

  const fullOgImage = ogImage.startsWith('http')
    ? ogImage
    : `${SITE_CONFIG.url}${ogImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}

      {/* Article specific */}
      {ogType === 'article' && article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags?.map((tag, i) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
    </Helmet>
  );
}
