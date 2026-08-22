export interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatar: string;
  twitter?: string;
  github?: string;
  website?: string;
  expertise?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  iconName: string;
  subtopics?: string[];
}

export interface PostSource {
  name: string;
  title: string;
  url: string;
  date?: string;
}

export interface PostFAQ {
  question: string;
  answer: string;
}

export type ArticleBlockType = 'text' | 'image' | 'code' | 'quote';

export interface TextBlock {
  id: string;
  type: 'text';
  content: string; // rich text or markdown with inline bold, italic, underline, lists, links
}

export interface ImageBlock {
  id: string;
  type: 'image';
  url: string;
  altText: string;
  caption?: string;
  alignment?: 'center' | 'left' | 'right' | 'full';
}

export interface CodeBlockData {
  id: string;
  type: 'code';
  code: string;
  language: string; // e.g. 'python', 'javascript', 'typescript', etc.
}

export interface QuoteBlock {
  id: string;
  type: 'quote';
  quote: string;
  author?: string;
}

export type ArticleBlock = TextBlock | ImageBlock | CodeBlockData | QuoteBlock;

export interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  blocks?: ArticleBlock[];
  category: string; // category slug
  tags: string[];
  authorId: string;
  featuredImage: string;
  publishedAt: string; // ISO date string
  updatedAt?: string;
  readingTime: number; // in minutes
  status: 'published' | 'draft';
  featured: boolean;
  trendingRank?: number; // 1-5 if trending
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  directAnswer?: string;
  keyTakeaways?: string[];
  sources?: PostSource[];
  faq?: PostFAQ[];
  relatedArticleIds?: string[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface PageMetaConfig {
  path: string; // e.g. '/', '/latest', '/about', '/contact', '/privacy', '/terms', '/search', '/sitemap'
  pageName: string;
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string;
  robots?: string; // 'index, follow' | 'noindex, follow' | 'noindex, nofollow'
  updatedAt?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  siteUrl: string;
  faviconUrl?: string;
  postsPerPage: number;
  enableNewsletter: boolean;
  enableTrending: boolean;
  twitterHandle: string;
  githubUrl: string;
  customAdminPasswordHash?: string;
  pageMetaOverrides?: Record<string, PageMetaConfig>;
}

