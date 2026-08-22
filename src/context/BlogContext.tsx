import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Post, Category, Author, NewsletterSubscriber, SiteSettings, PageMetaConfig } from '../types';
import { INITIAL_POSTS } from '../data/initialPosts';
import { INITIAL_CATEGORIES } from '../data/categories';
import { INITIAL_AUTHORS } from '../data/authors';
import {
  verifyAdminPassword,
  createAdminSession,
  getValidAdminSession,
  clearAdminSession,
} from '../utils/security';
import {
  db,
  collection,
  doc,
  getDocs,
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
const STORAGE_KEY_AUTH = 'tutorialsandcode_admin_auth_v1';

export const DEFAULT_PAGE_META_OVERRIDES: Record<string, PageMetaConfig> = {
  '/': {
    path: '/',
    pageName: 'Landing / Home Page',
    title: 'Tutorials and Code — Engineering Tutorials, Clean Architectures & Code Deep Dives',
    description: 'In-depth programming tutorials, clean code architectures, AI systems, and software engineering analysis for builders.',
    canonicalUrl: 'https://www.tutorialsandcode.in',
    keywords: 'software engineering, tutorials, clean code, AI architecture, rust, web performance, zero-trust',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80',
  },
  '/latest': {
    path: '/latest',
    pageName: 'Latest Dispatches',
    title: 'Latest Engineering Dispatches & Technical Guides | Tutorials and Code',
    description: 'Chronological archive of all published engineering tutorials, system breakdowns, and research articles.',
    canonicalUrl: 'https://www.tutorialsandcode.in/latest',
    keywords: 'latest tutorials, coding guides, technical feed, systems architecture',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80',
  },
  '/search': {
    path: '/search',
    pageName: 'Search Archive',
    title: 'Search Technical Publications & Guides | Tutorials and Code',
    description: 'Search through engineering breakdowns, coding tutorials, AI architecture studies, and cybersecurity reviews.',
    canonicalUrl: 'https://www.tutorialsandcode.in/search',
    keywords: 'search coding tutorials, engineering search, code index',
    robots: 'noindex, follow',
  },
  '/about': {
    path: '/about',
    pageName: 'About & Editorial Masthead',
    title: 'About Tutorials and Code — Editorial Standards & Technical Mission',
    description: 'Tutorials and Code is an independent publication dedicated to software architecture, AI systems, clean coding tutorials, and engineering craft.',
    canonicalUrl: 'https://www.tutorialsandcode.in/about',
    keywords: 'about tutorials and code, editorial standards, engineering masthead',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80',
  },
  '/contact': {
    path: '/contact',
    pageName: 'Contact Newsroom',
    title: 'Contact Editorial Staff & Newsroom — Tutorials and Code',
    description: 'Submit code tutorials, report technical corrections, pitch guest articles, or contact the Tutorials and Code staff.',
    canonicalUrl: 'https://www.tutorialsandcode.in/contact',
    keywords: 'contact editorial, pitch tutorial, report bug, code errata',
    robots: 'index, follow',
  },
  '/privacy': {
    path: '/privacy',
    pageName: 'Privacy Policy',
    title: 'Privacy Policy & Zero-Tracking Manifesto — Tutorials and Code',
    description: 'Our zero-tracking and privacy commitment to technical readers.',
    canonicalUrl: 'https://www.tutorialsandcode.in/privacy',
    robots: 'index, follow',
  },
  '/terms': {
    path: '/terms',
    pageName: 'Terms of Service',
    title: 'Terms of Service & Code Licensing — Tutorials and Code',
    description: 'Terms of service, open-source code licensing, and publication rights.',
    canonicalUrl: 'https://www.tutorialsandcode.in/terms',
    robots: 'index, follow',
  },
  '/sitemap': {
    path: '/sitemap',
    pageName: 'Sitemap & Index',
    title: 'Dynamic XML Sitemap & Editorial Index | Tutorials and Code',
    description: 'Search engine and crawler XML index of all published articles, category tracks, and author profiles crawled dynamically from Firestore.',
    canonicalUrl: 'https://www.tutorialsandcode.in/sitemap.xml',
    robots: 'index, follow',
  },
};

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Tutorials and Code',
  tagline: 'Engineering Tutorials, Clean Architectures & Code Deep Dives',
  description: 'In-depth programming tutorials, clean code architectures, AI systems, and software engineering analysis for builders.',
  siteUrl: 'https://www.tutorialsandcode.in',
  faviconUrl: '/favicon.svg',
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
  loginAdmin: (password: string) => Promise<{ success: boolean; reason?: string }>;
  logoutAdmin: () => void;
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

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const validSession = getValidAdminSession();
      return Boolean(validSession);
    }
    return false;
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [lastCloudSync, setLastCloudSync] = useState<Date | null>(null);

  // Periodic session validity check
  useEffect(() => {
    const interval = setInterval(() => {
      const validSession = getValidAdminSession();
      if (!validSession && isAdminAuthenticated) {
        setIsAdminAuthenticated(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isAdminAuthenticated]);

  // Sync to LocalStorage as offline / instant fallback
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

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
              // Seed initial posts to Firestore
              console.log('Seeding initial posts to Firestore...');
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

  // Synchronize dynamic favicon to document head
  useEffect(() => {
    const favicon = siteSettings?.faviconUrl?.trim() || '/favicon.svg';
    let linkIcon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!linkIcon) {
      linkIcon = document.createElement('link');
      linkIcon.rel = 'icon';
      document.head.appendChild(linkIcon);
    }
    linkIcon.href = favicon;
    if (favicon.endsWith('.svg') || favicon.startsWith('data:image/svg')) {
      linkIcon.type = 'image/svg+xml';
    } else if (favicon.endsWith('.png') || favicon.startsWith('data:image/png')) {
      linkIcon.type = 'image/png';
    } else if (favicon.endsWith('.ico') || favicon.startsWith('data:image/x-icon') || favicon.startsWith('data:image/vnd.microsoft.icon')) {
      linkIcon.type = 'image/x-icon';
    }

    let linkApple = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
    if (!linkApple) {
      linkApple = document.createElement('link');
      linkApple.rel = 'apple-touch-icon';
      document.head.appendChild(linkApple);
    }
    linkApple.href = favicon;
  }, [siteSettings?.faviconUrl]);

  // Published posts sorted by date
  const publishedPosts = useMemo(() => {
    return posts
      .filter((p) => p.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [posts]);

  // Auth Methods
  const loginAdmin = async (password: string): Promise<{ success: boolean; reason?: string }> => {
    const result = await verifyAdminPassword(password, siteSettings?.customAdminPasswordHash);
    if (result.success) {
      createAdminSession();
      setIsAdminAuthenticated(true);
      return { success: true };
    }
    return {
      success: false,
      reason: result.reason || 'Invalid admin credentials.',
    };
  };

  const logoutAdmin = () => {
    clearAdminSession();
    setIsAdminAuthenticated(false);
  };

  // Post Actions (Firestore + Optimistic State)
  const createPost = async (postData: Omit<Post, 'id' | 'views'>): Promise<Post> => {
    const newId = `post-${Date.now()}`;
    const newPost: Post = {
      ...postData,
      id: newId,
      views: 0,
    };

    setPosts((prev) => [newPost, ...prev]);

    try {
      await setDoc(doc(db, 'posts', newId), newPost);
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore createPost error:', err);
    }

    return newPost;
  };

  const updatePost = async (id: string, updatedData: Partial<Post>) => {
    const updatePayload = {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatePayload } : p))
    );

    try {
      await updateDoc(doc(db, 'posts', id), updatePayload);
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore updatePost error:', err);
    }
  };

  const deletePost = async (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteDoc(doc(db, 'posts', id));
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore deletePost error:', err);
    }
  };

  const togglePostStatus = async (id: string) => {
    const targetPost = posts.find((p) => p.id === id);
    if (!targetPost) return;

    const nextStatus: 'draft' | 'published' = targetPost.status === 'published' ? 'draft' : 'published';
    const updatePayload = {
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatePayload } : p))
    );

    try {
      await updateDoc(doc(db, 'posts', id), updatePayload);
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore togglePostStatus error:', err);
    }
  };

  const incrementViews = async (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p))
    );

    try {
      const currentPost = posts.find((p) => p.id === id);
      const newViews = (currentPost?.views || 0) + 1;
      await updateDoc(doc(db, 'posts', id), { views: newViews });
    } catch {
      // Background non-blocking increment
    }
  };

  // Category Actions
  const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const newId = `cat-${Date.now()}`;
    const newCat: Category = {
      ...categoryData,
      id: newId,
    };

    setCategories((prev) => [...prev, newCat]);

    try {
      await setDoc(doc(db, 'categories', newId), newCat);
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore addCategory error:', err);
    }

    return newCat;
  };

  const updateCategory = async (id: string, updatedData: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );

    try {
      await updateDoc(doc(db, 'categories', id), updatedData);
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore updateCategory error:', err);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));

    try {
      await deleteDoc(doc(db, 'categories', id));
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore deleteCategory error:', err);
    }
  };

  // Author Actions
  const addAuthor = async (authorData: Omit<Author, 'id'>): Promise<Author> => {
    const newId = `auth-${Date.now()}`;
    const newAuthor: Author = {
      ...authorData,
      id: newId,
    };

    setAuthors((prev) => [...prev, newAuthor]);

    try {
      await setDoc(doc(db, 'authors', newId), newAuthor);
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore addAuthor error:', err);
    }

    return newAuthor;
  };

  const updateAuthor = async (id: string, updatedData: Partial<Author>) => {
    setAuthors((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedData } : a))
    );

    try {
      await updateDoc(doc(db, 'authors', id), updatedData);
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore updateAuthor error:', err);
    }
  };

  const deleteAuthor = async (id: string) => {
    setAuthors((prev) => prev.filter((a) => a.id !== id));

    try {
      await deleteDoc(doc(db, 'authors', id));
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore deleteAuthor error:', err);
    }
  };

  // Newsletter Subscription
  const subscribeNewsletter = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    const exists = subscribers.some((s) => s.email.toLowerCase() === trimmed);
    if (exists) {
      return { success: true, message: "You're already subscribed! Thank you." };
    }
    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: trimmed,
      subscribedAt: new Date().toISOString(),
    };

    setSubscribers((prev) => [newSub, ...prev]);

    try {
      await setDoc(doc(db, 'subscribers', newSub.id), newSub);
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore subscribe error:', err);
    }

    return { success: true, message: 'Thank you for subscribing to Tutorials and Code.' };
  };

  // Settings
  const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...settings };
    setSiteSettings(updated);

    try {
      await setDoc(doc(db, 'siteSettings', 'global'), updated);
      setLastCloudSync(new Date());
    } catch (err) {
      console.error('Firestore updateSiteSettings error:', err);
    }
  };

  const resetToDefaults = async () => {
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
