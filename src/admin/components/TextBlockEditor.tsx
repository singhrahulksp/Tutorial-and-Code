import React, { useState, useRef, useEffect } from 'react';
import { TextBlock } from '../../types';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code as CodeIcon,
  ExternalLink,
  X,
  Check,
  Eye,
  Edit3,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TextBlockEditorProps {
  block: TextBlock;
  onChange: (updated: TextBlock) => void;
}

export const TextBlockEditor: React.FC<TextBlockEditorProps> = ({ block, onChange }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [previewMode, setPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(100, textareaRef.current.scrollHeight)}px`;
    }
  }, [block.content, previewMode]);

  const updateContent = (newContent: string) => {
    onChange({
      ...block,
      content: newContent,
    });
  };

  const applyHeading = (level: 2 | 3 | 4) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = block.content;

    // Find line start and line end around cursor/selection
    const lastNewLine = current.lastIndexOf('\n', start - 1);
    const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
    const nextNewLine = current.indexOf('\n', end);
    const lineEnd = nextNewLine === -1 ? current.length : nextNewLine;

    const currentLine = current.substring(lineStart, lineEnd);
    // Strip any existing leading heading hashes
    const cleanLine = currentLine.replace(/^#+\s*/, '');
    const prefix = `${'#'.repeat(level)} `;
    
    // If the line had content, preserve it; otherwise create placeholder
    const isPlaceholder = !cleanLine.trim();
    const headingContent = isPlaceholder ? `Section Heading ${level}` : cleanLine;
    const newLine = `${prefix}${headingContent}`;

    const newContent = current.substring(0, lineStart) + newLine + current.substring(lineEnd);
    updateContent(newContent);

    setTimeout(() => {
      textarea.focus();
      if (isPlaceholder) {
        // Select the placeholder text so user can replace immediately by typing
        textarea.setSelectionRange(lineStart + prefix.length, lineStart + newLine.length);
      } else {
        const newCursor = lineStart + newLine.length;
        textarea.setSelectionRange(newCursor, newCursor);
      }
    }, 50);
  };

  const applyFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = block.content;
    const selected = current.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = current.substring(0, start) + replacement + current.substring(end);
    updateContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const applyList = (type: 'ul' | 'ol') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = block.content;
    const selected = current.substring(start, end);

    if (selected.trim()) {
      const lines = selected.split('\n');
      const formatted = lines
        .map((line, idx) => {
          const clean = line.replace(/^(\d+\.|\*|-)\s+/, '');
          return type === 'ol' ? `${idx + 1}. ${clean}` : `- ${clean}`;
        })
        .join('\n');

      const newContent = current.substring(0, start) + formatted + current.substring(end);
      updateContent(newContent);
    } else {
      const prefix = type === 'ol' ? '\n1. Item 1\n2. Item 2\n' : '\n- Item 1\n- Item 2\n';
      const newContent = current.substring(0, start) + prefix + current.substring(end);
      updateContent(newContent);
    }
  };

  const openLinkModal = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = block.content.substring(start, end);

    setSelectionRange({ start, end });
    setLinkText(selected || '');
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const handleConfirmLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkUrl.trim()) return;

    const textToUse = linkText.trim() || linkUrl.trim();
    let finalUrl = linkUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('/')) {
      finalUrl = `https://${finalUrl}`;
    }

    const markdownLink = `[${textToUse}](${finalUrl})`;
    const current = block.content;
    const newContent =
      current.substring(0, selectionRange.start) +
      markdownLink +
      current.substring(selectionRange.end);

    updateContent(newContent);
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const cursor = selectionRange.start + markdownLink.length;
        textareaRef.current.setSelectionRange(cursor, cursor);
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        applyFormatting('**', '**');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        applyFormatting('*', '*');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        applyFormatting('<u>', '</u>');
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        openLinkModal();
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700/80 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings Controls (H2, H3, H4) */}
          <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md p-0.5 shadow-2xs mr-1">
            <button
              type="button"
              onClick={() => applyHeading(2)}
              className="px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/60 text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 font-black text-[11px] tracking-tight transition-colors"
              title="Heading 2 (## Section Title)"
            >
              H2
            </button>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5" />
            <button
              type="button"
              onClick={() => applyHeading(3)}
              className="px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/60 text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-[11px] tracking-tight transition-colors"
              title="Heading 3 (### Subsection Title)"
            >
              H3
            </button>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5" />
            <button
              type="button"
              onClick={() => applyHeading(4)}
              className="px-1.5 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/60 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-[11px] tracking-tight transition-colors"
              title="Heading 4 (#### Sub-item Title)"
            >
              H4
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

          {/* Formatting buttons */}
          <button
            type="button"
            onClick={() => applyFormatting('**', '**')}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('*', '*')}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting('<u>', '</u>')}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <button
            type="button"
            onClick={() => applyList('ul')}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyList('ol')}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <button
            type="button"
            onClick={openLinkModal}
            className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-600 dark:text-blue-400 font-medium transition-colors flex items-center gap-1 text-[11px]"
            title="Insert Inline Link (Ctrl+K)"
          >
            <LinkIcon className="w-3 h-3" />
            <span>Insert Link</span>
          </button>

          <button
            type="button"
            onClick={() => applyFormatting('`', '`')}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
            title="Inline Code (`code`)"
          >
            <CodeIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
              !previewMode
                ? 'bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
              previewMode
                ? 'bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor / Preview Body */}
      {!previewMode ? (
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={4}
            value={block.content}
            onChange={(e) => updateContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writng you article from here"
            className="w-full p-4 text-sm sm:text-base leading-relaxed bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-neutral-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-sans"
          />
        </div>
      ) : (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg min-h-[100px] prose dark:prose-invert max-w-none text-sm sm:text-base">
          {block.content.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-extrabold text-neutral-950 dark:text-white tracking-tight mt-6 mb-3">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mt-5 mb-2.5">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight mt-4 mb-2">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-semibold text-neutral-900 dark:text-white tracking-tight mt-3 mb-1.5">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="my-2.5 text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
                    {children}
                  </p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-4 decoration-blue-300"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {block.content}
            </ReactMarkdown>
          ) : (
            <div className="text-zinc-400 italic text-xs">Empty text block</div>
          )}
        </div>
      )}

      {/* Inline Link Modal Popover */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Insert Inline Link
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmLink} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Display Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Python Tutorials"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                  autoFocus={!linkText}
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  The clickable text readers see in the article.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Destination URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://tutorialsandcode.in/blog/... or https://..."
                    className="w-full pl-3 pr-8 py-2 text-xs font-mono border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                    autoFocus={Boolean(linkText)}
                  />
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  The URL is attached to the text and will NOT be shown as plain text.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!linkUrl.trim()}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Attach Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
