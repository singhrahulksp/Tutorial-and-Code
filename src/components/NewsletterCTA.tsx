import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { Check, Mail } from 'lucide-react';

interface NewsletterCTAProps {
  variant?: 'inline' | 'card' | 'compact';
}

export const NewsletterCTA: React.FC<NewsletterCTAProps> = ({ variant = 'card' }) => {
  const { subscribeNewsletter } = useBlog();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const result = await subscribeNewsletter(email);
    if (result.success) {
      setStatus('success');
      setFeedback(result.message);
      setEmail('');
    } else {
      setStatus('error');
      setFeedback(result.message);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h4 className="text-[11px] font-bold uppercase tracking-tight mb-3 text-neutral-900 dark:text-white">
          Get the Weekly Pulse
        </h4>
        {status === 'success' ? (
          <div className="p-3 bg-zinc-100 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>Subscribed successfully.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex border border-black dark:border-white">
              <input
                type="email"
                placeholder="email@tech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-[12px] px-3 py-2 flex-grow outline-none text-neutral-900 dark:text-white placeholder:text-zinc-400"
                required
              />
              <button
                type="submit"
                className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold px-4 uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
              >
                Join
              </button>
            </div>
            {status === 'error' && (
              <p className="text-[10px] text-red-500 font-bold">{feedback}</p>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <section className="my-16 p-8 sm:p-12 border border-black dark:border-white bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-blue-600 text-white px-2.5 py-1 inline-block">
          Newsletter
        </span>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-neutral-900 dark:text-white">
          Architectural Briefings, Every Thursday
        </h2>

        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Join 28,000+ lead software engineers and researchers receiving distilled breakdowns of AI infrastructure, systems design, and cybersecurity.
        </p>

        {status === 'success' ? (
          <div className="p-4 bg-zinc-100 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 text-sm font-bold text-neutral-900 dark:text-white max-w-md mx-auto flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            <span>{feedback}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-2 pt-2">
            <div className="flex border border-black dark:border-white">
              <input
                type="email"
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-sm px-4 py-3 flex-grow outline-none text-neutral-900 dark:text-white placeholder:text-zinc-400"
                required
              />
              <button
                type="submit"
                className="bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-6 uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
              >
                Subscribe
              </button>
            </div>
            {status === 'error' && (
              <p className="text-xs text-red-500 font-bold text-left">{feedback}</p>
            )}
            <p className="text-[11px] text-zinc-400 font-medium tracking-wide">
              Zero marketing fluff. Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
