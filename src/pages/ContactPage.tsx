import React, { useState } from 'react';
import { SEOHead } from '../components/SEOHead';
import { Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Editorial Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEOHead
        title="Contact Editorial Staff & Newsroom — Tutorials and Code"
        description="Submit code tutorials, report technical corrections, pitch guest articles, or contact the Tutorials and Code staff."
        canonicalUrl="https://tutorialsandcode.dev/contact"
      />

      <div className="text-center space-y-3 mb-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-blue-600 text-white px-2.5 py-1 inline-block">
          Newsroom Dispatch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
          Get in Touch
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
          Have research to share, a technical correction, or interested in contributing an architectural deep-dive?
        </p>
      </div>

      <div className="p-8 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
        {submitted ? (
          <div className="text-center py-12 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto" />
            <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">Message Dispatched</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Thank you for reaching out. Our editorial engineering team reviews all incoming inquiries within 24 hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', subject: 'Editorial Inquiry', message: '' });
              }}
              className="mt-4 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Linus Torvalds"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="linus@kernel.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Topic / Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
              >
                <option value="Editorial Inquiry">Editorial Research Inquiry</option>
                <option value="Guest Deep-Dive">Guest Deep-Dive Submission</option>
                <option value="Technical Correction">Technical Correction / Errata</option>
                <option value="Security Tip">Confidential Security Research Tip</option>
                <option value="General">General Question</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Message & Technical Details
              </label>
              <textarea
                rows={5}
                placeholder="Include relevant code repositories, benchmark setups, or context..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 text-xs font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Dispatch</span>
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-zinc-400 font-mono flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        <span>PGP Key fingerprint: 4A8F 9C21 881E B340 5D12 C9A0</span>
      </div>
    </div>
  );
};
