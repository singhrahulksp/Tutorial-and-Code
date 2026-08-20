import React, { useState } from 'react';
import { Share2, Twitter, Linkedin, Link as LinkIcon, Check, Mail } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopy();
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}&via=tutorialsandcode`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this technical tutorial and architecture on Tutorials and Code:\n\n${shareUrl}`)}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mr-1">Share:</span>

      <button
        onClick={handleCopy}
        type="button"
        title="Copy article link"
        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
      </button>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on X (Twitter)"
        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <Twitter className="w-4 h-4" />
      </a>

      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on LinkedIn"
        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <Linkedin className="w-4 h-4" />
      </a>

      <a
        href={mailUrl}
        title="Email article"
        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <Mail className="w-4 h-4" />
      </a>

      <button
        onClick={handleNativeShare}
        type="button"
        title="More share options"
        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors sm:hidden"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
};
