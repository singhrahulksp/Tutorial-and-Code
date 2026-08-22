import { Post, Author, Category, SiteSettings, PostFAQ } from '../types';

/**
 * Returns the resolved canonical base URL of the site.
 * Prioritizes environment variables, configured site settings, or browser location.
 */
export function getSiteUrl(configuredSiteUrl?: string): string {
  if (configuredSiteUrl && configuredSiteUrl.trim().length > 0) {
    return configuredSiteUrl.trim().replace(/\/+$/, '');
  }
  const envSiteUrl = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_SITE_URL : undefined;
  if (envSiteUrl && envSiteUrl.trim().length > 0) {
    return envSiteUrl.trim().replace(/\/+$/, '');
  }
  return 'https://www.tutorialsandcode.in';
}

/**
 * Generates a clean, normalized canonical URL for any route path.
 */
export function getCanonicalUrl(path: string, customCanonical?: string, baseUrl?: string): string {
  if (customCanonical && customCanonical.startsWith('http')) {
    return customCanonical.replace(/\/+$/, '');
  }
  const base = (baseUrl || getSiteUrl()).replace(/\/+$/, '');
  const cleanPath = path.split('?')[0].replace(/\/+$/, '');
  return `${base}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
}

/**
 * Generates Schema.org TechArticle / BlogPosting JSON-LD.
 */
export function generateArticleSchema(
  post: Post,
  author?: Author,
  category?: Category,
  siteSettings?: SiteSettings
) {
  const siteUrl = getSiteUrl(siteSettings?.siteUrl);
  const articleUrl = post.canonicalUrl || getCanonicalUrl(`/blog/${post.slug}`, undefined, siteUrl);

  const wordCount = post.content ? post.content.split(/\s+/).length : 800;

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.description,
    image: post.ogImage || post.featuredImage,
    url: articleUrl,
    inLanguage: 'en-US',
    wordCount,
    timeRequired: `PT${post.readingTime || 5}M`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    articleSection: category?.name || post.category,
    keywords: post.tags?.join(', ') || 'Technology, AI, Engineering, Tutorials, Code',
    author: {
      '@type': 'Person',
      name: author?.name || 'Tutorials and Code Editorial',
      url: author ? getCanonicalUrl(`/author/${author.slug}`, undefined, siteUrl) : siteUrl,
      jobTitle: author?.role || 'Technical Researcher',
      description: author?.bio || undefined,
      sameAs: [
        author?.twitter,
        author?.github,
        author?.website,
      ].filter(Boolean),
    },
    publisher: {
      '@type': 'Organization',
      name: siteSettings?.siteName || 'Tutorials and Code',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.svg`,
      },
    },
    isAccessibleForFree: 'True',
  };

  // Attach direct answer / abstract for search snippets and featured extractors
  if (post.directAnswer) {
    schema.abstract = post.directAnswer;
  }

  return schema;
}

/**
 * Generates Schema.org BreadcrumbList JSON-LD.
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  siteUrl?: string
) {
  const base = getSiteUrl(siteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${base}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  };
}

/**
 * Generates Schema.org FAQPage JSON-LD.
 */
export function generateFaqSchema(faqs: PostFAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generates Schema.org Organization structured data for the site.
 */
export function generateOrganizationSchema(siteSettings?: SiteSettings) {
  const siteUrl = getSiteUrl(siteSettings?.siteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: siteSettings?.siteName || 'Tutorials and Code',
    url: siteUrl,
    description: siteSettings?.description || 'Independent technical publication focusing on developer tutorials, clean code architectures, AI systems, and software engineering.',
    logo: `${siteUrl}/favicon.svg`,
    sameAs: [
      siteSettings?.twitterHandle ? `https://twitter.com/${siteSettings.twitterHandle.replace('@', '')}` : undefined,
      siteSettings?.githubUrl || undefined,
    ].filter(Boolean),
  };
}

/**
 * Generates Schema.org WebSite structured data with SearchAction.
 */
export function generateWebSiteSchema(siteSettings?: SiteSettings) {
  const siteUrl = getSiteUrl(siteSettings?.siteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteSettings?.siteName || 'Tutorials and Code',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates Schema.org ProfilePage for an author.
 */
export function generateAuthorProfileSchema(author: Author, siteSettings?: SiteSettings | string) {
  const siteUrlString = typeof siteSettings === 'string' ? siteSettings : siteSettings?.siteUrl;
  const siteUrl = getSiteUrl(siteUrlString);
  const authorUrl = getCanonicalUrl(`/author/${author.slug}`, undefined, siteUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: author.name,
      url: authorUrl,
      image: author.avatar,
      jobTitle: author.role,
      description: author.bio,
      knowsAbout: author.expertise || ['AI Systems', 'Software Architecture', 'Cloud Engineering'],
      sameAs: [
        author.twitter,
        author.github,
        author.website,
      ].filter(Boolean),
    },
  };
}
