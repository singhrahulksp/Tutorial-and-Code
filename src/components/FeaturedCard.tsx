import React from 'react';
import { Post } from '../types';
import { useRouter } from '../router/RouterContext';
import { useBlog } from '../context/BlogContext';

interface FeaturedCardProps {
  post: Post;
  secondaryPosts?: Post[];
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({ post, secondaryPosts = [] }) => {
  const { navigate } = useRouter();
  const { getAuthorById, categories } = useBlog();

  const author = getAuthorById(post.authorId);
  const category = categories.find((c) => c.slug === post.category);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] overflow-hidden mb-12">
      
      {/* Col-8: Primary Large Hero Story */}
      <div
        onClick={() => navigate(`/blog/${post.slug}`)}
        className="lg:col-span-8 lg:border-r border-b lg:border-b-0 border-zinc-100 dark:border-zinc-800 p-6 sm:p-10 md:p-12 flex flex-col justify-end min-h-[440px] sm:min-h-[500px] relative overflow-hidden group cursor-pointer"
      >
        {/* Background Image & Gradient Overlays */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${post.featuredImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />

        {/* Content */}
        <div className="relative z-20 text-white max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-blue-600 text-white px-2.5 py-1 mb-4 inline-block">
            Featured | {category?.name || post.category}
          </span>

          <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tighter mb-4 text-white group-hover:text-zinc-200 transition-colors">
            {post.title}
          </h3>

          <p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 line-clamp-2 font-normal">
            {post.description}
          </p>

          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            <span>{author?.name || 'Staff Researcher'}</span>
            <span className="w-1 h-1 bg-zinc-500 rounded-full"></span>
            <span>{post.readingTime} Min Read</span>
            <span className="w-1 h-1 bg-zinc-500 rounded-full"></span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Col-4: Secondary Stories Stack */}
      <div className="lg:col-span-4 flex flex-col bg-white dark:bg-[#0a0a0a]">
        {secondaryPosts.slice(0, 3).map((sPost, index) => {
          const sAuthor = getAuthorById(sPost.authorId);
          const sCat = categories.find((c) => c.slug === sPost.category);
          const isLast = index === Math.min(secondaryPosts.length, 3) - 1;

          return (
            <div
              key={sPost.id}
              onClick={() => navigate(`/blog/${sPost.slug}`)}
              className={`flex-1 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors flex flex-col justify-between group ${
                !isLast ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
              }`}
            >
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 block">
                  {sCat?.name || sPost.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold leading-snug tracking-tight text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {sPost.title}
                </h3>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <span>{sAuthor?.name || 'Staff'}</span>
                <span>•</span>
                <span>{sPost.readingTime} min</span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
