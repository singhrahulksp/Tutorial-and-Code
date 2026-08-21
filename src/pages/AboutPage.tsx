import React from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { SEOHead } from '../components/SEOHead';
import { Shield, Cpu, Terminal, Compass } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { authors } = useBlog();
  const { navigate } = useRouter();

  return (
    <div className="w-full max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 py-8">
      <SEOHead
        pagePath="/about"
        title="About Tutorials and Code — Editorial Standards & Technical Mission"
        description="Tutorials and Code is an independent publication dedicated to software architecture, AI systems, clean coding tutorials, and engineering craft."
        canonicalUrl="https://tutorialsandcode.dev/about"
      />

      {/* Header */}
      <div className="text-center space-y-4 mb-16 max-w-4xl mx-auto">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-blue-600 text-white px-2.5 py-1 inline-block">
          Publication Manifesto
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 dark:text-white leading-[1.05]">
          Rigorous technical journalism for systems builders.
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed">
          We reject superficial listicles, sponsored fluff, and shallow re-posts. Tutorials and Code publishes deep, peer-reviewed engineering analyses, architectural breakdowns, and reproducible guides.
        </p>
      </div>

      {/* Principles Grid */}
      <section className="my-12">
        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-white mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          Core Editorial Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 dark:text-white pt-2">Code & Benchmarks First</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every performance assertion must be backed by reproducible benchmark scripts, memory profiles, and realistic distributed scenarios.
            </p>
          </div>

          <div className="p-6 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 dark:text-white pt-2">AI Systems Depth</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We dissect transformer mechanics, vector indices, quantization kernels, and agentic workflows beyond generic chatbot prompt engineering.
            </p>
          </div>

          <div className="p-6 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 dark:text-white pt-2">Zero-Trust Security</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Cryptographic attestations, post-quantum defenses, and vulnerability analysis written by practitioners defending production systems.
            </p>
          </div>

          <div className="p-6 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-tight text-neutral-900 dark:text-white pt-2">Architectural Pragmatism</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              No dogmatic hype. We analyze when to adopt modern microservices and when to stick with monolithic Postgres databases.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Masthead */}
      <section className="my-16">
        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-white mb-2">
          Editorial Masthead
        </h2>
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-8">
          The engineering researchers and editors behind Tutorials and Code publications
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author) => (
            <div
              key={author.id}
              onClick={() => navigate(`/author/${author.slug}`)}
              className="p-5 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer flex gap-4 items-start transition-all group"
            >
              <img
                src={author.avatar}
                alt={author.name}
                className="w-14 h-14 object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
              />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {author.name}
                </h3>
                <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{author.role}</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                  {author.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
