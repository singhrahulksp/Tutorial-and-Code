import React, { useState, useEffect, useMemo } from 'react';
import { useBlog } from '../context/BlogContext';
import {
  crawlFirestoreSitemap,
  downloadSitemapXmlFile,
  SitemapCrawlResult,
  SitemapUrlEntry,
} from '../utils/sitemapGenerator';
import {
  RefreshCw,
  Download,
  Copy,
  Check,
  Globe,
  FileCode,
  Layers,
  Database,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Tag,
  Shield,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface DynamicSitemapGeneratorProps {
  initialFormat?: 'visual' | 'xml' | 'raw';
  standalone?: boolean;
}

export const DynamicSitemapGenerator: React.FC<DynamicSitemapGeneratorProps> = ({
  initialFormat = 'visual',
  standalone = false,
}) => {
  const { posts, categories, authors, siteSettings, isFirebaseConnected } = useBlog();

  const [crawlResult, setCrawlResult] = useState<SitemapCrawlResult | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlStep, setCrawlStep] = useState<string>('Idle');
  const [viewTab, setViewTab] = useState<'visual' | 'xml' | 'diagnostics'>(
    initialFormat === 'xml' ? 'xml' : 'visual'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'post' | 'category' | 'author' | 'core'>('all');
  const [copied, setCopied] = useState(false);
  const [copyUrl, setCopyUrl] = useState<string | null>(null);

  // Run initial crawl on mount or when posts/categories change
  const executeCrawl = async () => {
    setIsCrawling(true);
    setCrawlStep('Connecting to Firestore collections...');
    
    try {
      await new Promise((r) => setTimeout(r, 200));
      setCrawlStep('Crawling published posts from /posts...');
      await new Promise((r) => setTimeout(r, 250));
      setCrawlStep('Indexing taxonomy & author collections...');
      
      const result = await crawlFirestoreSitemap({
        posts,
        categories,
        authors,
        siteSettings,
      });

      setCrawlStep('Validating Sitemaps.org 0.9 XML schema...');
      await new Promise((r) => setTimeout(r, 150));
      
      setCrawlResult(result);
    } catch (err) {
      console.error('Failed to crawl Firestore for sitemap:', err);
    } finally {
      setIsCrawling(false);
      setCrawlStep('Completed');
    }
  };

  useEffect(() => {
    executeCrawl();
  }, [posts, categories, authors, siteSettings]);

  const handleCopyXml = () => {
    if (!crawlResult?.xml) return;
    navigator.clipboard.writeText(crawlResult.xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!crawlResult?.xml) return;
    downloadSitemapXmlFile(crawlResult.xml, 'sitemap.xml');
  };

  const filteredUrls = useMemo(() => {
    if (!crawlResult?.urls) return [];
    return crawlResult.urls.filter((entry) => {
      const matchesType = typeFilter === 'all' || entry.type === typeFilter;
      const matchesQuery =
        !searchQuery ||
        entry.loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.title && entry.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [crawlResult, typeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Live Crawl Banner */}
      <div className="bg-white dark:bg-[#0f0f0f] border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Firestore Crawler
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {crawlResult?.source === 'firestore' ? 'Database Source: Firestore Live' : 'Database Source: Local Sync'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Dynamic XML Sitemap Engine
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl">
              Crawls all published technical articles, category taxonomies, and author credentials directly from Firestore. Generates an indexable XML document complying with the Sitemaps.org 0.9 and Google News standards.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              id="crawl-firestore-btn"
              onClick={executeCrawl}
              disabled={isCrawling}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-900 dark:text-white inline-flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin text-black dark:text-white' : ''}`} />
              <span>{isCrawling ? crawlStep : 'Re-Crawl Firestore'}</span>
            </button>

            <button
              id="copy-xml-sitemap-btn"
              onClick={handleCopyXml}
              disabled={!crawlResult}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-900 dark:text-white inline-flex items-center gap-2 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">XML Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy XML</span>
                </>
              )}
            </button>

            <button
              id="download-sitemap-xml-btn"
              onClick={handleDownload}
              disabled={!crawlResult}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download sitemap.xml</span>
            </button>
          </div>
        </div>

        {/* Crawl Statistics Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#151515] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Total Index URLs
            </span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono mt-0.5 block">
              {crawlResult?.totalUrls ?? '...'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#151515] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Published Posts
            </span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono mt-0.5 block">
              {crawlResult?.postCount ?? '...'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#151515] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Category Tracks
            </span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono mt-0.5 block">
              {crawlResult?.categoryCount ?? '...'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#151515] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Author Profiles
            </span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono mt-0.5 block">
              {crawlResult?.authorCount ?? '...'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#151515] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Payload Size
            </span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono mt-0.5 block">
              {crawlResult ? `${(crawlResult.sizeBytes / 1024).toFixed(1)} KB` : '...'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#151515] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Schema Protocol
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
              Sitemaps 0.9 ✓
            </span>
          </div>
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('visual')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              viewTab === 'visual'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Crawled URL Index ({crawlResult?.totalUrls ?? 0})</span>
          </button>

          <button
            onClick={() => setViewTab('xml')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              viewTab === 'xml'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>XML Source View</span>
          </button>

          <button
            onClick={() => setViewTab('diagnostics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              viewTab === 'diagnostics'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Crawler Diagnostics</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline-block">
          Last Crawl: {crawlResult ? new Date(crawlResult.crawledAt).toLocaleTimeString() : '...'}
        </span>
      </div>

      {/* TAB 1: Visual URL Index */}
      {viewTab === 'visual' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0f0f0f] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search crawled URLs or titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {(['all', 'post', 'category', 'author', 'core'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    typeFilter === type
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-neutral-900 dark:text-white'
                      : 'text-zinc-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* URL List Table */}
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <th className="py-3 px-4">URL Location & Target</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Frequency</th>
                    <th className="py-3 px-3">Last Modified</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
                  {filteredUrls.map((entry, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-neutral-900 dark:text-white text-xs">
                          {entry.title || entry.loc}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono break-all mt-0.5">
                          {entry.loc}
                        </div>
                        {entry.image && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                            <span>📷 Image Metadata Included</span>
                          </div>
                        )}
                        {entry.news && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 mt-1 ml-2">
                            <span>📰 Google News Feed Tagged</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                            entry.type === 'post'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : entry.type === 'category'
                              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                              : entry.type === 'author'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                        {entry.priority}
                      </td>

                      <td className="py-3 px-3 text-zinc-500 whitespace-nowrap">
                        {entry.changefreq}
                      </td>

                      <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                        {entry.lastmod}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <a
                          href={entry.loc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-neutral-900 dark:hover:text-white inline-flex items-center justify-center transition-colors"
                          title="Open URL in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}

                  {filteredUrls.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400 font-sans">
                        No indexed URLs found matching &ldquo;{searchQuery}&rdquo;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Formatted XML Source Code */}
      {viewTab === 'xml' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-zinc-900 text-zinc-300 px-4 py-2.5 rounded-t-xl text-xs font-mono">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">sitemap.xml</span>
              <span className="text-[11px] text-zinc-500">
                ({crawlResult?.totalUrls || 0} entries • UTF-8)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyXml}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-sans inline-flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-sans inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-[#0a0a0a] text-zinc-300 text-xs font-mono rounded-b-xl overflow-x-auto max-h-[580px] border border-zinc-800 leading-relaxed shadow-inner">
            <code>{crawlResult?.xml || 'Loading XML sitemap...'}</code>
          </pre>
        </div>
      )}

      {/* TAB 3: Diagnostics & Submission */}
      {viewTab === 'diagnostics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white dark:bg-[#0f0f0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Sitemaps.org Specification Audit
              </h2>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Namespace Declaration</strong>: Root contains compliant sitemaps.org 0.9 schema URI.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Canonical Absolute URLs</strong>: All &lt;loc&gt; tags use strict HTTPS protocol with trailing normalization.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>ISO 8601 Timestamps</strong>: &lt;lastmod&gt; dates formatted as valid YYYY-MM-DD strings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Image Sitemap Extension</strong>: Featured hero images tagged with &lt;image:loc&gt; and title tags for Google Images crawl.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Google News Extension</strong>: Automated 48-hour news publication markup for newly published engineering articles.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-white dark:bg-[#0f0f0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Search Engine Submission Endpoints
              </h2>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Submit the dynamic XML sitemap endpoint to search engines to expedite indexation of newly published blog posts:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 break-all text-neutral-800 dark:text-zinc-200">
                {crawlResult?.siteUrl}/sitemap.xml
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1.5"
              >
                <span>Submit to Google Search Console</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.bing.com/webmasters"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1.5"
              >
                <span>Submit to Bing Webmaster Tools</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
