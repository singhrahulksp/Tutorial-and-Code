import React, { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BlogProvider, useBlog } from './context/BlogContext';
import { RouterProvider, useRouter } from './router/RouterContext';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { QuickSearchModal } from './components/QuickSearchModal';

// Public Pages
import { HomePage } from './pages/HomePage';
import { LatestPage } from './pages/LatestPage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { AuthorPage } from './pages/AuthorPage';
import { SearchPage } from './pages/SearchPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { SitemapPage } from './pages/SitemapPage';

// Admin Pages
import { AdminLoginPage } from './admin/AdminLoginPage';
import { AdminDashboardPage } from './admin/AdminDashboardPage';
import { AdminPostsPage } from './admin/AdminPostsPage';
import { AdminEditorPage } from './admin/AdminEditorPage';
import { AdminCategoriesPage } from './admin/AdminCategoriesPage';
import { AdminAuthorsPage } from './admin/AdminAuthorsPage';
import { AdminSettingsPage } from './admin/AdminSettingsPage';

import { ArrowLeft, Compass } from 'lucide-react';

const AppRoutes: React.FC = () => {
  const { currentPath, params, navigate } = useRouter();
  const { isAdminAuthenticated } = useBlog();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Keyboard shortcut cmd+k to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to top upon page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPath]);

  // Admin Route Protection Helper
  const requireAdmin = (Component: React.ReactNode) => {
    if (!isAdminAuthenticated) {
      return <AdminLoginPage />;
    }
    return Component;
  };

  // Determine if current page is within Admin Workspace
  const isAdminRoute = currentPath.startsWith('/admin');

  const renderCurrentPage = () => {
    // 1. Home Page
    if (currentPath === '/') {
      return <HomePage />;
    }

    // 2. Latest Feed
    if (currentPath === '/latest') {
      return <LatestPage />;
    }

    // 3. Category Hub (/category/[slug])
    if (currentPath.startsWith('/category/') && params.slug) {
      return <CategoryPage slug={params.slug} />;
    }

    // 4. Single Article (/blog/[slug])
    if (currentPath.startsWith('/blog/') && params.slug) {
      return <ArticlePage slug={params.slug} />;
    }

    // 5. Author Profile (/author/[slug])
    if (currentPath.startsWith('/author/') && params.slug) {
      return <AuthorPage slug={params.slug} />;
    }

    // 6. Search Page
    if (currentPath.startsWith('/search')) {
      return <SearchPage />;
    }

    // 7. About Page
    if (currentPath === '/about') {
      return <AboutPage />;
    }

    // 8. Contact Page
    if (currentPath === '/contact') {
      return <ContactPage />;
    }

    // 9. Legal Pages
    if (currentPath === '/privacy') {
      return <LegalPage type="privacy" />;
    }
    if (currentPath === '/terms') {
      return <LegalPage type="terms" />;
    }

    // 10. Sitemap
    if (currentPath === '/sitemap' || currentPath === '/sitemap.xml') {
      return <SitemapPage />;
    }

    // 11. Admin Login
    if (currentPath === '/admin/login') {
      return <AdminLoginPage />;
    }

    // 12. Admin Dashboard Overview
    if (currentPath === '/admin') {
      return requireAdmin(<AdminDashboardPage />);
    }

    // 13. Admin Posts List
    if (currentPath === '/admin/posts') {
      return requireAdmin(<AdminPostsPage />);
    }

    // 14. Admin New Post
    if (currentPath === '/admin/posts/new') {
      return requireAdmin(<AdminEditorPage />);
    }

    // 15. Admin Edit Post (/admin/posts/[id]/edit)
    if (currentPath.startsWith('/admin/posts/') && currentPath.endsWith('/edit')) {
      return requireAdmin(<AdminEditorPage />);
    }

    // 16. Admin Categories
    if (currentPath === '/admin/categories') {
      return requireAdmin(<AdminCategoriesPage />);
    }

    // 17. Admin Authors
    if (currentPath === '/admin/authors') {
      return requireAdmin(<AdminAuthorsPage />);
    }

    // 18. Admin Settings
    if (currentPath === '/admin/settings') {
      return requireAdmin(<AdminSettingsPage />);
    }

    // 19. 404 Fallback
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center mb-4">
          <Compass className="w-6 h-6" />
        </div>
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-1">
          404 Error • Path Not Found
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Page Not Located
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-sm">
          The requested URL path does not exist in the Tutorials and Code index or has been migrated.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Home Feed
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0d0e] text-neutral-900 dark:text-neutral-100 transition-colors duration-150 flex flex-col font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-neutral-100 dark:selection:text-neutral-950">
      {!isAdminRoute && <Header onOpenSearch={() => setIsSearchOpen(true)} />}
      <main className="flex-1">{renderCurrentPage()}</main>
      {!isAdminRoute && <Footer />}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <BlogProvider>
        <RouterProvider>
          <AppRoutes />
        </RouterProvider>
      </BlogProvider>
    </ThemeProvider>
  );
}
