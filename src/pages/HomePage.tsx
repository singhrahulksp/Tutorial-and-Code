import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { FeaturedCard } from '../components/FeaturedCard';
import { ArticleCard } from '../components/ArticleCard';
import { TrendingSection } from '../components/TrendingSection';
import { NewsletterCTA } from '../components/NewsletterCTA';
import { SEOHead } from '../components/SEOHead';
import { generateOrganizationSchema, generateWebSiteSchema, getCanonicalUrl } from '../utils/seo';
import { ArrowRight, Layers } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { publishedPosts, categories, siteSettings } = useBlog();
  const { navigate } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState<number>(6);

  // Identify featured post and secondary posts
  const featuredPost = publishedPosts.find((p) => p.featured) || publishedPosts[0];
  const secondaryPosts = publishedPosts
    .filter((p) => p.id !== featuredPost?.id)
    .slice(0, 3);

  // Remaining posts
  const remainingPosts = publishedPosts.filter(
    (p) => p.id !== featuredPost?.id && !secondaryPosts.some((sp) => sp.id === p.id)
  );

  // Top 2 for "Latest Insights" in the 8-col / 4-col split block
  const latestInsights = remainingPosts.slice(0, 2);

  // Filter for the bottom explore grid
  const filteredPosts = selectedCategory === 'all'
    ? remainingPosts
    : publishedPosts.filter((p) => p.category === selectedCategory);

  const visiblePosts = filteredPosts.slice(0, displayCount);
  const hasMore = visiblePosts.length < filteredPosts.length;

  const canonicalUrl = getCanonicalUrl('/', undefined, siteSettings.siteUrl);
  const orgSchema = generateOrganizationSchema(siteSettings);
  const websiteSchema = generateWebSiteSchema(siteSettings);

  return (
    <div className="w-full max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <SEOHead
        pagePath="/"
        title="Tutorials and Code — Engineering Tutorials, Clean Architectures & Code Deep Dives"
        description={siteSettings.description}
        canonicalUrl={canonicalUrl}
        structuredData={[orgSchema, websiteSchema]}
      />

      {/* Hero Section (8-col Hero + 4-col Stacked Secondary Stories) */}
      {featuredPost && (
        <FeaturedCard post={featuredPost} secondaryPosts={secondaryPosts} />
      )}

      {/* Editorial Dual Section: 8-col Latest Insights + 4-col Trending & Weekly Pulse */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-zinc-100 dark:border-zinc-800 mb-14 bg-white dark:bg-[#0a0a0a]">
        
        {/* Col 8: Latest Insights */}
        <div className="lg:col-span-8 p-6 sm:p-8 lg:border-r border-b lg:border-b-0 border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">
                Latest Insights & Deep Dives
              </h2>
              <button
                onClick={() => navigate('/latest')}
                className="text-[11px] font-bold uppercase border-b border-black dark:border-white pb-0.5 hover:text-blue-600 transition-colors"
              >
                View All Articles
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {latestInsights.map((post) => (
                <ArticleCard key={post.id} post={post} variant="grid" />
              ))}
            </div>
          </div>
        </div>

        {/* Col 4: Trending Stack + Weekly Pulse Box */}
        <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900/40 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">
              Trending Engineering Tracks
            </h2>
            <div className="flex flex-col gap-6">
              {publishedPosts.slice(0, 3).map((post, idx) => {
                const cat = categories.find((c) => c.slug === post.category);
                const num = String(idx + 1).padStart(2, '0');
                return (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    className="flex gap-4 items-start group cursor-pointer"
                  >
                    <span className="text-3xl font-black text-zinc-200 dark:text-zinc-700 leading-none shrink-0 w-8 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {num}
                    </span>
                    <div>
                      <h4 className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">
                        {cat?.name || post.category}
                      </h4>
                      <h3 className="text-[13px] font-bold leading-tight text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <h5 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                        Rank #{idx + 1} Trending
                      </h5>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <NewsletterCTA variant="compact" />
        </div>
      </section>

      {/* Categories Filter & Full Deep-Dive Archive */}
      <section className="my-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase text-neutral-900 dark:text-white">
              Archive & Technical Domains
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-wider font-semibold">
              Filter peer-reviewed engineering analyses
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setDisplayCount(6);
              }}
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
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setDisplayCount(6);
                  }}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected
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
        </div>

        {/* Articles Grid */}
        <div className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visiblePosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="grid" />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => setDisplayCount((prev) => prev + 6)}
                className="px-8 py-3 text-xs font-bold uppercase tracking-widest border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
              >
                Load More Articles ({filteredPosts.length - visiblePosts.length} remaining)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Full Banner */}
      <NewsletterCTA variant="card" />
    </div>
  );
};
