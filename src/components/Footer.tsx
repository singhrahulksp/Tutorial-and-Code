import React from 'react';
import { useRouter } from '../router/RouterContext';
import { useBlog } from '../context/BlogContext';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();
  const { categories, siteSettings } = useBlog();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] transition-colors mt-auto">
      <div className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <span className="text-xl font-black tracking-tighter uppercase text-black dark:text-white">
              Tutorials and Code
            </span>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              {siteSettings.description || 'In-depth programming tutorials, clean code architectures, AI systems, and software engineering analysis for builders.'}
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-1">
                Peer-Reviewed Tutorials & Code
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Publication
            </div>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <li>
                <button onClick={() => navigate('/latest')} className="hover:text-black dark:hover:text-white transition-colors">
                  Latest Feed
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/search')} className="hover:text-black dark:hover:text-white transition-colors">
                  Search Archive
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-black dark:hover:text-white transition-colors">
                  About & Masthead
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-black dark:hover:text-white transition-colors">
                  Contact Newsroom
                </button>
              </li>
            </ul>
          </div>

          {/* Domains */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Domains & Tracks
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/category/${c.slug}`)}
                  className="text-left hover:text-black dark:hover:text-white transition-colors truncate"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar matching Design HTML */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
            &copy; {currentYear} Tutorials and Code Editorial. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
              Twitter
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
              GitHub
            </a>
            <button onClick={() => navigate('/privacy')} className="hover:text-black dark:hover:text-white transition-colors">
              Privacy
            </button>
            <button onClick={() => navigate('/terms')} className="hover:text-black dark:hover:text-white transition-colors">
              Terms
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
