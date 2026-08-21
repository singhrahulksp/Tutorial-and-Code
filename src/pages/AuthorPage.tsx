import React from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead } from '../components/SEOHead';
import { NewsletterCTA } from '../components/NewsletterCTA';
import { generateAuthorProfileSchema, generateBreadcrumbSchema, getCanonicalUrl } from '../utils/seo';
import { Twitter, Github, Globe, BookOpen, ChevronRight, ArrowLeft, Award } from 'lucide-react';

interface AuthorPageProps {
  slug: string;
}

export const AuthorPage: React.FC<AuthorPageProps> = ({ slug }) => {
  const { publishedPosts, getAuthorBySlug, siteSettings } = useBlog();
  const { navigate } = useRouter();

  const author = getAuthorBySlug(slug);

  if (!author) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">Author Not Found</h1>
        <p className="text-sm text-zinc-500 mt-2">
          The requested writer or researcher profile does not exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Return Home
        </button>
      </div>
    );
  }

  const authorPosts = publishedPosts.filter((p) => p.authorId === author.id);
  const canonicalUrl = getCanonicalUrl(`/author/${author.slug}`, undefined, siteSettings.siteUrl);

  const authorSchema = generateAuthorProfileSchema(author, siteSettings.siteUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Home', url: '/' },
      { name: 'Authors', url: '/latest' },
      { name: author.name, url: `/author/${author.slug}` },
    ],
    siteSettings.siteUrl
  );

  return (
    <div className="w-full max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 py-8" itemScope itemType="https://schema.org/ProfilePage">
      <SEOHead
        pagePath={`/author/${author.slug}`}
        title={`${author.name} — Technical Author & Systems Researcher`}
        description={author.bio}
        canonicalUrl={canonicalUrl}
        ogImage={author.avatar}
        ogType="profile"
        authorName={author.name}
        structuredData={[authorSchema, breadcrumbSchema]}
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
        <span className="text-zinc-500 dark:text-zinc-400">Authors</span>
        <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-600" />
        <span className="text-neutral-900 dark:text-white">{author.name}</span>
      </nav>

      {/* Author Header Card with Person Entity Semantics */}
      <header
        itemProp="mainEntity"
        itemScope
        itemType="https://schema.org/Person"
        className="p-8 sm:p-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-sm mb-12"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={author.avatar}
            alt={`${author.name} photograph`}
            itemProp="image"
            className="w-24 h-24 sm:w-28 sm:h-28 object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
          />

          <div className="space-y-2 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-blue-600 text-white px-2.5 py-1 inline-block">
              Staff Researcher & Author
            </span>

            <h1
              itemProp="name"
              className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white"
            >
              {author.name}
            </h1>

            <p
              itemProp="jobTitle"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              {author.role}
            </p>

            <p
              itemProp="description"
              className="text-sm text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed pt-1"
            >
              {author.bio}
            </p>

            {/* Author Expertise Areas */}
            {author.expertise && author.expertise.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mr-1 inline-flex items-center gap-1">
                  <Award className="w-3 h-3 text-blue-500" /> Focus:
                </span>
                {author.expertise.map((exp) => (
                  <span
                    key={exp}
                    className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            )}

            {/* Social and Verified Profiles */}
            <div className="flex items-center gap-3 pt-3">
              {author.twitter && (
                <a
                  href={author.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on Twitter`}
                  className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {author.github && (
                <a
                  href={author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on GitHub`}
                  className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} personal website`}
                  className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Author Articles */}
      <section>
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">
            Published Research & Articles ({authorPosts.length})
          </h2>
        </div>

        {authorPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authorPosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No published articles yet by this author.</p>
          </div>
        )}
      </section>

      <NewsletterCTA />
    </div>
  );
};
