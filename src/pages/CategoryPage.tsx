import React from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead } from '../components/SEOHead';
import { NewsletterCTA } from '../components/NewsletterCTA';
import { generateBreadcrumbSchema, getCanonicalUrl } from '../utils/seo';
import { ChevronRight, Layers, ArrowLeft, Hash } from 'lucide-react';

interface CategoryPageProps {
  slug: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ slug }) => {
  const { publishedPosts, getCategoryBySlug, siteSettings } = useBlog();
  const { navigate } = useRouter();

  const category = getCategoryBySlug(slug) || {
    id: 'unknown',
    name: slug.replace(/-/g, ' ').toUpperCase(),
    slug,
    description: `Articles and technical research focusing on ${slug.replace(/-/g, ' ')}.`,
    color: 'neutral',
    iconName: 'Code',
  };

  const categoryPosts = publishedPosts.filter((p) => p.category === slug);
  const featuredCategoryPost = categoryPosts.find((p) => p.featured) || categoryPosts[0];
  const remainingCategoryPosts = categoryPosts.filter((p) => p.id !== featuredCategoryPost?.id);

  const canonicalUrl = getCanonicalUrl(`/category/${slug}`, undefined, siteSettings.siteUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Home', url: '/' },
      { name: 'Topics', url: '/latest' },
      { name: category.name, url: `/category/${slug}` },
    ],
    siteSettings.siteUrl
  );

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Technical Hub | Tutorials and Code`,
    description: category.description,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: categoryPosts.map((post, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: getCanonicalUrl(`/blog/${post.slug}`, undefined, siteSettings.siteUrl),
        name: post.title,
      })),
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEOHead
        title={`${category.name} — Technical Guides & Architecture Breakdowns`}
        description={category.description}
        canonicalUrl={canonicalUrl}
        category={category.name}
        structuredData={[collectionSchema, breadcrumbSchema]}
      />

      {/* Semantic Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-6"
      >
        <button onClick={() => navigate('/')} className="hover:text-black dark:hover:text-white">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-600" />
        <button onClick={() => navigate('/latest')} className="hover:text-black dark:hover:text-white">
          Topics
        </button>
        <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-600" />
        <span className="text-neutral-900 dark:text-white">{category.name}</span>
      </nav>

      {/* Category Hero Header (Topic Hub) */}
      <div className="mb-12 p-8 sm:p-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-sm">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-blue-600 text-white px-2.5 py-1 mb-3 inline-block">
          Topic Hub
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
          {category.name}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-3 max-w-3xl leading-relaxed">
          {category.description}
        </p>

        {/* Subtopic Navigation Chips for Topical Authority */}
        {category.subtopics && category.subtopics.length > 0 && (
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2.5">
              Core Subtopics & Focus Areas
            </div>
            <div className="flex flex-wrap gap-2">
              {category.subtopics.map((subtopic) => (
                <button
                  key={subtopic}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(subtopic)}`)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-blue-500 transition-colors"
                >
                  <Hash className="w-3 h-3 text-blue-500" />
                  {subtopic}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          {categoryPosts.length} published {categoryPosts.length === 1 ? 'article' : 'articles'} in this track
        </div>
      </div>

      {/* Primary Category Highlight */}
      {featuredCategoryPost && (
        <section className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-4">
            Category Lead Analysis
          </h2>
          <ArticleCard post={featuredCategoryPost} variant="horizontal" />
        </section>
      )}

      {/* Category Articles Grid */}
      {remainingCategoryPosts.length > 0 && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-6">
            All {category.name} Publications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingCategoryPosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="grid" />
            ))}
          </div>
        </section>
      )}

      {categoryPosts.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
          <Layers className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white">
            No articles published in {category.name} yet
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Our editorial research team is preparing new breakdowns for this track.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return Home
          </button>
        </div>
      )}

      <NewsletterCTA />
    </div>
  );
};
