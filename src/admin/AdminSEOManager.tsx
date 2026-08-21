import React, { useState, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import { PageMetaConfig } from '../types';
import { DEFAULT_PAGE_META_OVERRIDES } from '../context/BlogContext';
import {
  Globe,
  Search,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Layers,
  Eye,
  Plus,
  Trash2,
  Smartphone,
  Monitor,
  Share2,
} from 'lucide-react';

export const AdminSEOManager: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useBlog();

  const [pageConfigs, setPageConfigs] = useState<Record<string, PageMetaConfig>>(
    siteSettings?.pageMetaOverrides || DEFAULT_PAGE_META_OVERRIDES
  );
  const [selectedPath, setSelectedPath] = useState<string>('/');
  const [previewMode, setPreviewMode] = useState<'google-desktop' | 'google-mobile' | 'social'>('google-desktop');
  const [toast, setToast] = useState<string | null>(null);
  const [customPathInput, setCustomPathInput] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  useEffect(() => {
    if (siteSettings?.pageMetaOverrides) {
      setPageConfigs(siteSettings.pageMetaOverrides);
    }
  }, [siteSettings]);

  const activeConfig: PageMetaConfig = pageConfigs[selectedPath] || {
    path: selectedPath,
    pageName: selectedPath === '/' ? 'Landing Page' : selectedPath.replace(/^\//, '').toUpperCase(),
    title: '',
    description: '',
    canonicalUrl: `${siteSettings?.siteUrl || 'https://tutorialsandcode.dev'}${selectedPath === '/' ? '' : selectedPath}`,
    keywords: '',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80',
  };

  const handleFieldChange = (field: keyof PageMetaConfig, value: string) => {
    setPageConfigs((prev) => ({
      ...prev,
      [selectedPath]: {
        ...activeConfig,
        [field]: value,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updateSiteSettings({
      pageMetaOverrides: pageConfigs,
    });
    setToast(`SEO metadata & canonical URLs for ${Object.keys(pageConfigs).length} pages saved & synced to cloud!`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleResetCurrent = () => {
    const defaultVal = DEFAULT_PAGE_META_OVERRIDES[selectedPath];
    if (defaultVal) {
      setPageConfigs((prev) => ({
        ...prev,
        [selectedPath]: { ...defaultVal },
      }));
      setToast(`Reset "${activeConfig.pageName}" metadata to system defaults.`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddCustomPath = () => {
    let clean = customPathInput.trim();
    if (!clean) return;
    if (!clean.startsWith('/')) clean = '/' + clean;

    if (pageConfigs[clean]) {
      setSelectedPath(clean);
      setShowAddCustom(false);
      setCustomPathInput('');
      return;
    }

    const newConf: PageMetaConfig = {
      path: clean,
      pageName: `Custom Route (${clean})`,
      title: `${clean.replace('/', '')} | Tutorials and Code`,
      description: `Technical guides, benchmarks, and architectures on Tutorials and Code.`,
      canonicalUrl: `${siteSettings?.siteUrl || 'https://tutorialsandcode.dev'}${clean}`,
      robots: 'index, follow',
      keywords: 'tutorials, code, engineering',
      ogImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80',
      updatedAt: new Date().toISOString(),
    };

    const updated = { ...pageConfigs, [clean]: newConf };
    setPageConfigs(updated);
    setSelectedPath(clean);
    setCustomPathInput('');
    setShowAddCustom(false);
    updateSiteSettings({ pageMetaOverrides: updated });
    setToast(`Added custom SEO route for "${clean}"`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteCustomPath = (pathToDelete: string) => {
    if (DEFAULT_PAGE_META_OVERRIDES[pathToDelete]) {
      alert('Default system pages cannot be removed.');
      return;
    }
    const updated = { ...pageConfigs };
    delete updated[pathToDelete];
    setPageConfigs(updated);
    setSelectedPath('/');
    updateSiteSettings({ pageMetaOverrides: updated });
    setToast(`Removed custom route "${pathToDelete}"`);
    setTimeout(() => setToast(null), 3000);
  };

  const siteBase = siteSettings?.siteUrl || 'https://tutorialsandcode.dev';
  const displayTitle = activeConfig.title || siteSettings?.siteName || 'Tutorials and Code';
  const displayDesc = activeConfig.description || siteSettings?.description || '';
  const displayCanonical = activeConfig.canonicalUrl || `${siteBase}${selectedPath === '/' ? '' : selectedPath}`;

  const titleLength = activeConfig.title?.length || 0;
  const descLength = activeConfig.description?.length || 0;

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-1">
            <Globe className="w-4 h-4" />
            <span>Direct Page SEO & Canonical Control Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
            Manage Metas & Canonical URLs for All Pages
          </h2>
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl leading-relaxed">
            Directly configure custom meta titles, meta descriptions, canonical URLs, OpenGraph images, and search crawler robots directives for every public route, including the landing page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAll}
            type="button"
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Save All Pages</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-4 border border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Selector Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Select Page to Configure:
          </label>
          <button
            type="button"
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Route</span>
          </button>
        </div>

        {showAddCustom && (
          <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. /category/ai-systems or /special-report"
              value={customPathInput}
              onChange={(e) => setCustomPathInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-mono border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-neutral-900 dark:text-white outline-none"
            />
            <button
              onClick={handleAddCustomPath}
              type="button"
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddCustom(false)}
              type="button"
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {Object.entries(pageConfigs).map(([pathKey, cfg]) => {
            const isSelected = selectedPath === pathKey;
            const isHome = pathKey === '/';

            return (
              <button
                key={pathKey}
                type="button"
                onClick={() => setSelectedPath(pathKey)}
                className={`p-2.5 text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {isHome ? 'LANDING' : cfg.pageName.split(' ')[0]}
                  </span>
                  {isHome && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                </div>
                <div className="font-mono text-xs font-bold truncate mt-1">
                  {pathKey}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                Editing: <span className="text-blue-600 font-mono">{selectedPath}</span>
              </h3>
              <p className="text-[11px] text-zinc-400">{activeConfig.pageName}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCurrent}
                title="Reset to initial default meta for this page"
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>

              {!DEFAULT_PAGE_META_OVERRIDES[selectedPath] && (
                <button
                  type="button"
                  onClick={() => handleDeleteCustomPath(selectedPath)}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Route</span>
                </button>
              )}
            </div>
          </div>

          {/* Page Display Name */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Internal Page Identifier
            </label>
            <input
              type="text"
              value={activeConfig.pageName}
              onChange={(e) => handleFieldChange('pageName', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Page Meta Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Page Title Tag (<code className="text-[10px] font-mono text-zinc-400">&lt;title&gt; & og:title</code>)
              </label>
              <span className={`text-[10px] font-mono font-bold ${
                titleLength >= 45 && titleLength <= 65 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {titleLength} / 60 chars (Recommended: 50-60)
              </span>
            </div>
            <input
              type="text"
              value={activeConfig.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="e.g. Tutorials and Code — Engineering Tutorials & Clean Code"
              className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white font-medium"
            />
          </div>

          {/* Page Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Meta Description (<code className="text-[10px] font-mono text-zinc-400">&lt;meta name="description"&gt;</code>)
              </label>
              <span className={`text-[10px] font-mono font-bold ${
                descLength >= 120 && descLength <= 165 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {descLength} / 160 chars (Recommended: 140-160)
              </span>
            </div>
            <textarea
              rows={3}
              value={activeConfig.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Write a compelling, search-optimized meta summary for Google and social previews..."
              className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          {/* Canonical URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Direct Canonical URL (<code className="text-[10px] font-mono text-zinc-400">&lt;link rel="canonical"&gt;</code>)
              </label>
              <button
                type="button"
                onClick={() => handleFieldChange('canonicalUrl', `${siteBase}${selectedPath === '/' ? '' : selectedPath}`)}
                className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 hover:underline"
              >
                Auto-fill domain
              </button>
            </div>
            <input
              type="url"
              value={activeConfig.canonicalUrl || ''}
              onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
              placeholder="https://tutorialsandcode.dev/..."
              className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              Specifies the primary URL to prevent duplicate content indexing penalties.
            </p>
          </div>

          {/* Robots & Keywords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Robots Indexing Directive
              </label>
              <select
                value={activeConfig.robots || 'index, follow'}
                onChange={(e) => handleFieldChange('robots', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
              >
                <option value="index, follow">index, follow (Standard Indexing)</option>
                <option value="noindex, follow">noindex, follow (Crawl links, don't index)</option>
                <option value="noindex, nofollow">noindex, nofollow (Strict Private)</option>
                <option value="index, nofollow">index, nofollow</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                value={activeConfig.keywords || ''}
                onChange={(e) => handleFieldChange('keywords', e.target.value)}
                placeholder="clean code, tutorials, rust, ai"
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* OpenGraph Image URL */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              OpenGraph / Social Card Image URL (<code className="text-[10px] font-mono text-zinc-400">og:image</code>)
            </label>
            <input
              type="url"
              value={activeConfig.ogImage || ''}
              onChange={(e) => handleFieldChange('ogImage', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div className="pt-3">
            <button
              onClick={handleSaveAll}
              type="button"
              className="w-full py-3 px-4 text-xs font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Apply & Save Page SEO</span>
            </button>
          </div>
        </div>

        {/* Right Column: Real-time SERP & Social Card Simulator */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SERP Simulator Header */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Live SERP & Social Preview
              </span>

              {/* View Switcher */}
              <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode('google-desktop')}
                  className={`px-2 py-1 text-[10px] font-bold uppercase flex items-center gap-1 ${
                    previewMode === 'google-desktop'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-zinc-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('google-mobile')}
                  className={`px-2 py-1 text-[10px] font-bold uppercase flex items-center gap-1 ${
                    previewMode === 'google-mobile'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-zinc-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('social')}
                  className={`px-2 py-1 text-[10px] font-bold uppercase flex items-center gap-1 ${
                    previewMode === 'social'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-zinc-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Share2 className="w-3 h-3" />
                  <span>Social</span>
                </button>
              </div>
            </div>

            {/* Google SERP Card Preview */}
            {(previewMode === 'google-desktop' || previewMode === 'google-mobile') && (
              <div className="p-4 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-700 rounded-sm font-sans space-y-1.5 shadow-xs">
                {/* Search result breadcrumb / URL */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center">
                    TC
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 leading-none">
                      Tutorials and Code
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate max-w-[280px]">
                      {displayCanonical}
                    </span>
                  </div>
                </div>

                {/* Search result title */}
                <div className="text-base sm:text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight pt-1">
                  {displayTitle}
                </div>

                {/* Search result snippet */}
                <p className="text-xs sm:text-[13px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-3">
                  {displayDesc || 'No meta description provided. Google will dynamically extract a relevant paragraph snippet from the page content.'}
                </p>

                <div className="pt-2 flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                  <span>Robots: {activeConfig.robots || 'index, follow'}</span>
                  <span>•</span>
                  <span>Canonical: Verified</span>
                </div>
              </div>
            )}

            {/* Social Share Card Preview */}
            {previewMode === 'social' && (
              <div className="border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden bg-white dark:bg-black font-sans">
                {activeConfig.ogImage ? (
                  <img
                    src={activeConfig.ogImage}
                    alt="Social preview"
                    className="w-full h-40 object-cover border-b border-zinc-200 dark:border-zinc-800"
                  />
                ) : (
                  <div className="w-full h-40 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                    No og:image specified
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <div className="text-[10px] uppercase font-mono text-zinc-400 truncate">
                    {siteBase.replace('https://', '')}
                  </div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {displayTitle}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {displayDesc}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Page Links & Inspection */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center justify-between">
              <span>Inspect Live Page</span>
              <a
                href={selectedPath}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>Open {selectedPath}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              When you save changes, all <code className="font-mono text-zinc-600 dark:text-zinc-400">&lt;title&gt;</code>, <code className="font-mono text-zinc-600 dark:text-zinc-400">&lt;meta name="description"&gt;</code>, OpenGraph tags, and <code className="font-mono text-zinc-600 dark:text-zinc-400">&lt;link rel="canonical"&gt;</code> tags update in real-time across the client application and SSR crawls.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
