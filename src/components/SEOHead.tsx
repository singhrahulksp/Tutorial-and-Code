import React, { useEffect } from 'react';
import { getSiteUrl, getCanonicalUrl } from '../utils/seo';
import { useBlog } from '../context/BlogContext';

interface SEOProps {
  pagePath?: string;
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
  keywords?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

export const SEOHead: React.FC<SEOProps> = ({
  pagePath,
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
  keywords,
  structuredData,
}) => {
  const { siteSettings } = useBlog();

  useEffect(() => {
    const siteUrl = siteSettings?.siteUrl || getSiteUrl();
    const currentPathname = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/');

    // Check if there is an admin override for this specific page path
    const pageOverride = siteSettings?.pageMetaOverrides?.[currentPathname];

    const activeTitle = pageOverride?.title?.trim() || title;
    const activeDescription = pageOverride?.description?.trim() || description;
    const activeCanonical = pageOverride?.canonicalUrl?.trim() || canonicalUrl || getCanonicalUrl(currentPathname, undefined, siteUrl);
    const activeOgImage = pageOverride?.ogImage?.trim() || ogImage;
    const activeRobots = pageOverride?.robots?.trim() || robots;
    const activeKeywords = pageOverride?.keywords?.trim() || keywords;

    // 1. Title formatting (Clean & Consistent)
    let formattedTitle = activeTitle;
    if (!activeTitle.includes('Tutorials and Code') && !activeTitle.includes('Tutorials & Code')) {
      formattedTitle = `${activeTitle} | Tutorials and Code`;
    }
    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'google-site-verification', 'PFIvrP-KLYMgNUu-dqiG3wuB6DYTug6eDEJBE5z927U');
    setMetaTag('name', 'description', activeDescription);
    setMetaTag('name', 'robots', activeRobots);
    setMetaTag('name', 'googlebot', activeRobots);
    setMetaTag('name', 'bingbot', activeRobots);
    setMetaTag('name', 'author', authorName || 'Tutorials and Code Editorial');
    if (activeKeywords) {
      setMetaTag('name', 'keywords', activeKeywords);
    }

    // 3. OpenGraph Tags
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', activeDescription);
    setMetaTag('property', 'og:type', ogType === 'article' ? 'article' : 'website');
    setMetaTag('property', 'og:image', activeOgImage);
    setMetaTag('property', 'og:url', activeCanonical);
    setMetaTag('property', 'og:site_name', siteSettings?.siteName || 'Tutorials and Code');
    setMetaTag('property', 'og:locale', 'en_US');

    if (publishedTime) setMetaTag('property', 'article:published_time', publishedTime);
    if (modifiedTime) setMetaTag('property', 'article:modified_time', modifiedTime);
    if (authorName) setMetaTag('property', 'article:author', authorName);
    if (category) setMetaTag('property', 'article:section', category);

    // 4. Twitter / X Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', activeDescription);
    setMetaTag('name', 'twitter:image', activeOgImage);
    setMetaTag('name', 'twitter:site', siteSettings?.twitterHandle || '@tutorialsandcode');

    // 5. Canonical Link Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', activeCanonical);

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
        description: activeDescription,
        image: activeOgImage,
        url: activeCanonical,
        ...(ogType === 'article' && {
          datePublished: publishedTime,
          dateModified: modifiedTime || publishedTime,
          author: {
            '@type': 'Person',
            name: authorName || 'Tutorials and Code Editorial',
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
          articleSection: category,
        }),
      };
      scriptElement.textContent = JSON.stringify(defaultSchema);
    }
  }, [
    pagePath,
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
    keywords,
    structuredData,
    siteSettings,
  ]);

  return null;
};

