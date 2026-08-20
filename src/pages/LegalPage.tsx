import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { Shield, FileText } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEOHead
        title={isPrivacy ? 'Privacy Policy — Tutorials and Code' : 'Terms of Service — Tutorials and Code'}
        description={
          isPrivacy
            ? 'Our zero-tracking and privacy commitment to technical readers.'
            : 'Terms of service, code licensing, and publication rights.'
        }
        canonicalUrl={`https://tutorialsandcode.dev/${type}`}
      />

      <div className="mb-10 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">
          {isPrivacy ? <Shield className="w-4 h-4 text-emerald-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
          <span>Legal & Compliance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {isPrivacy ? 'Privacy Policy & Zero-Tracking Manifesto' : 'Terms of Service & Code Licensing'}
        </h1>
        <p className="text-xs text-neutral-500 font-mono mt-2">
          Last revised: August 19, 2026
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-neutral-700 dark:text-neutral-300 space-y-6 leading-relaxed">
        {isPrivacy ? (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">1. Zero Ad-Tracking Commitment</h2>
              <p>
                Tutorials and Code does not utilize invasive third-party ad retargeting pixels, fingerprinting scripts, or cross-site data brokers. We respect your reading privacy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">2. Data We Collect</h2>
              <p>
                When you subscribe to the Tutorials and Code weekly newsletter, we securely store your email address solely for dispatching editorial newsletters. We never sell, rent, or monetize subscriber lists.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">3. Local Storage</h2>
              <p>
                We use browser <code className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">localStorage</code> strictly to remember your preferred UI theme (Light/Dark mode) and client-side reading preferences.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">1. Open Source Code Snippets</h2>
              <p>
                All sample code snippets, architectural benchmarks, and utility functions published within Tutorials and Code editorial articles are licensed under the permissive <strong>MIT License</strong> or <strong>Apache 2.0 License</strong>. You are free to adapt them into your commercial and open-source applications.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">2. Editorial Copyright</h2>
              <p>
                The written long-form editorial essays, tutorials, proprietary graphics, diagrams, and code implementations are copyrighted by Tutorials and Code Media LLC. Citation with attribution and direct linking is welcomed.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">3. Disclaimer of Warranty</h2>
              <p>
                Technical architectures, security advisories, and benchmarking scripts are provided "as is". Always validate infrastructure changes inside staging environments before deploying to critical production clusters.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
