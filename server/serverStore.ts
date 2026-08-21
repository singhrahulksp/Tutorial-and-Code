import { INITIAL_POSTS } from '../src/data/initialPosts';
import { INITIAL_CATEGORIES } from '../src/data/categories';
import { INITIAL_AUTHORS } from '../src/data/authors';
import { Post, Category, Author, NewsletterSubscriber, SiteSettings } from '../src/types';
import { logSecurityEvent } from './auth';

export const DEFAULT_PAGE_META_OVERRIDES = {
  '/': {
    path: '/',
    pageName: 'Landing / Home Page',
    title: 'Tutorials and Code — Engineering Tutorials, Clean Architectures & Code Deep Dives',
    description: 'In-depth programming tutorials, clean code architectures, AI systems, and software engineering analysis for builders.',
    canonicalUrl: 'https://tutorialsandcode.dev',
    keywords: 'software engineering, tutorials, clean code, AI architecture, rust, web performance, zero-trust',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80',
  },
  '/latest': {
    path: '/latest',
    pageName: 'Latest Dispatches',
    title: 'Latest Engineering Dispatches & Technical Guides | Tutorials and Code',
    description: 'Chronological archive of all published engineering tutorials, system breakdowns, and research articles.',
    canonicalUrl: 'https://tutorialsandcode.dev/latest',
    keywords: 'latest tutorials, coding guides, technical feed, systems architecture',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80',
  },
  '/search': {
    path: '/search',
    pageName: 'Search Archive',
    title: 'Search Technical Publications & Guides | Tutorials and Code',
    description: 'Search through engineering breakdowns, coding tutorials, AI architecture studies, and cybersecurity reviews.',
    canonicalUrl: 'https://tutorialsandcode.dev/search',
    keywords: 'search coding tutorials, engineering search, code index',
    robots: 'noindex, follow',
  },
  '/about': {
    path: '/about',
    pageName: 'About & Editorial Masthead',
    title: 'About Tutorials and Code — Editorial Standards & Technical Mission',
    description: 'Tutorials and Code is an independent publication dedicated to software architecture, AI systems, clean coding tutorials, and engineering craft.',
    canonicalUrl: 'https://tutorialsandcode.dev/about',
    keywords: 'about tutorials and code, editorial standards, engineering masthead',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80',
  },
  '/contact': {
    path: '/contact',
    pageName: 'Contact Newsroom',
    title: 'Contact Editorial Staff & Newsroom — Tutorials and Code',
    description: 'Submit code tutorials, report technical corrections, pitch guest articles, or contact the Tutorials and Code staff.',
    canonicalUrl: 'https://tutorialsandcode.dev/contact',
    keywords: 'contact editorial, pitch tutorial, report bug, code errata',
    robots: 'index, follow',
  },
  '/privacy': {
    path: '/privacy',
    pageName: 'Privacy Policy',
    title: 'Privacy Policy & Zero-Tracking Manifesto — Tutorials and Code',
    description: 'Our zero-tracking and privacy commitment to technical readers.',
    canonicalUrl: 'https://tutorialsandcode.dev/privacy',
    robots: 'index, follow',
  },
  '/terms': {
    path: '/terms',
    pageName: 'Terms of Service',
    title: 'Terms of Service & Code Licensing — Tutorials and Code',
    description: 'Terms of service, open-source code licensing, and publication rights.',
    canonicalUrl: 'https://tutorialsandcode.dev/terms',
    robots: 'index, follow',
  },
  '/sitemap': {
    path: '/sitemap',
    pageName: 'Sitemap & Index',
    title: 'Dynamic XML Sitemap & Editorial Index | Tutorials and Code',
    description: 'Search engine and crawler XML index of all published articles, category tracks, and author profiles crawled dynamically from Firestore.',
    canonicalUrl: 'https://tutorialsandcode.dev/sitemap.xml',
    robots: 'index, follow',
  },
};

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Tutorials and Code',
  tagline: 'Engineering Tutorials, Clean Architectures & Code Deep Dives',
  description: 'In-depth programming tutorials, clean code architectures, AI systems, and software engineering analysis for builders.',
  siteUrl: 'https://tutorialsandcode.dev',
  postsPerPage: 9,
  enableNewsletter: true,
  enableTrending: true,
  twitterHandle: '@tutorialsandcode',
  githubUrl: 'https://github.com',
  pageMetaOverrides: DEFAULT_PAGE_META_OVERRIDES,
};

class ServerStore {
  private posts: Map<string, Post> = new Map();
  private categories: Map<string, Category> = new Map();
  private authors: Map<string, Author> = new Map();
  private subscribers: Map<string, NewsletterSubscriber> = new Map();
  private siteSettings: SiteSettings = { ...DEFAULT_SETTINGS };

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults() {
    this.posts.clear();
    this.categories.clear();
    this.authors.clear();
    this.subscribers.clear();

    INITIAL_POSTS.forEach((p) => this.posts.set(p.id, { ...p }));
    INITIAL_CATEGORIES.forEach((c) => this.categories.set(c.id, { ...c }));
    INITIAL_AUTHORS.forEach((a) => this.authors.set(a.id, { ...a }));
    this.subscribers.set('sub-1', {
      id: 'sub-1',
      email: 'dev.lead@stripe.com',
      subscribedAt: '2026-08-01T10:00:00.000Z',
    });
    this.siteSettings = { ...DEFAULT_SETTINGS };
  }

  // --- POSTS ---
  public getPosts(): Post[] {
    return Array.from(this.posts.values());
  }

  public getPublishedPosts(): Post[] {
    return this.getPosts()
      .filter((p) => p.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  public getPostById(id: string): Post | undefined {
    return this.posts.get(id);
  }

  public getPostBySlug(slug: string): Post | undefined {
    return Array.from(this.posts.values()).find((p) => p.slug === slug);
  }

  public createPost(data: Omit<Post, 'id' | 'views'>, adminId: string): Post {
    const id = `post-${Date.now()}`;
    const newPost: Post = {
      ...data,
      id,
      views: 0,
      updatedAt: new Date().toISOString(),
    };
    this.posts.set(id, newPost);
    logSecurityEvent('ARTICLE_MUTATION', {
      adminId,
      resourceId: id,
      reason: `Created article "${newPost.title}" (${newPost.status})`,
    });
    return newPost;
  }

  public updatePost(id: string, updates: Partial<Post>, adminId: string): Post | null {
    const existing = this.posts.get(id);
    if (!existing) {
      return null;
    }

    // Explicit field whitelisting to prevent mass assignment
    const sanitizedUpdates: Partial<Post> = {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.slug !== undefined && { slug: updates.slug }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.content !== undefined && { content: updates.content }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.tags !== undefined && { tags: updates.tags }),
      ...(updates.authorId !== undefined && { authorId: updates.authorId }),
      ...(updates.featuredImage !== undefined && { featuredImage: updates.featuredImage }),
      ...(updates.readingTime !== undefined && { readingTime: updates.readingTime }),
      ...(updates.publishedAt !== undefined && { publishedAt: updates.publishedAt }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.featured !== undefined && { featured: updates.featured }),
      ...(updates.seoTitle !== undefined && { seoTitle: updates.seoTitle }),
      ...(updates.seoDescription !== undefined && { seoDescription: updates.seoDescription }),
      ...(updates.directAnswer !== undefined && { directAnswer: updates.directAnswer }),
      ...(updates.keyTakeaways !== undefined && { keyTakeaways: updates.keyTakeaways }),
      ...(updates.ogImage !== undefined && { ogImage: updates.ogImage }),
      updatedAt: new Date().toISOString(),
    };

    const updated = {
      ...existing,
      ...sanitizedUpdates,
    };
    this.posts.set(id, updated);
    logSecurityEvent('ARTICLE_MUTATION', {
      adminId,
      resourceId: id,
      reason: `Updated article "${updated.title}"`,
    });
    return updated;
  }

  public deletePost(id: string, adminId: string): boolean {
    const existing = this.posts.get(id);
    if (!existing) {
      return false;
    }
    this.posts.delete(id);
    logSecurityEvent('ARTICLE_MUTATION', {
      adminId,
      resourceId: id,
      reason: `Deleted article "${existing.title}"`,
    });
    return true;
  }

  public togglePostStatus(id: string, adminId: string): Post | null {
    const existing = this.posts.get(id);
    if (!existing) {
      return null;
    }
    const nextStatus = existing.status === 'published' ? 'draft' : 'published';
    existing.status = nextStatus;
    existing.updatedAt = new Date().toISOString();
    this.posts.set(id, existing);
    logSecurityEvent('ARTICLE_MUTATION', {
      adminId,
      resourceId: id,
      reason: `Changed status to ${nextStatus}`,
    });
    return existing;
  }

  public incrementViews(id: string): void {
    const post = this.posts.get(id);
    if (post) {
      post.views = (post.views || 0) + 1;
      this.posts.set(id, post);
    }
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return Array.from(this.categories.values());
  }

  public getCategoryById(id: string): Category | undefined {
    return this.categories.get(id);
  }

  public createCategory(data: Omit<Category, 'id'>, adminId: string): Category {
    const id = `cat-${Date.now()}`;
    const newCat: Category = {
      ...data,
      id,
    };
    this.categories.set(id, newCat);
    logSecurityEvent('SETTINGS_MUTATION', {
      adminId,
      resourceId: id,
      reason: `Created category "${newCat.name}"`,
    });
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>, adminId: string): Category | null {
    const existing = this.categories.get(id);
    if (!existing) {
      return null;
    }
    const updated = {
      ...existing,
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.slug !== undefined && { slug: updates.slug }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.color !== undefined && { color: updates.color }),
      ...(updates.iconName !== undefined && { iconName: updates.iconName }),
      ...(updates.subtopics !== undefined && { subtopics: updates.subtopics }),
    };
    this.categories.set(id, updated);
    logSecurityEvent('SETTINGS_MUTATION', {
      adminId,
      resourceId: id,
      reason: `Updated category "${updated.name}"`,
    });
    return updated;
  }

  public deleteCategory(id: string, adminId: string): boolean {
    const existing = this.categories.get(id);
    if (!existing) {
      return false;
    }
    this.categories.delete(id);
    logSecurityEvent('SETTINGS_MUTATION', {
      adminId,
      resourceId: id,
      reason: `Deleted category "${existing.name}"`,
    });
    return true;
  }

  // --- AUTHORS ---
  public getAuthors(): Author[] {
    return Array.from(this.authors.values());
  }

  public getAuthorById(id: string): Author | undefined {
    return this.authors.get(id);
  }

  public createAuthor(data: Omit<Author, 'id'>, adminId: string): Author {
    const id = `auth-${Date.now()}`;
    const newAuthor: Author = {
      ...data,
      id,
    };
    this.authors.set(id, newAuthor);
    logSecurityEvent('SETTINGS_MUTATION', {
      adminId,
      resourceId: id,
      reason: `Created author profile "${newAuthor.name}"`,
    });
    return newAuthor;
  }

  public updateAuthor(id: string, updates: Partial<Author>, adminId: string): Author | null {
    const existing = this.authors.get(id);
    if (!existing) {
      return null;
    }
    const updated = {
      ...existing,
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.slug !== undefined && { slug: updates.slug }),
      ...(updates.role !== undefined && { role: updates.role }),
      ...(updates.bio !== undefined && { bio: updates.bio }),
      ...(updates.avatar !== undefined && { avatar: updates.avatar }),
      ...(updates.twitter !== undefined && { twitter: updates.twitter }),
      ...(updates.github !== undefined && { github: updates.github }),
      ...(updates.website !== undefined && { website: updates.website }),
      ...(updates.expertise !== undefined && { expertise: updates.expertise }),
    };
    this.authors.set(id, updated);
    logSecurityEvent('SETTINGS_MUTATION', {
      adminId,
      resourceId: id,
      reason: `Updated author profile "${updated.name}"`,
    });
    return updated;
  }

  public deleteAuthor(id: string, adminId: string): boolean {
    const existing = this.authors.get(id);
    if (!existing) {
      return false;
    }
    this.authors.delete(id);
    logSecurityEvent('SETTINGS_MUTATION', {
      adminId,
      resourceId: id,
      reason: `Deleted author profile "${existing.name}"`,
    });
    return true;
  }

  // --- SUBSCRIBERS ---
  public getSubscribers(): NewsletterSubscriber[] {
    return Array.from(this.subscribers.values());
  }

  public addSubscriber(email: string): { success: boolean; alreadySubscribed?: boolean } {
    const normalized = email.trim().toLowerCase();
    for (const sub of this.subscribers.values()) {
      if (sub.email.toLowerCase() === normalized) {
        return { success: true, alreadySubscribed: true };
      }
    }
    const id = `sub-${Date.now()}`;
    const subRecord: NewsletterSubscriber = {
      id,
      email: normalized,
      subscribedAt: new Date().toISOString(),
    };
    this.subscribers.set(id, subRecord);
    return { success: true, alreadySubscribed: false };
  }

  // --- SETTINGS ---
  public getSiteSettings(): SiteSettings {
    return { ...this.siteSettings };
  }

  public updateSiteSettings(updates: Partial<SiteSettings>, adminId: string): SiteSettings {
    this.siteSettings = {
      ...this.siteSettings,
      ...(updates.siteName !== undefined && { siteName: updates.siteName }),
      ...(updates.tagline !== undefined && { tagline: updates.tagline }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.siteUrl !== undefined && { siteUrl: updates.siteUrl }),
      ...(updates.postsPerPage !== undefined && { postsPerPage: updates.postsPerPage }),
      ...(updates.enableNewsletter !== undefined && { enableNewsletter: updates.enableNewsletter }),
      ...(updates.enableTrending !== undefined && { enableTrending: updates.enableTrending }),
      ...(updates.twitterHandle !== undefined && { twitterHandle: updates.twitterHandle }),
      ...(updates.githubUrl !== undefined && { githubUrl: updates.githubUrl }),
      ...(updates.pageMetaOverrides !== undefined && {
        pageMetaOverrides: {
          ...this.siteSettings.pageMetaOverrides,
          ...updates.pageMetaOverrides,
        },
      }),
    };
    logSecurityEvent('SETTINGS_MUTATION', {
      adminId,
      reason: 'Site settings updated',
    });
    return { ...this.siteSettings };
  }
}

export const serverStore = new ServerStore();
