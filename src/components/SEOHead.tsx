import React, { useEffect } from 'react';
import { getSiteUrl, getCanonicalUrl } from '../utils/seo';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  category?: string;
  robots?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

export const SEOHead: React.FC<SEOProps> = ({
  title = 'Tutorials and Code — Engineering Guides, Architecture & Deep Tech',
  description = 'In-depth programming tutorials, clean code architectures, AI systems, and software engineering analysis for developers and builders.',
  canonicalUrl,
  ogImage = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80',
  ogType = 'website',
  publishedTime,
  modifiedTime,
  authorName,
  category,
  robots = 'index, follow',
  structuredData,
}) => {
  useEffect(() => {
    const siteUrl = getSiteUrl();

    // 1. Title formatting (Clean & Consistent)
    let formattedTitle = title;
    if (!title.includes('Tutorials and Code') && !title.includes('Tutorials & Code')) {
      formattedTitle = `${title} | Tutorials and Code`;
    }
    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robots);
    setMetaTag('name', 'googlebot', robots);
    setMetaTag('name', 'bingbot', robots);
    setMetaTag('name', 'author', authorName || 'Tutorials and Code Editorial');

    // 3. OpenGraph Tags
    const resolvedCanonical = canonicalUrl || (typeof window !== 'undefined' ? getCanonicalUrl(window.location.pathname) : siteUrl);

    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType === 'article' ? 'article' : 'website');
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', resolvedCanonical);
    setMetaTag('property', 'og:site_name', 'Tutorials and Code');
    setMetaTag('property', 'og:locale', 'en_US');

    if (publishedTime) setMetaTag('property', 'article:published_time', publishedTime);
    if (modifiedTime) setMetaTag('property', 'article:modified_time', modifiedTime);
    if (authorName) setMetaTag('property', 'article:author', authorName);
    if (category) setMetaTag('property', 'article:section', category);

    // 4. Twitter / X Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:site', '@tutorialsandcode');

    // 5. Canonical Link Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', resolvedCanonical);

    // 6. JSON-LD Structured Data Schema Tag
    const scriptId = 'json-ld-structured-data';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    if (structuredData) {
      if (Array.isArray(structuredData)) {
        scriptElement.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': structuredData,
        });
      } else {
        scriptElement.textContent = JSON.stringify(structuredData);
      }
    } else {
      const defaultSchema = {
        '@context': 'https://schema.org',
        '@type': ogType === 'article' ? 'TechArticle' : 'WebSite',
        name: formattedTitle,
        headline: formattedTitle,
        description,
        image: ogImage,
        url: resolvedCanonical,
        ...(ogType === 'article' && {
          datePublished: publishedTime,
          dateModified: modifiedTime || publishedTime,
          author: {
            '@type': 'Person',
            name: authorName || 'Tutorials and Code Editorial',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Tutorials and Code',
            url: siteUrl,
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/favicon.svg`,
            },
          },
          articleSection: category,
        }),
      };
      scriptElement.textContent = JSON.stringify(defaultSchema);
    }
  }, [
    title,
    description,
    canonicalUrl,
    ogImage,
    ogType,
    publishedTime,
    modifiedTime,
    authorName,
    category,
    robots,
    structuredData,
  ]);

  return null;
};
