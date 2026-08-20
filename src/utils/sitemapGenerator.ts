import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Post, Category, Author, SiteSettings } from '../types';
import { getSiteUrl, getCanonicalUrl } from './seo';

export interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  type: 'core' | 'post' | 'category' | 'author' | 'legal';
  title?: string;
  image?: {
    loc: string;
    title?: string;
    caption?: string;
  };
  news?: {
    publicationName: string;
    publicationLanguage: string;
    publicationDate: string;
    title: string;
  };
}

export interface SitemapCrawlResult {
  xml: string;
  urls: SitemapUrlEntry[];
  totalUrls: number;
  postCount: number;
  categoryCount: number;
  authorCount: number;
  crawledAt: string;
  source: 'firestore' | 'cache_fallback';
  sizeBytes: number;
  siteUrl: string;
}

/**
 * Escapes XML special characters.
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Normalizes ISO dates into compliant YYYY-MM-DD format for XML sitemaps.
 */
function formatDateToIso(dateStr?: string): string {
  if (!dateStr) {
    return new Date().toISOString().split('T')[0];
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Builds standard, compliant XML string from list of sitemap URL entries.
 */
export function buildXmlSitemap(entries: SitemapUrlEntry[]): string {
  const xmlLines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ];

  for (const entry of entries) {
    xmlLines.push('  <url>');
    xmlLines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) {
      xmlLines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    }
    if (entry.changefreq) {
      xmlLines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    }
    if (entry.priority) {
      xmlLines.push(`    <priority>${entry.priority}</priority>`);
    }

    // Image extension
    if (entry.image?.loc) {
      xmlLines.push('    <image:image>');
      xmlLines.push(`      <image:loc>${escapeXml(entry.image.loc)}</image:loc>`);
      if (entry.image.title) {
        xmlLines.push(`      <image:title>${escapeXml(entry.image.title)}</image:title>`);
      }
      if (entry.image.caption) {
        xmlLines.push(`      <image:caption>${escapeXml(entry.image.caption)}</image:caption>`);
      }
      xmlLines.push('    </image:image>');
    }

    // Google News extension (for fresh articles)
    if (entry.news) {
      xmlLines.push('    <news:news>');
      xmlLines.push('      <news:publication>');
      xmlLines.push(`        <news:name>${escapeXml(entry.news.publicationName)}</news:name>`);
      xmlLines.push(`        <news:language>${escapeXml(entry.news.publicationLanguage)}</news:language>`);
      xmlLines.push('      </news:publication>');
      xmlLines.push(`      <news:publication_date>${escapeXml(entry.news.publicationDate)}</news:publication_date>`);
      xmlLines.push(`      <news:title>${escapeXml(entry.news.title)}</news:title>`);
      xmlLines.push('    </news:news>');
    }

    xmlLines.push('  </url>');
  }

  xmlLines.push('</urlset>');
  return xmlLines.join('\n');
}

/**
 * Crawls Firestore collections dynamically to generate a live, compliant XML sitemap.
 */
export async function crawlFirestoreSitemap(
  fallbackData?: {
    posts?: Post[];
    categories?: Category[];
    authors?: Author[];
    siteSettings?: SiteSettings;
  }
): Promise<SitemapCrawlResult> {
  const crawledAt = new Date().toISOString();
  let posts: Post[] = [];
  let categories: Category[] = [];
  let authors: Author[] = [];
  let siteSettings: SiteSettings | undefined = fallbackData?.siteSettings;
  let source: 'firestore' | 'cache_fallback' = 'firestore';

  // 1. Fetch live from Firestore
  try {
    // Crawl published posts
    const postsQuery = query(collection(db, 'posts'));
    const postsSnapshot = await getDocs(postsQuery);
    if (!postsSnapshot.empty) {
      posts = postsSnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
    }

    // Crawl categories taxonomy
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    if (!categoriesSnapshot.empty) {
      categories = categoriesSnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
    }

    // Crawl authors
    const authorsSnapshot = await getDocs(collection(db, 'authors'));
    if (!authorsSnapshot.empty) {
      authors = authorsSnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
    }

    // Crawl site settings
    const settingsSnapshot = await getDocs(collection(db, 'siteSettings'));
    if (!settingsSnapshot.empty) {
      const firstDoc = settingsSnapshot.docs[0].data() as SiteSettings;
      siteSettings = firstDoc;
    }
  } catch (error) {
    console.warn('Firestore live crawl error, utilizing runtime fallback cache:', error);
    source = 'cache_fallback';
  }

  // If Firestore returned empty or failed, use fallback data
  if (posts.length === 0 && fallbackData?.posts?.length) {
    posts = fallbackData.posts;
  }
  if (categories.length === 0 && fallbackData?.categories?.length) {
    categories = fallbackData.categories;
  }
  if (authors.length === 0 && fallbackData?.authors?.length) {
    authors = fallbackData.authors;
  }

  // Filter only published articles
  const publishedPosts = posts.filter((p) => p.status === 'published');

  const baseSiteUrl = getSiteUrl(siteSettings?.siteUrl);
  const entries: SitemapUrlEntry[] = [];
  const publicationName = siteSettings?.siteName || 'Tutorials and Code';
  const nowTime = Date.now();
  const twoDaysMs = 48 * 60 * 60 * 1000;

  // 1. Core Top-Level Routes
  entries.push({
    loc: getCanonicalUrl('/', undefined, baseSiteUrl),
    lastmod: formatDateToIso(new Date().toISOString()),
    changefreq: 'daily',
    priority: '1.0',
    type: 'core',
    title: `${publicationName} — Homepage`,
  });

  entries.push({
    loc: getCanonicalUrl('/latest', undefined, baseSiteUrl),
    lastmod: formatDateToIso(new Date().toISOString()),
    changefreq: 'daily',
    priority: '0.9',
    type: 'core',
    title: 'Latest Technical Feed',
  });

  entries.push({
    loc: getCanonicalUrl('/about', undefined, baseSiteUrl),
    lastmod: formatDateToIso('2026-08-15'),
    changefreq: 'monthly',
    priority: '0.7',
    type: 'core',
    title: 'About Tutorials and Code Editorial',
  });

  entries.push({
    loc: getCanonicalUrl('/contact', undefined, baseSiteUrl),
    lastmod: formatDateToIso('2026-08-15'),
    changefreq: 'monthly',
    priority: '0.6',
    type: 'core',
    title: 'Contact & Submissions',
  });

  entries.push({
    loc: getCanonicalUrl('/sitemap', undefined, baseSiteUrl),
    lastmod: formatDateToIso(crawledAt),
    changefreq: 'weekly',
    priority: '0.5',
    type: 'core',
    title: 'Sitemap Index Directory',
  });

  // 2. Category Hubs
  for (const cat of categories) {
    entries.push({
      loc: getCanonicalUrl(`/category/${cat.slug}`, undefined, baseSiteUrl),
      lastmod: formatDateToIso(crawledAt),
      changefreq: 'weekly',
      priority: '0.85',
      type: 'category',
      title: `${cat.name} Engineering Track`,
    });
  }

  // 3. Published Blog Posts (Articles)
  for (const post of publishedPosts) {
    const postUrl = post.canonicalUrl || getCanonicalUrl(`/blog/${post.slug}`, undefined, baseSiteUrl);
    const lastmod = formatDateToIso(post.updatedAt || post.publishedAt);
    const isFeatured = Boolean(post.featured);
    const postPriority = isFeatured ? '0.95' : '0.85';

    const entry: SitemapUrlEntry = {
      loc: postUrl,
      lastmod,
      changefreq: 'monthly',
      priority: postPriority,
      type: 'post',
      title: post.seoTitle || post.title,
    };

    // Attach Image Sitemap metadata
    if (post.featuredImage) {
      entry.image = {
        loc: post.featuredImage.startsWith('http') ? post.featuredImage : `${baseSiteUrl}${post.featuredImage}`,
        title: post.title,
        caption: post.description,
      };
    }

    // Attach Google News sitemap tag if published in the last 48 hours
    if (post.publishedAt) {
      const pubTime = new Date(post.publishedAt).getTime();
      if (!isNaN(pubTime) && nowTime - pubTime <= twoDaysMs) {
        entry.news = {
          publicationName,
          publicationLanguage: 'en',
          publicationDate: new Date(post.publishedAt).toISOString(),
          title: post.title,
        };
      }
    }

    entries.push(entry);
  }

  // 4. Author Profiles
  for (const author of authors) {
    entries.push({
      loc: getCanonicalUrl(`/author/${author.slug}`, undefined, baseSiteUrl),
      lastmod: formatDateToIso('2026-08-18'),
      changefreq: 'monthly',
      priority: '0.70',
      type: 'author',
      title: `${author.name} — Author Profile`,
    });
  }

  // 5. Legal Pages
  entries.push({
    loc: getCanonicalUrl('/privacy', undefined, baseSiteUrl),
    lastmod: formatDateToIso('2026-08-01'),
    changefreq: 'yearly',
    priority: '0.30',
    type: 'legal',
    title: 'Privacy Policy',
  });

  entries.push({
    loc: getCanonicalUrl('/terms', undefined, baseSiteUrl),
    lastmod: formatDateToIso('2026-08-01'),
    changefreq: 'yearly',
    priority: '0.30',
    type: 'legal',
    title: 'Terms of Service',
  });

  const xml = buildXmlSitemap(entries);
  const sizeBytes = new Blob([xml]).size;

  return {
    xml,
    urls: entries,
    totalUrls: entries.length,
    postCount: publishedPosts.length,
    categoryCount: categories.length,
    authorCount: authors.length,
    crawledAt,
    source,
    sizeBytes,
    siteUrl: baseSiteUrl,
  };
}

/**
 * Initiates browser download of generated XML sitemap file.
 */
export function downloadSitemapXmlFile(xmlContent: string, filename = 'sitemap.xml'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
