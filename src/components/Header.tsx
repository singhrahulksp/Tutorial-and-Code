import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { useRouter } from '../router/RouterContext';
import { useBlog } from '../context/BlogContext';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { currentPath, navigate } = useRouter();
  const { categories } = useBlog();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainCategories = categories.slice(0, 6);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md transition-colors duration-200">
      <div className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Primary Nav */}
          <div className="flex items-center gap-8 lg:gap-10">
            <button
              id="header-logo-btn"
              onClick={() => handleNav('/')}
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <span className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-black dark:text-white">
                Tutorials & Code
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <button
                id="nav-link-latest"
                onClick={() => handleNav('/latest')}
                className={`transition-colors py-1 ${
                  currentPath === '/latest'
                    ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-extrabold'
                    : 'hover:text-black dark:hover:text-white'
                }`}
              >
                Latest
              </button>

              {mainCategories.map((cat) => {
                const isActive = currentPath === `/category/${cat.slug}`;
                return (
                  <button
                    key={cat.id}
                    id={`nav-link-${cat.slug}`}
                    onClick={() => handleNav(`/category/${cat.slug}`)}
                    className={`transition-colors py-1 whitespace-nowrap ${
                      isActive
                        ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-extrabold'
                        : 'hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {cat.name.split(' ')[0]}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Quick Search Button */}
            <button
              id="header-search-btn"
              onClick={onOpenSearch ? onOpenSearch : () => handleNav('/search')}
              aria-label="Search articles"
              className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-1"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Trigger */}
            <button
              id="header-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] px-6 pt-4 pb-8 space-y-6 shadow-xl">
          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Menu
            </div>
            <button
              onClick={() => handleNav('/')}
              className={`w-full text-left py-2 text-sm font-bold uppercase tracking-wider ${
                currentPath === '/' ? 'text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('/latest')}
              className={`w-full text-left py-2 text-sm font-bold uppercase tracking-wider ${
                currentPath === '/latest' ? 'text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Latest Articles
            </button>
            <button
              onClick={() => handleNav('/about')}
              className={`w-full text-left py-2 text-sm font-bold uppercase tracking-wider ${
                currentPath === '/about' ? 'text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              About Tutorials & Code
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Domains
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleNav(`/category/${cat.slug}`)}
                  className={`text-left py-1 text-xs font-bold uppercase tracking-wider truncate ${
                    currentPath === `/category/${cat.slug}`
                      ? 'text-black dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
