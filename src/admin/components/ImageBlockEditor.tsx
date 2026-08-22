import React, { useState, useRef } from 'react';
import { ImageBlock } from '../../types';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { processLocalImageFile } from '../../utils/imageUtils';

interface ImageBlockEditorProps {
  block: ImageBlock;
  onChange: (updated: ImageBlock) => void;
}

export const ImageBlockEditor: React.FC<ImageBlockEditorProps> = ({ block, onChange }) => {
  const [mode, setMode] = useState<'upload' | 'url'>(block.url.startsWith('http') && !block.url.startsWith('data:') ? 'url' : 'upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please choose a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    setIsProcessing(true);
    setUploadSuccess(false);

    try {
      // Process and compress image to durable, lightweight WebP/JPEG Base64 string
      const base64Data = await processLocalImageFile(file, 1600, 1000, 0.88);
      const defaultAlt = block.altText || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      onChange({
        ...block,
        url: base64Data,
        altText: defaultAlt,
      });

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to process image file:', err);
      alert('Failed to process image from device. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
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
      handleFile(file);
    }
  };

  const handleRemoveImage = () => {
    onChange({
      ...block,
      url: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateField = <K extends keyof ImageBlock>(field: K, value: ImageBlock[K]) => {
    onChange({
      ...block,
      [field]: value,
    });
  };

  return (
    <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
      {/* Upload or URL Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
            Article Image Component
          </span>
          {uploadSuccess && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Image Saved
            </span>
          )}
        </div>

        {/* Source Mode Toggle */}
        <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Device Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Image Preview or Upload Dropzone */}
      {block.url ? (
        <div className="space-y-3">
          <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 max-h-[420px] flex items-center justify-center">
            <img
              src={block.url}
              alt={block.altText || 'Uploaded article image'}
              className="w-full h-full object-contain max-h-[380px]"
            />

            {/* Overlay Action Buttons */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-3 py-2 rounded-lg bg-white text-neutral-900 text-xs font-bold shadow-lg hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Replace Image</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-lg hover:bg-rose-700 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Image is embedded permanently in persistent storage.</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Change File
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : mode === 'upload' ? (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10'
          }`}
        >
          <div className="p-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              {isProcessing ? 'Optimizing Image...' : 'Click or Drag & Drop Image from Device'}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Supports PNG, JPG, WebP, GIF, SVG. Automatically optimized for persistence.
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Select from Computer
          </button>
        </div>
      ) : (
        /* URL Input Mode */
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Image Web URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={block.url}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="https://images.unsplash.com/... or https://..."
              className="flex-1 px-3 py-2 text-xs font-mono border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Metadata Fields: Alt Text, Caption & Alignment */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
        {/* Alt Text Field */}
        <div className="md:col-span-6 space-y-1">
          <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
            <span>Alt Text (Required for SEO & Accessibility)</span>
            <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
              &lt;img alt="..."&gt;
            </span>
          </label>
          <input
            type="text"
            value={block.altText}
            onChange={(e) => updateField('altText', e.target.value)}
            placeholder="e.g. Architecture diagram of neural RAG pipeline"
            className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Caption Field */}
        <div className="md:col-span-4 space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Caption (Optional)
          </label>
          <input
            type="text"
            value={block.caption || ''}
            onChange={(e) => updateField('caption', e.target.value)}
            placeholder="e.g. Figure 1: Flowchart comparison"
            className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Alignment Selector */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Alignment
          </label>
          <select
            value={block.alignment || 'center'}
            onChange={(e) =>
              updateField('alignment', e.target.value as 'center' | 'left' | 'right' | 'full')
            }
            className="w-full px-2.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="center">Center</option>
            <option value="full">Full Width</option>
            <option value="left">Left Float</option>
            <option value="right">Right Float</option>
          </select>
        </div>
      </div>
    </div>
  );
};
