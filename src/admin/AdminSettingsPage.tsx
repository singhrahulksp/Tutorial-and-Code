import React, { useState, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { AdminLayout } from './AdminLayout';
import { AdminSEOManager } from './AdminSEOManager';
import { computeHash, resetFailedLoginAttempts } from '../utils/security';
import {
  Download,
  RefreshCw,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Database,
  Globe,
  Cloud,
  Shield,
  KeyRound,
  Lock,
  ExternalLink,
  Search,
  Settings,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const {
    siteSettings,
    updateSiteSettings,
    subscribers,
    posts,
    categories,
    authors,
    resetToDefaults,
    isFirebaseConnected,
    lastCloudSync,
  } = useBlog();

  const isSeoRoute = currentPath === '/admin/seo';
  const [activeTab, setActiveTab] = useState<'seo' | 'general' | 'database'>(isSeoRoute ? 'seo' : 'seo');

  useEffect(() => {
    if (currentPath === '/admin/seo') {
      setActiveTab('seo');
    }
  }, [currentPath]);

  const [siteName, setSiteName] = useState(siteSettings?.siteName || '');
  const [tagline, setTagline] = useState(siteSettings?.tagline || '');
  const [description, setDescription] = useState(siteSettings?.description || '');
  const [siteUrl, setSiteUrl] = useState(siteSettings?.siteUrl || '');
  const [toast, setToast] = useState<string | null>(null);

  // Security passkey state
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [passkeySuccess, setPasskeySuccess] = useState(false);

  // Synchronize inputs when siteSettings are loaded or updated from Firestore
  useEffect(() => {
    if (siteSettings) {
      setSiteName(siteSettings.siteName || '');
      setTagline(siteSettings.tagline || '');
      setDescription(siteSettings.description || '');
      setSiteUrl(siteSettings.siteUrl || '');
    }
  }, [siteSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteSettings({
      siteName,
      tagline,
      description,
      siteUrl,
    });
    setToast('Site settings updated and synced to Firestore successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdatePasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError('');
    setPasskeySuccess(false);

    if (!newPasskey || newPasskey.length < 8) {
      setPasskeyError('Password must be at least 8 characters long.');
      return;
    }

    if (newPasskey !== confirmPasskey) {
      setPasskeyError('New passkey and confirmation do not match.');
      return;
    }

    const hashed = await computeHash(newPasskey);
    await updateSiteSettings({
      customAdminPasswordHash: hashed,
    });
    resetFailedLoginAttempts();
    setPasskeySuccess(true);
    setNewPasskey('');
    setConfirmPasskey('');
    setToast('Master passkey updated with SHA-256 cryptographic salt.');
    setTimeout(() => {
      setToast(null);
      setPasskeySuccess(false);
    }, 4000);
  };

  // Export full JSON database backup
  const handleExportBackup = () => {
    const backupData = {
      siteSettings,
      posts,
      categories,
      authors,
      subscribers,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techpulse-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Subscribers as CSV
  const handleExportSubscribersCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Email,SubscribedAt\n' +
      subscribers.map((s) => `"${s.email}","${s.subscribedAt}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `techpulse-newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Reset to seed dataset
  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all posts and categories back to the original benchmark publications in Firestore and local storage?')) {
      await resetToDefaults();
      setToast('Database and Firestore reset to original 12+ peer-reviewed publications seed.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <AdminLayout
      title="Platform Settings & Cloud Database"
      subtitle="Configure page-specific SEO metas, canonical URLs, monitor live Firestore cloud synchronization, and manage persistent storage."
    >
      {toast && (
        <div className="mb-6 p-4 border border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Level Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'seo'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <span>Page Metas & Canonicals (All Pages)</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>General Editorial & Audience</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'database'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloud Firestore & Backups</span>
        </button>
      </div>

      {/* TAB 1: Direct Page Metas & Canonicals (Requested feature) */}
      {activeTab === 'seo' && (
        <div className="space-y-8">
          <AdminSEOManager />
        </div>
      )}

      {/* TAB 2: General Settings & Audience */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: General Settings */}
          <div className="lg:col-span-7 space-y-8">
            <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Global Publication Configuration
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Publication Name
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Editorial Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Global Fallback Meta Description (SEO)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Base Production Canonical Domain
                  </label>
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                >
                  Save & Sync Settings
                </button>
              </form>
            </div>
          </div>

          {/* Right: Newsletter Subscribers */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Newsletter Subscribers ({subscribers.length})
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Opt-in readership synced with cloud storage</p>
                </div>

                <button
                  onClick={handleExportSubscribersCSV}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-mono">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="py-2 flex items-center justify-between">
                    <span className="text-neutral-800 dark:text-neutral-200">{sub.email}</span>
                    <span className="text-zinc-400 text-[10px]">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Database, Security & Firestore */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-6 space-y-8">
            {/* Cloud Firestore Status */}
            <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  Firebase Firestore Cloud
                </h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${
                  isFirebaseConnected
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}>
                  {isFirebaseConnected ? 'LIVE & PERSISTED' : 'CONNECTING'}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Project:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">gen-lang-client-0681052450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Database:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-[180px]">ai-studio-techpulse</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Sync Status:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Bidirectional Snapshot</span>
                </div>
                {lastCloudSync && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Last Synced:</span>
                    <span className="text-zinc-500">{lastCloudSync.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                All published articles, drafts, categories, and authors are automatically synchronized and backed up across devices in real time.
              </p>
            </div>

            {/* Database Backups & Export */}
            <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database Backups & Export
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Export full publication database containing {posts.length} articles, {categories.length} categories, and {authors.length} authors into an open JSON schema.
              </p>

              <button
                onClick={handleExportBackup}
                className="w-full py-3 px-4 text-xs font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup (.JSON)</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-8">
            {/* Master Passkey & Security Hardening */}
            <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  CMS Security & Master Passkey
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  HARDENED
                </span>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                Admin sessions are protected with SHA-256 salted digests, brute-force rate-limiting, and 12-hour session tokens.
              </p>

              <form onSubmit={handleUpdatePasskey} className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    New Admin Passkey
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new passkey (min 8 chars)..."
                    value={newPasskey}
                    onChange={(e) => setNewPasskey(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Confirm New Passkey
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new passkey..."
                    value={confirmPasskey}
                    onChange={(e) => setConfirmPasskey(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                {passkeyError && (
                  <div className="text-rose-600 text-xs font-semibold">
                    {passkeyError}
                  </div>
                )}

                {passkeySuccess && (
                  <div className="text-emerald-600 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Passkey updated and synced to Firestore!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!newPasskey}
                  className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-widest bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Update Admin Passkey
                </button>
              </form>
            </div>

            {/* Reset / Factory Maintenance */}
            <div className="p-6 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Factory Reset Seed Data</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Restore the original 12+ comprehensive benchmark technical articles across AI, Rust, Web Performance, Security, and Cloud Architecture in Firestore.
              </p>

              <button
                onClick={handleResetData}
                className="w-full py-3 px-4 text-xs font-bold uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Standard 12+ Seed</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </AdminLayout>
  );
};

