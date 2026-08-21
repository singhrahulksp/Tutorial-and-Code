import React, { useState, useMemo } from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead } from '../components/SEOHead';
import { NewsletterCTA } from '../components/NewsletterCTA';
import { ArrowUpDown, Grid, List } from 'lucide-react';

export const LatestPage: React.FC = () => {
  const { publishedPosts, categories } = useBlog();
  const { navigate } = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'quickest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'horizontal'>('grid');

  const filteredAndSortedPosts = useMemo(() => {
    let result = [...publishedPosts];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'quickest') {
      result.sort((a, b) => a.readingTime - b.readingTime);
    }

    return result;
  }, [publishedPosts, selectedCategory, sortBy]);

  return (
    <div className="w-full max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 py-8">
      <SEOHead
        pagePath="/latest"
        title="Latest Tech Articles, Tutorials & Systems Research"
        description="Explore all recent engineering breakdowns, programming tutorials, architectural insights, and code guides on Tutorials and Code."
        canonicalUrl="https://tutorialsandcode.dev/latest"
      />

      {/* Header */}
      <div className="mb-10 pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
          <span>Editorial Index</span>
          <span>•</span>
          <span>{filteredAndSortedPosts.length} Articles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
          Latest Dispatches
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          The complete chronological archive of technical essays, benchmarks, architectural post-mortems, and technology news.
        </p>

        {/* Filters and Controls */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              All ({publishedPosts.length})
            </button>
            {categories.map((cat) => {
              const count = publishedPosts.filter((p) => p.category === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat.slug
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] font-mono opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Sort and View Toggle */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-neutral-800 dark:text-neutral-200 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Read</option>
                <option value="quickest">Quickest Read</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center p-1 bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 ${viewMode === 'grid' ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' : 'text-zinc-500'}`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('horizontal')}
                className={`p-1 ${viewMode === 'horizontal' ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' : 'text-zinc-500'}`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Feed Section */}
      <section aria-label="Chronological Dispatches">
        <h2 className="sr-only">Dispatches Feed</h2>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedPosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-w-5xl mx-auto">
            {filteredAndSortedPosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="horizontal" />
            ))}
          </div>
        )}
      </section>

      {filteredAndSortedPosts.length === 0 && (
        <div className="py-20 text-center text-zinc-500">
          <p className="text-base font-bold text-neutral-800 dark:text-neutral-200">No articles match your current filter.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-3 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black"
          >
            Reset Filters
          </button>
        </div>
      )}

      <NewsletterCTA />
    </div>
  );
};
