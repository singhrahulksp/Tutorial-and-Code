import React, { useEffect, useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { SEOHead } from '../components/SEOHead';
import { TableOfContents } from '../components/TableOfContents';
import { ReadingProgressBar } from '../components/ReadingProgressBar';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { ShareButtons } from '../components/ShareButtons';
import { ArticleCard } from '../components/ArticleCard';
import { NewsletterCTA } from '../components/NewsletterCTA';
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  getCanonicalUrl,
} from '../utils/seo';
import {
  Clock,
  Calendar,
  ChevronRight,
  User,
  ArrowLeft,
  Tag,
  Share2,
  RefreshCw,
  Eye,
  CheckCircle2,
  HelpCircle,
  Link2,
  Sparkles,
} from 'lucide-react';

interface ArticlePageProps {
  slug: string;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ slug }) => {
  const { publishedPosts, posts, categories, getAuthorById, incrementViews, siteSettings } = useBlog();
  const { navigate } = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Find post (support published and admin draft preview)
  const post = posts.find((p) => p.slug === slug);

  // Increment view counter once per load
  useEffect(() => {
    if (post) {
      incrementViews(post.id);
    }
  }, [post?.id]);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
          Article Not Found
        </h1>
        <p className="text-sm text-zinc-500 mt-2">
          The requested technical publication does not exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    );
  }

  const author = getAuthorById(post.authorId);
  const category = categories.find((c) => c.slug === post.category);

  const formattedPublishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedUpdatedDate = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // Semantic Related Articles: Check explicit IDs -> shared category & shared tags
  const relatedPosts = publishedPosts
    .filter((p) => {
      if (p.id === post.id) return false;
      if (post.relatedArticleIds?.includes(p.id)) return true;
      if (p.category === post.category) return true;
      if (p.tags && post.tags && p.tags.some((t) => post.tags.includes(t))) return true;
      return false;
    })
    .slice(0, 3);

  // Canonical URL
  const canonicalUrl = post.canonicalUrl || getCanonicalUrl(`/blog/${post.slug}`, undefined, siteSettings.siteUrl);

  // Structured Data array for multi-schema graph
  const articleSchema = generateArticleSchema(post, author, category, siteSettings);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Home', url: '/' },
      { name: category?.name || post.category, url: `/category/${post.category}` },
      { name: post.title, url: `/blog/${post.slug}` },
    ],
    siteSettings.siteUrl
  );
  const faqSchema = post.faq && post.faq.length > 0 ? generateFaqSchema(post.faq) : null;

  const structuredDataGraph = [
    articleSchema,
    breadcrumbSchema,
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <article className="min-h-screen" itemScope itemType="https://schema.org/TechArticle">
      <ReadingProgressBar />

      <SEOHead
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.description}
        canonicalUrl={canonicalUrl}
        ogImage={post.ogImage || post.featuredImage}
        ogType="article"
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt || post.publishedAt}
        authorName={author?.name}
        category={category?.name || post.category}
        robots={post.status === 'draft' ? 'noindex, nofollow' : 'index, follow'}
        structuredData={structuredDataGraph}
      />

      {/* Top Header & Breadcrumb Container */}
      <div className="w-full max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 pt-8 pb-4">
        {/* Semantic Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-6 overflow-x-auto pb-1"
        >
          <button onClick={() => navigate('/')} className="hover:text-black dark:hover:text-white whitespace-nowrap">
            Home
          </button>
          <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-600 shrink-0" />
          <button
            onClick={() => navigate(`/category/${post.category}`)}
            className="hover:text-black dark:hover:text-white whitespace-nowrap"
          >
            {category?.name || post.category}
          </button>
          <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-600 shrink-0" />
          <span className="text-neutral-900 dark:text-white truncate max-w-[200px] sm:max-w-sm">
            {post.title}
          </span>
        </nav>

        {/* Draft Notice Banner */}
        {post.status === 'draft' && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
            <span className="font-bold">
              ⚠️ You are previewing an unreleased DRAFT (Index directives set to noindex).
            </span>
            <button
              onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
              className="px-2.5 py-1 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold uppercase text-[10px] tracking-wider hover:opacity-90"
            >
              Edit in CMS
            </button>
          </div>
        )}

        {/* Category Badge */}
        <div className="mb-4">
          <button
            onClick={() => navigate(`/category/${post.category}`)}
            className="text-[10px] font-bold uppercase tracking-[0.2em] bg-blue-600 text-white px-2.5 py-1 inline-block"
          >
            {category?.name || post.category}
          </button>
        </div>

        {/* Main H1 Title - Single Primary Heading */}
        <h1
          itemProp="headline"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-neutral-950 dark:text-white tracking-tighter leading-[1.05]"
        >
          {post.title}
        </h1>

        {/* Lead Excerpt */}
        <p
          itemProp="description"
          className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 mt-4 leading-relaxed font-normal max-w-4xl"
        >
          {post.description}
        </p>

        {/* Meta Bar with Semantic Dates and Author */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {author && (
              <button
                onClick={() => navigate(`/author/${author.slug}`)}
                className="flex items-center gap-2 group text-left"
              >
                <div className="w-9 h-9 overflow-hidden bg-zinc-100 dark:bg-zinc-850">
                  <img
                    src={author.avatar}
                    alt={`${author.name} portrait`}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-wider">
                    {author.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium">
                    {author.role}
                  </div>
                </div>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              Published:{' '}
              <time dateTime={post.publishedAt} className="text-zinc-700 dark:text-zinc-300">
                {formattedPublishedDate}
              </time>
            </span>

            {formattedUpdatedDate && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-zinc-400" />
                  Updated:{' '}
                  <time dateTime={post.updatedAt} className="text-zinc-700 dark:text-zinc-300">
                    {formattedUpdatedDate}
                  </time>
                </span>
              </>
            )}

            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              {post.readingTime} Min Read
            </span>

            {post.views !== undefined && post.views > 0 && (
              <>
                <span>•</span>
                <span>{post.views.toLocaleString()} Views</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Featured Cover Image with Descriptive Alt Tag */}
      <div className="w-full max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 my-8">
        <div className="w-full aspect-[21/9] sm:aspect-[21/8] bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative border border-zinc-100 dark:border-zinc-800">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
            itemProp="image"
          />
        </div>
      </div>

      {/* Article Content & Table of Contents Grid */}
      <div className="w-full max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
          
          {/* Main Article Body */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-8 min-w-0">

            {/* Answer-First Executive Summary / Direct Answer */}
            {post.directAnswer && (
              <section
                aria-label="Direct Answer Summary"
                className="p-5 sm:p-6 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-300">
                    Quick Answer & Executive Summary
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                  {post.directAnswer}
                </p>
              </section>
            )}

            {/* Key Takeaways Box */}
            {post.keyTakeaways && post.keyTakeaways.length > 0 && (
              <section
                aria-label="Key Takeaways"
                className="p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                    Key Takeaways
                  </h2>
                </div>
                <ul className="space-y-2">
                  {post.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100 mt-1.5 shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Render Main Content */}
            <div className="article-body">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* FAQ Accordion Section */}
            {post.faq && post.faq.length > 0 && (
              <section id="faq" className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-white">
                    Frequently Asked Questions
                  </h2>
                </div>
                <div className="space-y-3">
                  {post.faq.map((faqItem, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-sm overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <h3 className="font-bold text-xs sm:text-sm">{faqItem.question}</h3>
                          <ChevronRight
                            className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                              isOpen ? 'rotate-90 text-blue-600' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                            {faqItem.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Index Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">
                  Index Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                      className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-850 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <ShareButtons
                title={post.title}
                url={canonicalUrl}
              />
            </div>

            {/* Author Bio Box */}
            {author && (
              <div className="mt-12 p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 shrink-0 overflow-hidden">
                  <img
                    src={author.avatar}
                    alt={`${author.name} avatar`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/author/${author.slug}`)}
                      className="text-base font-black uppercase tracking-tight text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {author.name}
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Author & Contributor
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {author.bio}
                  </p>
                  {author.expertise && author.expertise.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {author.expertise.map((item) => (
                        <span
                          key={item}
                          className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Sidebar (TOC & Fast Navigation) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-4">
            <div className="sticky top-24 space-y-8">
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
                <TableOfContents content={post.content} />
              </div>
              <NewsletterCTA variant="compact" />
            </div>
          </aside>

        </div>
      </div>

      {/* Semantic Related Publications Grid */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] py-16">
          <div className="w-full max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">
                Related Research & Publications
              </h2>
              <button
                onClick={() => navigate(`/category/${post.category}`)}
                className="text-[11px] font-bold uppercase border-b border-black dark:border-white pb-0.5 hover:text-blue-600 transition-colors"
              >
                More in {category?.name || post.category}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((rPost) => (
                <ArticleCard key={rPost.id} post={rPost} variant="grid" />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
};
