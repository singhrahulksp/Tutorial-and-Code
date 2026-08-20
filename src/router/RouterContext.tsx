import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface RouteParams {
  path: string;
  slug?: string;
  id?: string;
  query?: string;
}

interface RouterContextType {
  currentPath: string;
  params: RouteParams;
  navigate: (path: string) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function parsePath(pathname: string, search: string): RouteParams {
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  const searchParams = new URLSearchParams(search);
  const query = searchParams.get('q') || '';

  // Blog slug: /blog/my-slug
  const blogMatch = cleanPath.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    return { path: '/blog/[slug]', slug: blogMatch[1], query };
  }

  // Category slug: /category/my-category
  const categoryMatch = cleanPath.match(/^\/category\/([^/]+)$/);
  if (categoryMatch) {
    return { path: '/category/[slug]', slug: categoryMatch[1], query };
  }

  // Author slug: /author/my-author
  const authorMatch = cleanPath.match(/^\/author\/([^/]+)$/);
  if (authorMatch) {
    return { path: '/author/[slug]', slug: authorMatch[1], query };
  }

  // Admin edit post: /admin/posts/123/edit
  const adminEditMatch = cleanPath.match(/^\/admin\/posts\/([^/]+)\/edit$/);
  if (adminEditMatch) {
    return { path: '/admin/posts/[id]/edit', id: adminEditMatch[1], query };
  }

  return { path: cleanPath, query };
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentUrl, setCurrentUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((targetPath: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', targetPath);
      setCurrentUrl(targetPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const goBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, []);

  const [pathname, search] = currentUrl.split('?');
  const params = parsePath(pathname || '/', search ? `?${search}` : '');

  return (
    <RouterContext.Provider
      value={{
        currentPath: pathname || '/',
        params,
        navigate,
        goBack,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}
