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

export interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
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

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  siteUrl: string;
  postsPerPage: number;
  enableNewsletter: boolean;
  enableTrending: boolean;
  twitterHandle: string;
  githubUrl: string;
  customAdminPasswordHash?: string;
}
