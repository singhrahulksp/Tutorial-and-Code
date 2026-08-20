import React from 'react';
import { Post } from '../types';
import { useRouter } from '../router/RouterContext';
import { useBlog } from '../context/BlogContext';

interface TrendingSectionProps {
  posts: Post[];
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ posts }) => {
  const { navigate } = useRouter();
  const { categories } = useBlog();

  const trendingList = posts.slice(0, 5);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 sm:p-8 flex flex-col border border-zinc-100 dark:border-zinc-800">
      <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">
        Trending
      </h2>

      <div className="flex flex-col gap-6 flex-grow">
        {trendingList.map((post, idx) => {
          const cat = categories.find((c) => c.slug === post.category);
          const indexNum = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={post.id}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="flex gap-4 items-start group cursor-pointer"
            >
              <span className="text-3xl font-black text-zinc-200 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors leading-none shrink-0 w-8">
                {indexNum}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">
                  {cat?.name || post.category}
                </span>
                <p className="text-[13px] font-bold leading-tight text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
