import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Post, Category, Author, NewsletterSubscriber, SiteSettings, PageMetaConfig } from '../types';
import { INITIAL_POSTS } from '../data/initialPosts';
import { INITIAL_CATEGORIES } from '../data/categories';
import { INITIAL_AUTHORS } from '../data/authors';
import {
  loginAdminServer,
  checkAdminSessionServer,
  logoutAdminServer,
} from '../utils/security';
import {
  db,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from '../lib/firebase';

const STORAGE_KEY_POSTS = 'tutorialsandcode_posts_v1';
const STORAGE_KEY_CATEGORIES = 'tutorialsandcode_categories_v1';
const STORAGE_KEY_AUTHORS = 'tutorialsandcode_authors_v1';
const STORAGE_KEY_SUBSCRIBERS = 'tutorialsandcode_subscribers_v1';
const STORAGE_KEY_SETTINGS = 'tutorialsandcode_settings_v1';

export const DEFAULT_PAGE_META_OVERRIDES: Record<string, PageMetaConfig> = {
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

interface BlogContextType {
  posts: Post[];
  publishedPosts: Post[];
  categories: Category[];
  authors: Author[];
  subscribers: NewsletterSubscriber[];
  siteSettings: SiteSettings;
  isAdminAuthenticated: boolean;
  isFirebaseConnected: boolean;
  lastCloudSync: Date | null;
  loginAdmin: (password: string) => Promise<{ success: boolean; reason?: string; lockoutSeconds?: number }>;
  logoutAdmin: () => Promise<void>;
  createPost: (post: Omit<Post, 'id' | 'views'>) => Promise<Post>;
  updatePost: (id: string, post: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  togglePostStatus: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addAuthor: (author: Omit<Author, 'id'>) => Promise<Author>;
  updateAuthor: (id: string, author: Partial<Author>) => Promise<void>;
  deleteAuthor: (id: string) => Promise<void>;
  subscribeNewsletter: (email: string) => Promise<{ success: boolean; message: string }>;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  exportData: () => string;
  importData: (json: string) => Promise<boolean>;
  getPostBySlug: (slug: string) => Post | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getAuthorById: (id: string) => Author | undefined;
  getAuthorBySlug: (slug: string) => Author | undefined;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: React.ReactNode }) {
  // State with initial local cache
  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_POSTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [authors, setAuthors] = useState<Author[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_AUTHORS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_AUTHORS;
  });

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_SUBSCRIBERS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [
      { id: 'sub-1', email: 'dev.lead@stripe.com', subscribedAt: '2026-08-01T10:00:00.000Z' },
      { id: 'sub-2', email: 'sarah.k@google.com', subscribedAt: '2026-08-10T14:20:00.000Z' },
      { id: 'sub-3', email: 'alex.m@meta.com', subscribedAt: '2026-08-15T09:12:00.000Z' },
    ];
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Authentication State is purely server-authoritative
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [lastCloudSync, setLastCloudSync] = useState<Date | null>(null);

  // Check server session on mount and periodically
  const checkSession = useCallback(async () => {
    const session = await checkAdminSessionServer();
    setIsAdminAuthenticated(session.authenticated);
  }, []);

  useEffect(() => {
    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [checkSession]);

  // Sync to LocalStorage as offline / instant fallback for reader speed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTHORS, JSON.stringify(authors));
  }, [authors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUBSCRIBERS, JSON.stringify(subscribers));
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(siteSettings));
  }, [siteSettings]);

  // Firestore Real-Time Subscriptions & Auto-Seeding
  useEffect(() => {
    let unsubscribePosts: (() => void) | undefined;
    let unsubscribeCategories: (() => void) | undefined;
    let unsubscribeAuthors: (() => void) | undefined;
    let unsubscribeSubscribers: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;

    const setupFirebaseSync = async () => {
      try {
        // 1. Posts Listener & Auto-Seed
        const postsCol = collection(db, 'posts');
        unsubscribePosts = onSnapshot(
          postsCol,
          async (snapshot) => {
            if (snapshot.empty) {
              const batch = writeBatch(db);
              INITIAL_POSTS.forEach((post) => {
                const pDoc = doc(db, 'posts', post.id);
                batch.set(pDoc, post);
              });
              await batch.commit();
            } else {
              const remotePosts: Post[] = [];
              snapshot.forEach((docSnap) => {
                remotePosts.push({ id: docSnap.id, ...(docSnap.data() as Omit<Post, 'id'>) });
              });
              setPosts(remotePosts);
              setIsFirebaseConnected(true);
              setLastCloudSync(new Date());
            }
          },
          (err) => {
            if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
              setIsFirebaseConnected(false);
            } else {
              console.warn('Firestore posts sync notice:', err);
            }
          }
        );

        // 2. Categories Listener & Auto-Seed
        const catCol = collection(db, 'categories');
        unsubscribeCategories = onSnapshot(
          catCol,
          async (snapshot) => {
            if (snapshot.empty) {
              const batch = writeBatch(db);
              INITIAL_CATEGORIES.forEach((cat) => {
                const cDoc = doc(db, 'categories', cat.id);
                batch.set(cDoc, cat);
              });
              await batch.commit();
            } else {
              const remoteCats: Category[] = [];
              snapshot.forEach((docSnap) => {
                remoteCats.push({ id: docSnap.id, ...(docSnap.data() as Omit<Category, 'id'>) });
              });
              setCategories(remoteCats);
            }
          },
          (err) => {
            if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
              setIsFirebaseConnected(false);
            } else {
              console.warn('Firestore categories sync notice:', err);
            }
          }
        );

        // 3. Authors Listener & Auto-Seed
        const authCol = collection(db, 'authors');
        unsubscribeAuthors = onSnapshot(
          authCol,
          async (snapshot) => {
            if (snapshot.empty) {
              const batch = writeBatch(db);
              INITIAL_AUTHORS.forEach((author) => {
                const aDoc = doc(db, 'authors', author.id);
                batch.set(aDoc, author);
              });
              await batch.commit();
            } else {
              const remoteAuthors: Author[] = [];
              snapshot.forEach((docSnap) => {
                remoteAuthors.push({ id: docSnap.id, ...(docSnap.data() as Omit<Author, 'id'>) });
              });
              setAuthors(remoteAuthors);
            }
          },
          (err) => {
            if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
              setIsFirebaseConnected(false);
            } else {
              console.warn('Firestore authors sync notice:', err);
            }
          }
        );

        // 4. Subscribers Listener
        const subCol = collection(db, 'subscribers');
        unsubscribeSubscribers = onSnapshot(
          subCol,
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteSubs: NewsletterSubscriber[] = [];
              snapshot.forEach((docSnap) => {
                remoteSubs.push({ id: docSnap.id, ...(docSnap.data() as Omit<NewsletterSubscriber, 'id'>) });
              });
              setSubscribers(remoteSubs);
            }
          },
          (err) => {
            if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
              setIsFirebaseConnected(false);
            } else {
              console.warn('Firestore subscribers sync notice:', err);
            }
          }
        );

        // 5. Site Settings Listener
        const settingsDocRef = doc(db, 'siteSettings', 'global');
        unsubscribeSettings = onSnapshot(
          settingsDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const remoteData = docSnap.data() as SiteSettings;
              setSiteSettings({
                ...DEFAULT_SETTINGS,
                ...remoteData,
                pageMetaOverrides: {
                  ...DEFAULT_PAGE_META_OVERRIDES,
                  ...(remoteData.pageMetaOverrides || {}),
                },
              });
            } else {
              await setDoc(settingsDocRef, DEFAULT_SETTINGS);
            }
          },
          (err) => {
            if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
              setIsFirebaseConnected(false);
            } else {
              console.warn('Firestore settings sync notice:', err);
            }
          }
        );

        setIsFirebaseConnected(true);
        setLastCloudSync(new Date());
      } catch (e) {
        console.error('Failed to initialize Firestore connection:', e);
      }
    };

    setupFirebaseSync();

    return () => {
      if (unsubscribePosts) unsubscribePosts();
      if (unsubscribeCategories) unsubscribeCategories();
      if (unsubscribeAuthors) unsubscribeAuthors();
      if (unsubscribeSubscribers) unsubscribeSubscribers();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  // Published posts sorted by date
  const publishedPosts = useMemo(() => {
    return posts
      .filter((p) => p.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [posts]);

  // Auth Methods (Server-Authoritative)
  const loginAdmin = async (password: string): Promise<{ success: boolean; reason?: string; lockoutSeconds?: number }> => {
    const result = await loginAdminServer(password);
    if (result.success) {
      setIsAdminAuthenticated(true);
      return { success: true };
    }
    return {
      success: false,
      reason: result.error || 'Invalid administrator credentials.',
      lockoutSeconds: result.lockoutSeconds,
    };
  };

  const logoutAdmin = async () => {
    await logoutAdminServer();
    setIsAdminAuthenticated(false);
  };

  // Post Actions (Server API + Firestore Sync + Optimistic State)
  const createPost = async (postData: Omit<Post, 'id' | 'views'>): Promise<Post> => {
    // 1. Call server API
    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-action': 'create-post',
      },
      credentials: 'include',
      body: JSON.stringify(postData),
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired or invalid.');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to create article on server.');
    }

    const newPost = json.data as Post;
    setPosts((prev) => [newPost, ...prev]);

    // Background sync to Firestore client instance
    try {
      await setDoc(doc(db, 'posts', newPost.id), newPost);
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }

    return newPost;
  };

  const updatePost = async (id: string, updatedData: Partial<Post>) => {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-action': 'update-post',
      },
      credentials: 'include',
      body: JSON.stringify(updatedData),
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update article on server.');
    }

    const updatedPost = json.data as Post;
    setPosts((prev) => prev.map((p) => (p.id === id ? updatedPost : p)));

    try {
      await updateDoc(doc(db, 'posts', id), updatedData);
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }
  };

  const deletePost = async (id: string) => {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-action': 'delete-post',
      },
      credentials: 'include',
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to delete article on server.');
    }

    setPosts((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteDoc(doc(db, 'posts', id));
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }
  };

  const togglePostStatus = async (id: string) => {
    const res = await fetch(`/api/admin/posts/${id}/status`, {
      method: 'PATCH',
      headers: {
        'x-admin-action': 'toggle-status',
      },
      credentials: 'include',
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to toggle status on server.');
    }

    const updatedPost = json.data as Post;
    setPosts((prev) => prev.map((p) => (p.id === id ? updatedPost : p)));

    try {
      await updateDoc(doc(db, 'posts', id), { status: updatedPost.status, updatedAt: updatedPost.updatedAt });
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }
  };

  const incrementViews = async (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p))
    );

    try {
      await fetch(`/api/posts/${id}/views`, { method: 'POST' });
    } catch {
      // background
    }
  };

  // Category Actions
  const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-action': 'create-category',
      },
      credentials: 'include',
      body: JSON.stringify(categoryData),
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to create category on server.');
    }

    const newCat = json.data as Category;
    setCategories((prev) => [...prev, newCat]);

    try {
      await setDoc(doc(db, 'categories', newCat.id), newCat);
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }

    return newCat;
  };

  const updateCategory = async (id: string, updatedData: Partial<Category>) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-action': 'update-category',
      },
      credentials: 'include',
      body: JSON.stringify(updatedData),
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update category on server.');
    }

    const updatedCat = json.data as Category;
    setCategories((prev) => prev.map((c) => (c.id === id ? updatedCat : c)));

    try {
      await updateDoc(doc(db, 'categories', id), updatedData);
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }
  };

  const deleteCategory = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-action': 'delete-category',
      },
      credentials: 'include',
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to delete category on server.');
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));

    try {
      await deleteDoc(doc(db, 'categories', id));
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }
  };

  // Author Actions
  const addAuthor = async (authorData: Omit<Author, 'id'>): Promise<Author> => {
    const res = await fetch('/api/admin/authors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-action': 'create-author',
      },
      credentials: 'include',
      body: JSON.stringify(authorData),
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to create author on server.');
    }

    const newAuthor = json.data as Author;
    setAuthors((prev) => [...prev, newAuthor]);

    try {
      await setDoc(doc(db, 'authors', newAuthor.id), newAuthor);
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }

    return newAuthor;
  };

  const updateAuthor = async (id: string, updatedData: Partial<Author>) => {
    const res = await fetch(`/api/admin/authors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-action': 'update-author',
      },
      credentials: 'include',
      body: JSON.stringify(updatedData),
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update author on server.');
    }

    const updatedAuthor = json.data as Author;
    setAuthors((prev) => prev.map((a) => (a.id === id ? updatedAuthor : a)));

    try {
      await updateDoc(doc(db, 'authors', id), updatedData);
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }
  };

  const deleteAuthor = async (id: string) => {
    const res = await fetch(`/api/admin/authors/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-action': 'delete-author',
      },
      credentials: 'include',
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to delete author on server.');
    }

    setAuthors((prev) => prev.filter((a) => a.id !== id));

    try {
      await deleteDoc(doc(db, 'authors', id));
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }
  };

  // Newsletter Subscription
  const subscribeNewsletter = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmed }),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json.error || 'Subscription failed.' };
      }

      return { success: true, message: json.message || 'Thank you for subscribing to Tutorials and Code.' };
    } catch {
      return { success: false, message: 'Unable to process subscription right now.' };
    }
  };

  // Settings
  const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-action': 'update-settings',
      },
      credentials: 'include',
      body: JSON.stringify(settings),
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update settings on server.');
    }

    const updated = json.data as SiteSettings;
    setSiteSettings(updated);

    try {
      await setDoc(doc(db, 'siteSettings', 'global'), updated);
      setLastCloudSync(new Date());
    } catch {
      // ignore
    }
  };

  const resetToDefaults = async () => {
    const res = await fetch('/api/admin/reset-defaults', {
      method: 'POST',
      headers: {
        'x-admin-action': 'reset-defaults',
      },
      credentials: 'include',
    });

    if (res.status === 401) {
      setIsAdminAuthenticated(false);
      throw new Error('Unauthorized: Admin session expired.');
    }

    setPosts(INITIAL_POSTS);
    setCategories(INITIAL_CATEGORIES);
    setAuthors(INITIAL_AUTHORS);
    setSiteSettings(DEFAULT_SETTINGS);

    localStorage.removeItem(STORAGE_KEY_POSTS);
    localStorage.removeItem(STORAGE_KEY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY_AUTHORS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);

    try {
      const batch = writeBatch(db);
      INITIAL_POSTS.forEach((p) => batch.set(doc(db, 'posts', p.id), p));
      INITIAL_CATEGORIES.forEach((c) => batch.set(doc(db, 'categories', c.id), c));
      INITIAL_AUTHORS.forEach((a) => batch.set(doc(db, 'authors', a.id), a));
      batch.set(doc(db, 'siteSettings', 'global'), DEFAULT_SETTINGS);
      await batch.commit();
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore reset error:', err);
    }
  };

  const exportData = (): string => {
    return JSON.stringify(
      {
        posts,
        categories,
        authors,
        subscribers,
        siteSettings,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importData = async (json: string): Promise<boolean> => {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data.posts)) setPosts(data.posts);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (Array.isArray(data.authors)) setAuthors(data.authors);
      if (data.siteSettings) setSiteSettings(data.siteSettings);

      const batch = writeBatch(db);
      if (Array.isArray(data.posts)) {
        data.posts.forEach((p: Post) => batch.set(doc(db, 'posts', p.id), p));
      }
      if (Array.isArray(data.categories)) {
        data.categories.forEach((c: Category) => batch.set(doc(db, 'categories', c.id), c));
      }
      if (Array.isArray(data.authors)) {
        data.authors.forEach((a: Author) => batch.set(doc(db, 'authors', a.id), a));
      }
      if (data.siteSettings) {
        batch.set(doc(db, 'siteSettings', 'global'), data.siteSettings);
      }
      await batch.commit();
      setLastCloudSync(new Date());
      return true;
    } catch {
      return false;
    }
  };

  // Helpers
  const getPostBySlug = (slug: string) => {
    return posts.find((p) => p.slug === slug);
  };

  const getCategoryBySlug = (slug: string) => {
    return categories.find((c) => c.slug === slug);
  };

  const getAuthorById = (id: string) => {
    return authors.find((a) => a.id === id);
  };

  const getAuthorBySlug = (slug: string) => {
    return authors.find((a) => a.slug === slug);
  };

  return (
    <BlogContext.Provider
      value={{
        posts,
        publishedPosts,
        categories,
        authors,
        subscribers,
        siteSettings,
        isAdminAuthenticated,
        isFirebaseConnected,
        lastCloudSync,
        loginAdmin,
        logoutAdmin,
        createPost,
        updatePost,
        deletePost,
        togglePostStatus,
        incrementViews,
        addCategory,
        updateCategory,
        deleteCategory,
        addAuthor,
        updateAuthor,
        deleteAuthor,
        subscribeNewsletter,
        updateSiteSettings,
        resetToDefaults,
        exportData,
        importData,
        getPostBySlug,
        getCategoryBySlug,
        getAuthorById,
        getAuthorBySlug,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}
