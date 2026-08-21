import React, { useState, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead } from '../components/SEOHead';
import { Search, X, BookOpen } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { publishedPosts, categories } = useBlog();
  const { params, navigate } = useRouter();

  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (params.query !== undefined) {
      setSearchQuery(params.query);
    }
  }, [params.query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchResults = publishedPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    const matchesTitle = post.title.toLowerCase().includes(normalizedQuery);
    const matchesDesc = post.description.toLowerCase().includes(normalizedQuery);
    const matchesCat = post.category.toLowerCase().includes(normalizedQuery);
    const matchesTags = post.tags.some((t) => t.toLowerCase().includes(normalizedQuery));

    return matchesTitle || matchesDesc || matchesCat || matchesTags;
  });

  return (
    <div className="w-full max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 py-8">
      <SEOHead
        pagePath="/search"
        title={normalizedQuery ? `Search: "${searchQuery}" | Tutorials and Code` : 'Search Technical Publications & Guides | Tutorials and Code'}
        description="Search through engineering breakdowns, coding tutorials, AI architecture studies, and cybersecurity reviews."
        canonicalUrl="https://tutorialsandcode.dev/search"
        robots="noindex, follow"
      />

      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-blue-600 text-white px-2.5 py-1 mb-3 inline-block">
          Index Search
        </span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
          Search Tutorials & Code Archive
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Find deep dives by keyword, technical concept, technology tag, or category
        </p>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="mt-8 flex border border-black dark:border-white">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search RAG, Rust, Zero-Trust, Serverless, LLM, Web Vitals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base bg-transparent text-neutral-900 dark:text-white placeholder:text-zinc-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity shrink-0"
          >
            Search
          </button>
        </form>

        {/* Popular Search Suggestions */}
        <div className="flex items-center justify-center gap-2 flex-wrap mt-4 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Popular:</span>
          {['RAG', 'Rust', 'Zero-Trust', 'AI Agents', 'Performance', 'Startups'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchQuery(tag);
                navigate(`/search?q=${encodeURIComponent(tag)}`);
              }}
              className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-850 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-8 border-b border-zinc-100 dark:border-zinc-800">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Found <span className="text-neutral-900 dark:text-white">{searchResults.length}</span> {searchResults.length === 1 ? 'article' : 'articles'}
          {normalizedQuery && <span> for "{searchQuery}"</span>}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              selectedCategory === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid Section */}
      <section aria-label="Search Results Feed">
        <h2 className="sr-only">Matching Publications</h2>
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResults.map((post) => (
              <ArticleCard key={post.id} post={post} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
            <BookOpen className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              No matching articles found
            </h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              We couldn't find any articles matching your search query. Try checking your spelling or using broader search terms.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                navigate('/search');
              }}
              className="mt-5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black"
            >
              Clear Search Filter
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
