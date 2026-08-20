import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { processLocalImageFile } from '../utils/imageUtils';

interface LocalImageUploaderProps {
  value: string;
  onChange: (imageSrc: string) => void;
  label?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  maxWidth?: number;
  maxHeight?: number;
  helperText?: string;
}

export const LocalImageUploader: React.FC<LocalImageUploaderProps> = ({
  value,
  onChange,
  label = 'Featured Image',
  aspectRatio = 'video',
  maxWidth = 1400,
  maxHeight = 900,
  helperText = 'Supports PNG, JPG, WebP, SVG from your device.',
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-16/9'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'aspect-21/9'
      : 'min-h-[160px]';

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    setIsProcessing(true);
    setUploadSuccess(false);

    try {
      const processedBase64 = await processLocalImageFile(file, maxWidth, maxHeight, 0.88);
      onChange(processedBase64);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Image processing failed:', err);
      alert('Failed to process image from device. Please try another file.');
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

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            id="btn-upload-from-device-tab"
            onClick={() => setMode('upload')}
            className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-zinc-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Local Device</span>
          </button>
          <button
            type="button"
            id="btn-upload-by-url-tab"
            onClick={() => setMode('url')}
            className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-zinc-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>URL</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Local Device Upload Zone */}
      {mode === 'upload' ? (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            id={`file-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
          />

          {value ? (
            /* Image Preview Card with Action Buttons */
            <div className="relative group border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
              <div className={`w-full ${aspectClass} overflow-hidden bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center`}>
                <img
                  src={value}
                  alt="Selected preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs">
                {uploadSuccess ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Loaded & Optimized</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3 text-blue-400" />
                    <span>Image Ready</span>
                  </>
                )}
              </div>

              {/* Quick Actions overlay */}
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Choose Another File</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty Drag & Drop Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white bg-zinc-50/50 dark:bg-zinc-900/50'
              }`}
            >
              {isProcessing ? (
                <div className="py-4 space-y-2 flex flex-col items-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Processing Image from Device...
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 mb-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    Click to browse or drag & drop image
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    Upload PNG, JPG, or WebP directly from your computer
                  </div>
                  <button
                    type="button"
                    className="mt-3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                  >
                    Select File from Device
                  </button>
                </>
              )}
            </div>
          )}
          <p className="text-[10px] text-zinc-400 font-mono">{helperText}</p>
        </div>
      ) : (
        /* Mode 2: External Image URL */
        <div className="space-y-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
          />
          {value && (
            <div className={`w-full ${aspectClass} overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900`}>
              <img src={value} alt="URL preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
