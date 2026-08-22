import React, { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Globe,
  Trash2,
  Layers,
  Eye,
  Sliders,
  Terminal,
  Code2,
  Cpu,
  Zap,
} from 'lucide-react';
import { processLocalImageFile } from '../utils/imageUtils';

interface FaviconManagerProps {
  currentFaviconUrl: string;
  siteName: string;
  onFaviconChange: (faviconUrl: string) => void;
  onSave?: () => void;
}

// Built-in high quality SVG developer icon presets
const PRESET_FAVICONS = [
  {
    id: 'default-terminal',
    name: 'Terminal < / >',
    description: 'Crisp code brackets with gradient pulse and status dot',
    url: '/favicon.svg',
    svgDataUrl: '/favicon.svg',
    icon: Code2,
  },
  {
    id: 'monogram-tc',
    name: 'Monogram [T&C]',
    description: 'High-contrast typography brand monogram',
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
        <rect width="64" height="64" rx="14" fill="#09090b"/>
        <rect x="1" y="1" width="62" height="62" rx="13" stroke="#3b82f6" stroke-width="2"/>
        <text x="32" y="40" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="-1">T&amp;C</text>
        <circle cx="52" cy="14" r="4" fill="#3b82f6"/>
      </svg>
    `.trim())}`,
    icon: Layers,
  },
  {
    id: 'hex-arch',
    name: 'Hex Architecture',
    description: 'Geometric hexagon representing microservices and clean systems',
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
        <rect width="64" height="64" rx="14" fill="#030712"/>
        <path d="M32 14L48 23V41L32 50L16 41V23L32 14Z" stroke="#38bdf8" stroke-width="3.5" fill="#0f172a"/>
        <circle cx="32" cy="32" r="5" fill="#60a5fa"/>
        <path d="M32 14V32M48 41L32 32M16 41L32 32" stroke="#38bdf8" stroke-width="2"/>
      </svg>
    `.trim())}`,
    icon: Cpu,
  },
  {
    id: 'cyber-pulse',
    name: 'Electric Pulse',
    description: 'Dynamic tech bolt with neon emerald energy',
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
        <rect width="64" height="64" rx="14" fill="#052e16"/>
        <rect x="1" y="1" width="62" height="62" rx="13" stroke="#10b981" stroke-width="2"/>
        <path d="M36 12L18 34H32L28 52L46 30H32L36 12Z" fill="#10b981" stroke="#34d399" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    `.trim())}`,
    icon: Zap,
  },
  {
    id: 'shell-prompt',
    name: 'Shell Prompt ❯_',
    description: 'Minimalist CLI terminal prompt cursor',
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
        <rect width="64" height="64" rx="14" fill="#18181b"/>
        <rect x="1" y="1" width="62" height="62" rx="13" stroke="#3f3f46" stroke-width="2"/>
        <path d="M18 20L30 32L18 44" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M36 44H46" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `.trim())}`,
    icon: Terminal,
  },
];

export const FaviconManager: React.FC<FaviconManagerProps> = ({
  currentFaviconUrl,
  siteName,
  onFaviconChange,
  onSave,
}) => {
  const [sourceMode, setSourceMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState(currentFaviconUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeFavicon = currentFaviconUrl || '/favicon.svg';

  const handleFileUpload = async (file: File) => {
    if (!file || (!file.type.startsWith('image/') && !file.name.endsWith('.ico') && !file.name.endsWith('.svg'))) {
      alert('Please upload a valid image file (.ico, .svg, .png, .webp, .jpg).');
      return;
    }

    setIsProcessing(true);
    setUploadSuccess(false);

    try {
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onFaviconChange(result);
            setCustomUrlInput(result);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Process icon bitmap image with high quality scaling
        const processed = await processLocalImageFile(file, 256, 256, 0.95);
        onFaviconChange(processed);
        setCustomUrlInput(processed);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Favicon processing failed:', err);
      alert('Failed to process uploaded icon file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      onFaviconChange(customUrlInput.trim());
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const handleSelectPreset = (svgDataUrl: string) => {
    onFaviconChange(svgDataUrl);
    setCustomUrlInput(svgDataUrl);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    onFaviconChange('/favicon.svg');
    setCustomUrlInput('/favicon.svg');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Publication Favicon & Browser Tab Icon
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1">
            Customize the browser tab icon, bookmark icon, and mobile touch icon for <span className="font-semibold text-neutral-800 dark:text-zinc-200">{siteName || 'Tutorials and Code'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeFavicon !== '/favicon.svg' && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Default
            </button>
          )}

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Save to Firestore
            </button>
          )}
        </div>
      </div>

      {/* Live Previews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Realistic Browser Mockup & Scales (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="text-[11px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            Live Browser Tab Simulation
          </div>

          {/* Browser Window / Tab Bar Mockup */}
          <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-xs">
            {/* Top Browser Bar */}
            <div className="bg-zinc-200 dark:bg-zinc-850 px-3 py-2 flex items-center gap-2 border-b border-zinc-300 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              
              {/* Active Tab */}
              <div className="ml-2 flex items-center gap-2 bg-white dark:bg-[#0a0a0a] px-3 py-1.5 rounded-t-md border-t border-x border-zinc-300 dark:border-zinc-700 text-xs max-w-[200px] shadow-xs">
                <img
                  src={activeFavicon}
                  alt="Favicon preview"
                  className="w-4 h-4 object-contain rounded-xs shrink-0"
                />
                <span className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate">
                  {siteName || 'Tutorials and Code'}
                </span>
                <span className="text-zinc-400 text-[10px] ml-auto hover:text-black dark:hover:text-white">×</span>
              </div>
            </div>

            {/* Address Bar Simulation */}
            <div className="p-2.5 bg-white dark:bg-[#0a0a0a] flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-md px-3 py-1 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">🔒</span>
                <span className="text-neutral-800 dark:text-neutral-200">https://www.tutorialsandcode.in</span>
              </div>
            </div>

            {/* Simulated Content Frame */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 mb-2 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs flex items-center justify-center">
                <img src={activeFavicon} alt="Selected icon" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {siteName || 'Tutorials and Code'}
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">Active Favicon Asset</span>
            </div>
          </div>

          {/* Scale Resolution Matrix */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-md">
            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2.5">
              Render Resolutions Preview
            </div>
            <div className="flex items-end justify-around gap-2 pt-1 pb-2">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-4 h-4 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 flex items-center justify-center p-0.5">
                  <img src={activeFavicon} alt="16x16" className="w-full h-full object-contain" />
                </div>
                <span className="text-[9px] font-mono text-zinc-400">16×16 (Tab)</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 flex items-center justify-center p-1">
                  <img src={activeFavicon} alt="32x32" className="w-full h-full object-contain" />
                </div>
                <span className="text-[9px] font-mono text-zinc-400">32×32 (HD)</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 flex items-center justify-center p-1.5">
                  <img src={activeFavicon} alt="48x48" className="w-full h-full object-contain" />
                </div>
                <span className="text-[9px] font-mono text-zinc-400">48×48 (Desktop)</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-16 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-md flex items-center justify-center p-2">
                  <img src={activeFavicon} alt="64x64" className="w-full h-full object-contain" />
                </div>
                <span className="text-[9px] font-mono text-zinc-400">64×64 (Touch)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Source Modes (Upload / Presets / URL) (7 Cols) */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-850 p-1 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setSourceMode('upload')}
              className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                sourceMode === 'upload'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceMode('preset')}
              className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                sourceMode === 'preset'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Developer Presets</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceMode('url')}
              className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                sourceMode === 'url'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Icon URL</span>
            </button>
          </div>

          {/* Success Banner */}
          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Favicon updated! Browser header tags synchronized.</span>
            </div>
          )}

          {/* MODE 1: Upload from local device */}
          {sourceMode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".ico,.svg,.png,.webp,.jpg,.jpeg,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                  isDragging
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white bg-zinc-50/50 dark:bg-zinc-900/40'
                }`}
              >
                {isProcessing ? (
                  <div className="py-4 space-y-2 flex flex-col items-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Processing & Optimizing Icon...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 mb-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      Drop your favicon image here or browse
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1">
                      Supports <span className="font-mono text-neutral-700 dark:text-zinc-300">.ico, .svg, .png, .webp, .jpg</span> (1:1 aspect recommended)
                    </div>
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity shadow-xs"
                    >
                      Select Icon from Computer
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* MODE 2: Curated Developer Presets */}
          {sourceMode === 'preset' && (
            <div className="space-y-2.5">
              <div className="text-[11px] text-zinc-500 font-medium">
                Choose a pre-rendered high-definition SVG developer identity:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_FAVICONS.map((preset) => {
                  const isSelected = activeFavicon === preset.svgDataUrl || (preset.id === 'default-terminal' && activeFavicon === '/favicon.svg');
                  const PresetIcon = preset.icon;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.svgDataUrl)}
                      className={`p-3 text-left border rounded-lg transition-all flex items-start gap-3 group ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 p-1">
                        <img
                          src={preset.svgDataUrl}
                          alt={preset.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {preset.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">
                          {preset.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 3: Direct URL */}
          {sourceMode === 'url' && (
            <form onSubmit={handleApplyUrl} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Favicon Web URL / Asset Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. /favicon.svg or https://example.com/assets/favicon.ico"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
              >
                Apply Custom Icon URL
              </button>
            </form>
          )}

          {/* Helper notes */}
          <div className="text-[10px] text-zinc-400 font-mono space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-850">
            <div>• Dynamically injected into &lt;link rel="icon"&gt; and &lt;link rel="apple-touch-icon"&gt; tags.</div>
            <div>• Changes are automatically synchronized across public views and Firestore.</div>
          </div>

        </div>
      </div>

    </div>
  );
};
