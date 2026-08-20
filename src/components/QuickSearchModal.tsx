import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowRight, Tag, BookOpen } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const { publishedPosts, categories } = useBlog();
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent or direct handler
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  const filteredPosts = normalizedQuery
    ? publishedPosts.filter((post) => {
        return (
          post.title.toLowerCase().includes(normalizedQuery) ||
          post.description.toLowerCase().includes(normalizedQuery) ||
          post.category.toLowerCase().includes(normalizedQuery) ||
          post.tags.some((t) => t.toLowerCase().includes(normalizedQuery))
        );
      })
    : publishedPosts.slice(0, 4); // Default recent suggestions

  const handleSelectPost = (slug: string) => {
    onClose();
    navigate(`/blog/${slug}`);
  };

  const handleSelectCategory = (catSlug: string) => {
    onClose();
    navigate(`/category/${catSlug}`);
  };

  const handleFullSearch = () => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search AI, architecture, programming, cloud..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleFullSearch();
              }
            }}
            className="flex-1 bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          >
            ESC
          </button>
        </div>

        {/* Quick Category Chips */}
        <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/30 dark:bg-neutral-950/20 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-neutral-400 text-[11px] font-mono mr-1 shrink-0">Filter:</span>
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.slug)}
              className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 whitespace-nowrap transition-colors"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {filteredPosts.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {normalizedQuery ? `Articles (${filteredPosts.length})` : 'Recent Analyses'}
              </div>
              {filteredPosts.map((post) => {
                const cat = categories.find((c) => c.slug === post.category);
                return (
                  <button
                    key={post.id}
                    onClick={() => handleSelectPost(post.slug)}
                    className="w-full text-left p-3 rounded-xl hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 flex items-start gap-3 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200/60 dark:border-neutral-700">
                      <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-neutral-500 dark:text-neutral-400">
                          {cat?.name || post.category}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">•</span>
                        <span className="text-neutral-400 font-mono">{post.readingTime}m read</span>
                      </div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 truncate mt-0.5">
                        {post.title}
                      </div>
                      <div className="text-xs text-neutral-500 truncate mt-0.5">
                        {post.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-neutral-900 dark:group-hover:text-white transition-all shrink-0 mt-2" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                No matching technical articles found
              </div>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Try searching for broader terms like "AI", "Rust", "Zero-Trust", "Kubernetes", or "Scale".
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {query.trim() && (
          <div className="px-4 py-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between text-xs text-neutral-500">
            <span>Press Enter for full results page</span>
            <button
              onClick={handleFullSearch}
              className="font-semibold text-neutral-900 dark:text-white hover:underline flex items-center gap-1"
            >
              See all results <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
