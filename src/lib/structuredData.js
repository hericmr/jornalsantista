// Construtores de dados estruturados Schema.org (JSON-LD).
import { SITE } from '../config/site';

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/favicon.svg`,
  email: SITE.email,
  sameAs: Object.values(SITE.social)
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE.url}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
});

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    ...(item.url ? { item: item.url } : {})
  }))
});

export const newsArticleSchema = ({
  title,
  description,
  url,
  image,
  authors = [],
  publishedTime,
  modifiedTime,
  section
}) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/favicon.svg` }
    }
  };
  if (image) data.image = [image];
  if (publishedTime) data.datePublished = publishedTime;
  data.dateModified = modifiedTime || publishedTime || undefined;
  if (authors.length > 0) {
    data.author = authors.map((name) => ({ '@type': 'Person', name }));
  }
  if (section) data.articleSection = section;
  return data;
};
