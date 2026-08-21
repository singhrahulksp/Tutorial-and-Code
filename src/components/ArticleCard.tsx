import React from 'react';
import { Post } from '../types';
import { useRouter } from '../router/RouterContext';
import { useBlog } from '../context/BlogContext';

interface ArticleCardProps {
  post: Post;
  variant?: 'grid' | 'horizontal' | 'compact';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ post, variant = 'grid' }) => {
  const { navigate } = useRouter();
  const { getAuthorById, categories } = useBlog();

  const author = getAuthorById(post.authorId);
  const category = categories.find((c) => c.slug === post.category);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (variant === 'compact') {
    return (
      <article
        onClick={() => navigate(`/blog/${post.slug}`)}
        className="group cursor-pointer flex gap-4 items-start py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
      >
        <div className="w-16 h-16 rounded-none bg-zinc-100 dark:bg-zinc-850 overflow-hidden shrink-0">
          <img
            src={post.featuredImage}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-0.5">
            {category?.name || post.category}
          </h4>
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>
          <h5 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
            {post.readingTime} min • {formattedDate}
          </h5>
        </div>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article
        onClick={() => navigate(`/blog/${post.slug}`)}
        className="group cursor-pointer p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center"
      >
        <div className="w-full md:w-56 h-40 bg-zinc-100 dark:bg-zinc-900 overflow-hidden shrink-0 relative">
          <img
            src={post.featuredImage}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <h4 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
            {category?.name || post.category}
          </h4>
          <h3 className="text-lg sm:text-xl font-bold leading-snug tracking-tight text-neutral-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {post.description}
          </p>

          <h5 className="pt-2 flex items-center gap-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            <span>{author?.name || 'Staff'}</span>
            <span>•</span>
            <span>{post.readingTime} min read</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </h5>
        </div>
      </article>
    );
  }

  // Default Grid Card
  return (
    <article
      onClick={() => navigate(`/blog/${post.slug}`)}
      className="flex flex-col gap-3 group cursor-pointer"
    >
      <div className="h-44 sm:h-48 bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
        <img
          src={post.featuredImage}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="space-y-1.5 flex-1 flex flex-col">
        <h4 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
          {category?.name || post.category}
        </h4>

        <h3 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-neutral-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {post.description}
        </p>

        <h5 className="mt-auto pt-2 flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          <span>{author?.name || 'Staff'}</span>
          <span>•</span>
          <span>{post.readingTime} min</span>
        </h5>
      </div>
    </article>
  );
};
