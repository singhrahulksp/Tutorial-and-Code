import React, { useState, useEffect, useRef } from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { AdminLayout } from './AdminLayout';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { LocalImageUploader } from '../components/LocalImageUploader';
import { processLocalImageFile } from '../utils/imageUtils';
import { PostFAQ } from '../types';
import {
  Save,
  Send,
  Eye,
  Edit3,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  List,
  Quote,
  Table,
  Heading,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  ArrowLeft,
  CheckCircle2,
  Upload,
  ChevronDown,
  Type,
  HelpCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Neural / AI', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80' },
  { label: 'Rust / Systems', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80' },
  { label: 'Cybersecurity', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80' },
  { label: 'Cloud Architecture', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80' },
  { label: 'Silicon Microchips', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80' },
];

export const AdminEditorPage: React.FC = () => {
  const { posts, categories, authors, createPost, updatePost } = useBlog();
  const { params, navigate } = useRouter();

  const isEditing = Boolean(params.id);
  const existingPost = isEditing ? posts.find((p) => p.id === params.id) : undefined;

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ai');
  const [tagsInput, setTagsInput] = useState('');
  const [authorId, setAuthorId] = useState('auth-1');
  const [featuredImage, setFeaturedImage] = useState(PRESET_IMAGES[0].url);
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [directAnswer, setDirectAnswer] = useState('');
  const [keyTakeawaysInput, setKeyTakeawaysInput] = useState('');
  const [faqs, setFaqs] = useState<PostFAQ[]>([]);
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('write');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInsertingLocalImage, setIsInsertingLocalImage] = useState(false);
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false);

  const markdownImageInputRef = useRef<HTMLInputElement | null>(null);
  const headingDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close heading dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headingDropdownRef.current && !headingDropdownRef.current.contains(e.target as Node)) {
        setHeadingMenuOpen(false);
      }
    };
    if (headingMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [headingMenuOpen]);

  // Initialize data if editing
  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title || '');
      setSlug(existingPost.slug || '');
      setDescription(existingPost.description || '');
      setContent(existingPost.content || '');
      setCategory(existingPost.category || 'ai');
      setTagsInput(Array.isArray(existingPost.tags) ? existingPost.tags.join(', ') : '');
      setAuthorId(existingPost.authorId || 'auth-1');
      setFeaturedImage(existingPost.featuredImage || PRESET_IMAGES[0].url);
      setFeatured(Boolean(existingPost.featured));
      setSeoTitle(existingPost.seoTitle || '');
      setSeoDescription(existingPost.seoDescription || '');
      setDirectAnswer(existingPost.directAnswer || '');
      setKeyTakeawaysInput(Array.isArray(existingPost.keyTakeaways) ? existingPost.keyTakeaways.join('\n') : '');
      setFaqs(Array.isArray(existingPost.faq) ? existingPost.faq : []);
    } else {
      setFaqs([]);
      // Default template for new post
      setContent(`### Executive Summary

Provide a high-level architectural overview of the system, problem statement, and engineering benchmarks.

---

### Core Engineering Analysis

Explain the internal mechanics, memory profiles, or protocol interactions.

\`\`\`typescript
// Sample production code implementation
export async function handleRequest(req: Request): Promise<Response> {
  const data = await req.json();
  return Response.json({ status: "processed", payload: data });
}
\`\`\`

---

### Key Benchmark Results

| Metric | Baseline | Optimized Architecture |
| :--- | :--- | :--- |
| **p99 Latency** | 45ms | 2.4ms |
| **Memory RSS** | 512MB | 38MB |

---

### Architectural Takeaways

- Implement zero-allocation buffers
- Enforce strict JSON schema validation
- Decouple stateful persistence from transient compute`);
    }
  }, [existingPost]);

  // Word count & Reading time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const calculatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Quick Markdown Insert Toolbar Helper
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  // Dedicated Smart Heading Formatting (H2, H3, H4, H5)
  const applyHeading = (level: 2 | 3 | 4 | 5) => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prefix = '#'.repeat(level) + ' ';

    if (start === end) {
      // Single line / cursor position
      const textBefore = content.substring(0, start);
      const textAfter = content.substring(start);
      const lastNewline = textBefore.lastIndexOf('\n');
      const nextNewline = textAfter.indexOf('\n');

      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const lineEnd = nextNewline === -1 ? content.length : start + nextNewline;
      const currentLine = content.substring(lineStart, lineEnd);

      // Check existing heading level
      const currentHashMatch = currentLine.match(/^(#{1,6})\s+/);
      const currentLevel = currentHashMatch ? currentHashMatch[1].length : 0;

      let newLine: string;
      if (currentLevel === level) {
        // Toggle off back to normal paragraph text
        newLine = currentLine.replace(/^#{1,6}\s+/, '');
      } else {
        const cleanedLine = currentLine.replace(/^#{1,6}\s+/, '');
        newLine = cleanedLine.trim() ? `${prefix}${cleanedLine}` : `${prefix}Heading ${level}`;
      }

      const newContent = content.substring(0, lineStart) + newLine + content.substring(lineEnd);
      setContent(newContent);

      setTimeout(() => {
        textarea.focus();
        const newCursor = lineStart + newLine.length;
        textarea.setSelectionRange(newCursor, newCursor);
      }, 50);
    } else {
      // Multiple lines / highlighted selection
      const selected = content.substring(start, end);
      const lines = selected.split('\n');
      const transformed = lines
        .map((l) => {
          const cleaned = l.replace(/^#{1,6}\s+/, '');
          return `${prefix}${cleaned}`;
        })
        .join('\n');

      const newContent = content.substring(0, start) + transformed + content.substring(end);
      setContent(newContent);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + transformed.length);
      }, 50);
    }
  };

  // Handle Local Device Image insertion directly into markdown text
  const handleMarkdownLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsInsertingLocalImage(true);
    try {
      const base64Image = await processLocalImageFile(file, 1200, 800, 0.85);
      const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement | null;
      const start = textarea ? textarea.selectionStart : content.length;
      const imageMarkdown = `\n\n![${file.name.replace(/\.[^/.]+$/, '')}](${base64Image})\n*Figure: Uploaded technical diagram*\n\n`;

      const newContent = content.substring(0, start) + imageMarkdown + content.substring(start);
      setContent(newContent);
      setToastMessage('Local image added to Markdown content.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to insert local image.');
    } finally {
      setIsInsertingLocalImage(false);
      if (markdownImageInputRef.current) {
        markdownImageInputRef.current.value = '';
      }
    }
  };

  // Manual FAQ Management Handlers
  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    setFaqs((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide both an Article Title and Content.');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const keyTakeawaysArray = keyTakeawaysInput
      .split('\n')
      .map((t) => t.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);

    const cleanedFaqs = faqs
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
      .filter((f) => f.question.length > 0 && f.answer.length > 0);

    const nowIso = new Date().toISOString();
    const postPayload = {
      title,
      slug: slug.trim() || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      description: description.trim() || title,
      content,
      category,
      tags: tagsArray.length > 0 ? tagsArray : ['Tech'],
      authorId,
      featuredImage,
      publishedAt: existingPost?.publishedAt || nowIso,
      updatedAt: isEditing ? nowIso : existingPost?.updatedAt,
      readingTime: calculatedReadingTime,
      status: targetStatus,
      featured,
      seoTitle: seoTitle.trim() || title,
      seoDescription: seoDescription.trim() || description,
      directAnswer: directAnswer.trim() || undefined,
      keyTakeaways: keyTakeawaysArray.length > 0 ? keyTakeawaysArray : undefined,
      faq: cleanedFaqs.length > 0 ? cleanedFaqs : undefined,
      ogImage: featuredImage,
    };

    if (isEditing && existingPost) {
      await updatePost(existingPost.id, postPayload);
      setToastMessage(`Article successfully updated (Last modified: ${new Date(nowIso).toLocaleTimeString()}) as ${targetStatus.toUpperCase()} in Firestore! /sitemap.xml automatically refreshed.`);
    } else {
      const created = await createPost(postPayload);
      setToastMessage(`Article successfully created as ${targetStatus.toUpperCase()} in Firestore! /sitemap.xml automatically updated.`);
      navigate(`/admin/posts/${created.id}/edit`);
    }

    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <AdminLayout
      title={isEditing ? 'Edit Publication' : 'Compose Technical Deep-Dive'}
      subtitle={isEditing ? `Modifying /blog/${slug} (Synced to Firestore)` : 'Author high-precision Markdown with local image uploads and Firestore persistence.'}
      actionButton={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/posts')}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button
            onClick={() => handleSave('draft')}
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" /> Publish to Firestore
          </button>
        </div>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-6 p-4 border border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Revision Meta Bar for Existing Posts */}
      {isEditing && existingPost && (
        <div className="mb-6 p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-zinc-600 dark:text-zinc-300">
            <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
              Article Lifecycle:
            </span>
            <span>
              Published: {new Date(existingPost.publishedAt).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {existingPost.updatedAt ? (
              <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Last Updated: {new Date(existingPost.updatedAt).toLocaleString()}
              </span>
            ) : (
              <span className="text-zinc-400">
                No revisions yet (Original publication)
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Editor Body (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Title & Slug */}
          <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                Article Title
              </label>
              <input
                type="text"
                placeholder="e.g. Demystifying Advanced RAG: Hybrid Search, Reranking, and Graph..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 text-base sm:text-lg font-black uppercase tracking-tight border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  URL Slug (/blog/[slug])
                </label>
                <input
                  type="text"
                  placeholder="advanced-rag-hybrid-search"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Article Summary & Lead Description
              </label>
              <textarea
                rows={2}
                placeholder="High-level takeaway and technical overview for article card previews..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white resize-none"
              />
            </div>
          </div>

          {/* Markdown Content Editor Container */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            
            {/* Editor Toolbar */}
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex flex-wrap items-center justify-between gap-2">
              
              {/* Quick Formatting Tools */}
              <div className="flex flex-wrap items-center gap-1">
                
                {/* Heading Menu Dropdown & Quick Buttons */}
                <div className="relative flex items-center bg-zinc-200/80 dark:bg-zinc-800 rounded p-0.5" ref={headingDropdownRef}>
                  {/* Dropdown toggle button */}
                  <button
                    type="button"
                    onClick={() => setHeadingMenuOpen(!headingMenuOpen)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors"
                    title="Choose Heading Style"
                  >
                    <Heading className="w-3.5 h-3.5" />
                    <span className="text-[11px] uppercase tracking-wider font-extrabold">Heading</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${headingMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Direct 1-Click Heading Buttons H2 - H5 */}
                  <div className="flex items-center border-l border-zinc-300 dark:border-zinc-700 ml-1 pl-1 gap-0.5">
                    <button
                      type="button"
                      onClick={() => applyHeading(2)}
                      className="px-1.5 py-0.5 text-[11px] font-black uppercase rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-zinc-700 dark:text-zinc-300"
                      title="Heading 2 (Section Title - ##)"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHeading(3)}
                      className="px-1.5 py-0.5 text-[11px] font-black uppercase rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-zinc-700 dark:text-zinc-300"
                      title="Heading 3 (Subsection - ###)"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHeading(4)}
                      className="px-1.5 py-0.5 text-[11px] font-black uppercase rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-zinc-700 dark:text-zinc-300"
                      title="Heading 4 (Topic Header - ####)"
                    >
                      H4
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHeading(5)}
                      className="px-1.5 py-0.5 text-[11px] font-black uppercase rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-zinc-700 dark:text-zinc-300"
                      title="Heading 5 (Minor Header - #####)"
                    >
                      H5
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {headingMenuOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                        Format Line or Selection
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          applyHeading(2);
                          setHeadingMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-xs">
                            H2
                          </span>
                          <div>
                            <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              Heading 2
                            </div>
                            <div className="text-[10px] text-zinc-500">Major Section Title (##)</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">##</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          applyHeading(3);
                          setHeadingMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                            H3
                          </span>
                          <div>
                            <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              Heading 3
                            </div>
                            <div className="text-[10px] text-zinc-500">Subsection (###)</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">###</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          applyHeading(4);
                          setHeadingMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-black text-xs">
                            H4
                          </span>
                          <div>
                            <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              Heading 4
                            </div>
                            <div className="text-[10px] text-zinc-500">Topic Sub-block (####)</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">####</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          applyHeading(5);
                          setHeadingMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-black text-xs">
                            H5
                          </span>
                          <div>
                            <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                              Heading 5
                            </div>
                            <div className="text-[10px] text-zinc-500">Minor Header / Label (#####)</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">#####</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 italic text-xs"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('```typescript\n', '\n```')}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  title="Code Block"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ')}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  title="Quote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  title="List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('| Col 1 | Col 2 |\n| :--- | :--- |\n| Data 1 | Data 2 |\n')}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  title="Table"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('[', '](https://example.com)')}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  title="Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>

                {/* Hidden local image picker for body markdown */}
                <input
                  ref={markdownImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMarkdownLocalImageUpload}
                  className="hidden"
                  id="markdown-local-image-input"
                />

                {/* Button to insert image directly from device */}
                <button
                  type="button"
                  onClick={() => markdownImageInputRef.current?.click()}
                  disabled={isInsertingLocalImage}
                  className="ml-1 px-2 py-1 text-[11px] font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-1"
                  title="Upload & insert diagram from local device"
                >
                  <Upload className="w-3 h-3 text-blue-600" />
                  <span>{isInsertingLocalImage ? 'Uploading...' : 'Insert Image From Device'}</span>
                </button>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-0.5 text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1 transition-colors ${
                    activeTab === 'write'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-3 h-3" /> Write
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3 h-3" /> Preview
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('split')}
                  className={`hidden sm:block px-3 py-1 transition-colors ${
                    activeTab === 'split'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Split
                </button>
              </div>

            </div>

            {/* Editor Input / Preview Area */}
            <div className="p-4">
              {activeTab === 'write' && (
                <textarea
                  id="editor-textarea"
                  rows={20}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Compose long-form engineering markdown..."
                  className="w-full p-4 font-mono text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-black dark:focus:border-white resize-y leading-relaxed"
                />
              )}

              {activeTab === 'preview' && (
                <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 min-h-[400px]">
                  <MarkdownRenderer content={content} />
                </div>
              )}

              {activeTab === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <textarea
                    id="editor-textarea"
                    rows={20}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-4 font-mono text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-black dark:focus:border-white"
                  />
                  <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 overflow-y-auto max-h-[500px]">
                    <MarkdownRenderer content={content} />
                  </div>
                </div>
              )}

              {/* Stats Bar */}
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <div>
                  {wordCount.toLocaleString()} words • ~{calculatedReadingTime} min read
                </div>
                <div>Markdown, GFM tables, & Local Device Images enabled</div>
              </div>
            </div>
          </div>

          {/* Manual Frequently Asked Questions (FAQ) Section */}
          <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-white">
                    Frequently Asked Questions (FAQ)
                  </h3>
                  {faqs.length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded">
                      {faqs.length} {faqs.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Add custom questions and answers to be displayed on this article and indexed in Google FAQ schema.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                <HelpCircle className="w-7 h-7 text-zinc-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">No FAQs added for this article yet.</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Click below to add a manual FAQ pair.</p>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-neutral-900 dark:text-white transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add First FAQ</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {faqs.map((faqItem, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 rounded space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                          FAQ #{idx + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveFaq(idx, 'up')}
                          className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === faqs.length - 1}
                          onClick={() => handleMoveFaq(idx, 'down')}
                          className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded ml-1"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                        Question
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. How does this system scale under heavy load?"
                        value={faqItem.question}
                        onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                        Answer
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Provide a clear, detailed answer..."
                        value={faqItem.answer}
                        onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white resize-y leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Configuration (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Metadata Card */}
          <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              Publication Settings
            </h3>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Assigned Author
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="RAG, AI, Python, Vector Search"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none"
              />
            </div>

            {/* Featured Switch */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Hero Featured Headline
                </div>
                <div className="text-[10px] text-zinc-500">Showcase in top slot on home page</div>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-black focus:ring-0"
              />
            </div>
          </div>

          {/* Featured Image Selector with Local Device Upload */}
          <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 space-y-4">
            <LocalImageUploader
              label="Article Featured Cover Image"
              value={featuredImage}
              onChange={setFeaturedImage}
              aspectRatio="video"
              maxWidth={1400}
              maxHeight={900}
              helperText="Upload any PNG, JPG, or WebP photo from your computer."
            />

            {/* Image Presets */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="block text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Or pick standard tech preset:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFeaturedImage(preset.url)}
                    className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-left truncate transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SEO & Social Metadata Drawer */}
          <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              SEO & Social Metadata
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Custom SEO Title
              </label>
              <input
                type="text"
                placeholder={title || 'Custom meta title'}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Meta Description
              </label>
              <textarea
                rows={2}
                placeholder={description || 'Custom search snippet'}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none resize-none"
              />
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Direct Answer / Executive Summary
              </label>
              <textarea
                rows={3}
                placeholder="40-70 word self-contained factual summary for search snippets and article header overview..."
                value={directAnswer}
                onChange={(e) => setDirectAnswer(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Key Takeaways (1 per line)
              </label>
              <textarea
                rows={3}
                placeholder="Fact 1: Key architectural takeaway&#10;Fact 2: Performance metric assertion"
                value={keyTakeawaysInput}
                onChange={(e) => setKeyTakeawaysInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none resize-none font-mono text-[11px]"
              />
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};
