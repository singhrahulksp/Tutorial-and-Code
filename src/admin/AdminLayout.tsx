import React from 'react';
import { useRouter } from '../router/RouterContext';
import { useBlog } from '../context/BlogContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { SEOHead } from '../components/SEOHead';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderTree,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Cloud,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actionButton,
}) => {
  const { currentPath, navigate } = useRouter();
  const { logoutAdmin, posts, isFirebaseConnected } = useBlog();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'All Articles', path: '/admin/posts', icon: FileText, badge: posts.length },
    { name: 'New Article', path: '/admin/posts/new', icon: PlusCircle },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Authors', path: '/admin/authors', icon: Users },
    { name: 'Settings & Cloud', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 flex flex-col md:flex-row transition-colors duration-200">
      <SEOHead
        title={`${title} | Tutorials and Code CMS Admin`}
        robots="noindex, nofollow"
      />
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0a0a0a] border-r border-zinc-100 dark:border-zinc-800 shrink-0 flex flex-col justify-between">
        <div>
          {/* Admin Header / Brand */}
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-black text-base uppercase tracking-tighter text-black dark:text-white">
                Tutorials & Code <span className="text-xs font-mono font-normal text-zinc-400">CMS</span>
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                {isFirebaseConnected ? 'Firestore Connected' : 'Connecting to Cloud...'}
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  id={`admin-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono ${
                        isActive
                          ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black'
                          : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate font-mono">Firestore: gen-lang-client</span>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="px-6 py-5 bg-white dark:bg-[#0a0a0a] border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
            )}
          </div>

          {actionButton && <div>{actionButton}</div>}
        </header>

        {/* Page Content Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

    </div>
  );
};
