import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/constants/routes';
import type { Article } from '@/types/database';

interface NewsArticleSchemaProps {
  article: Article;
  url: string;
}

export function NewsArticleSchema({ article, url }: NewsArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.content.substring(0, 160),
    image: article.image_url || `${SITE_CONFIG.url}/og-image.png`,
    datePublished: article.publish_date,
    dateModified: article.updated_at,
    author: {
      '@type': 'Organization',
      name: article.source?.name || SITE_CONFIG.name,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: article.category?.name,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/cari?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    sameAs: [
      `https://twitter.com/${SITE_CONFIG.twitterHandle.replace('@', '')}`,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Malay', 'English'],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
