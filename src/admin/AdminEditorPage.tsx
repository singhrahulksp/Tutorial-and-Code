import React, { useState, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { AdminLayout } from './AdminLayout';
import { ArticleBlocksRenderer } from '../components/ArticleBlocksRenderer';
import { LocalImageUploader } from '../components/LocalImageUploader';
import { BlockBasedEditor } from './components/BlockBasedEditor';
import { PostFAQ, ArticleBlock } from '../types';
import {
  parseMarkdownToBlocks,
  serializeBlocksToMarkdown,
  calculateBlocksStats,
  createBlock,
} from '../utils/blockUtils';
import {
  Save,
  Send,
  Eye,
  Edit3,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Columns,
  Layers,
  Calendar,
  Clock,
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
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);
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
  const [isSaving, setIsSaving] = useState(false);

  // Initialize data if editing or load default blocks for new article
  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title || '');
      setSlug(existingPost.slug || '');
      setDescription(existingPost.description || '');
      
      // Load blocks or convert legacy markdown content
      if (existingPost.blocks && existingPost.blocks.length > 0) {
        setBlocks(existingPost.blocks);
      } else if (existingPost.content) {
        setBlocks(parseMarkdownToBlocks(existingPost.content));
      } else {
        setBlocks([createBlock('text', { content: '' })]);
      }

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
      // Initialize new article with a single clean Text / Rich Text component
      setBlocks([createBlock('text', { content: '' })]);
    }
  }, [existingPost]);

  // Dynamic Metrics
  const stats = calculateBlocksStats(blocks);
  const currentAuthor = authors.find((a) => a.id === authorId) || authors[0];
  const currentCategory = categories.find((c) => c.slug === category) || categories[0];

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

  // Save / Publish Action
  const handleSave = async (targetStatus: 'draft' | 'published') => {
    if (!title.trim()) {
      alert('Please enter an Article Title.');
      return;
    }

    if (blocks.length === 0) {
      alert('Please add at least one content component block.');
      return;
    }

    setIsSaving(true);

    try {
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

      // Serialize blocks to unified markdown for backward compatibility, RSS, and SEO
      const serializedContent = serializeBlocksToMarkdown(blocks);

      const nowIso = new Date().toISOString();
      const generatedSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

      const postPayload = {
        title: title.trim(),
        slug: generatedSlug,
        description: description.trim() || title.trim(),
        content: serializedContent,
        blocks: blocks,
        category,
        tags: tagsArray.length > 0 ? tagsArray : ['Tutorial'],
        authorId,
        featuredImage: featuredImage || PRESET_IMAGES[0].url,
        publishedAt: existingPost?.publishedAt || nowIso,
        updatedAt: isEditing ? nowIso : existingPost?.updatedAt,
        readingTime: stats.readingTime,
        status: targetStatus,
        featured,
        seoTitle: seoTitle.trim() || title.trim(),
        seoDescription: seoDescription.trim() || description.trim(),
        directAnswer: directAnswer.trim() || undefined,
        keyTakeaways: keyTakeawaysArray.length > 0 ? keyTakeawaysArray : undefined,
        faq: cleanedFaqs.length > 0 ? cleanedFaqs : undefined,
        ogImage: featuredImage || PRESET_IMAGES[0].url,
      };

      if (isEditing && existingPost) {
        await updatePost(existingPost.id, postPayload);
        setToastMessage(
          `Article successfully updated (${targetStatus.toUpperCase()}) with ${blocks.length} structured blocks!`
        );
      } else {
        const created = await createPost(postPayload);
        setToastMessage(`Article successfully published to Firestore!`);
        navigate(`/admin/posts/${created.id}/edit`);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save article. Please try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? 'Edit Publication (Block CMS)' : 'New Technical Article (Block CMS)'}
      subtitle={
        isEditing
          ? `Modifying /blog/${slug || existingPost?.slug} with structured blocks`
          : 'Compose modular articles with Text, Image, Code, and Quote components.'
      }
      actionButton={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/posts')}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button
            disabled={isSaving}
            onClick={() => handleSave('draft')}
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 rounded-lg disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button
            disabled={isSaving}
            onClick={() => handleSave('published')}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 shadow-md rounded-lg disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Publish to Live
          </button>
        </div>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-6 p-4 border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 text-xs font-bold flex items-center gap-2 rounded-xl animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Revision Meta Bar for Existing Posts */}
      {isEditing && existingPost && (
        <div className="mb-6 p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-zinc-600 dark:text-zinc-300">
            <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
              Status:
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                existingPost.status === 'published'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {existingPost.status}
            </span>
            <span>• Published: {new Date(existingPost.publishedAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {existingPost.updatedAt ? (
              <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Updated: {new Date(existingPost.updatedAt).toLocaleTimeString()}
              </span>
            ) : (
              <span className="text-zinc-400">Original Publication</span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Article Title, Slug & Lead Excerpt */}
          <div className="p-6 bg-white dark:bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-xs">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                Article Title / Main Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Master Python Decorators: From Basics to Advanced Metaprogramming"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 text-lg sm:text-xl font-black tracking-tight border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white rounded-lg outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  URL Slug (/blog/[slug])
                </label>
                <input
                  type="text"
                  placeholder="master-python-decorators"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white rounded-lg outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Article Excerpt & Summary
              </label>
              <textarea
                rows={2}
                placeholder="Brief 1-2 sentence overview shown in article card listings..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white rounded-lg outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Block-Based Content Editor Container */}
          <div className="bg-white dark:bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs">
            {/* View Mode Switcher Header */}
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-t-xl flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                  Block-Based Content CMS
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  ({blocks.length} {blocks.length === 1 ? 'block' : 'blocks'})
                </span>
              </div>

              {/* View Tabs */}
              <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    activeTab === 'write'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('split')}
                  className={`hidden sm:flex px-3 py-1 rounded-md transition-all items-center gap-1.5 ${
                    activeTab === 'split'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split View</span>
                </button>
              </div>
            </div>

            {/* Editor Workspace Views */}
            <div className="p-4 sm:p-6">
              {activeTab === 'write' && (
                <BlockBasedEditor blocks={blocks} onChange={setBlocks} />
              )}

              {activeTab === 'preview' && (
                <div className="space-y-6">
                  {/* Mock Article Header in Preview */}
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white px-2.5 py-1 inline-block rounded mb-3">
                      {currentCategory?.name || category}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
                      {title || 'Untitled Article'}
                    </h1>
                    {description && (
                      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 mt-2">
                        {description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400 font-medium">
                      <span>By {currentAuthor?.name || 'Author'}</span>
                      <span>•</span>
                      <span>{stats.readingTime} Min Read</span>
                      <span>•</span>
                      <span>{stats.wordCount} Words</span>
                    </div>
                  </div>

                  {/* Rendered Blocks */}
                  <ArticleBlocksRenderer blocks={blocks} />
                </div>
              )}

              {activeTab === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="overflow-y-auto max-h-[85vh] pr-2">
                    <BlockBasedEditor blocks={blocks} onChange={setBlocks} />
                  </div>
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-y-auto max-h-[85vh]">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      Live Output Preview
                    </div>
                    <ArticleBlocksRenderer blocks={blocks} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Frequently Asked Questions (FAQ) Section */}
          <div className="p-6 bg-white dark:bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-white">
                    Frequently Asked Questions (FAQ)
                  </h3>
                  {faqs.length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded">
                      {faqs.length} {faqs.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Questions and answers indexed in Google FAQ structured data.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center gap-1.5 rounded-lg shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-500">No FAQs added for this article yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faqItem, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 rounded-xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Question #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveFaq(idx, 'up')}
                          className="p-1 text-zinc-500 hover:text-black dark:hover:text-white disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === faqs.length - 1}
                          onClick={() => handleMoveFaq(idx, 'down')}
                          className="p-1 text-zinc-500 hover:text-black dark:hover:text-white disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="e.g. How does this algorithm perform on large datasets?"
                      value={faqItem.question}
                      onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-neutral-900 dark:text-white rounded-lg outline-none focus:border-blue-500"
                    />

                    <textarea
                      rows={2}
                      placeholder="Detailed, accurate answer..."
                      value={faqItem.answer}
                      onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-neutral-900 dark:text-white rounded-lg outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Configuration (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publication Meta Card */}
          <div className="p-6 bg-white dark:bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              Publication Settings
            </h3>

            {/* Author */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Assigned Author
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white rounded-lg outline-none"
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
                placeholder="Python, Decorators, Web Development"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white rounded-lg outline-none"
              />
            </div>

            {/* Featured Switch */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Hero Featured Story
                </div>
                <div className="text-[10px] text-zinc-500">Display prominently on home page</div>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Featured Cover Image */}
          <div className="p-6 bg-white dark:bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-xs">
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
                    className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-left truncate transition-colors rounded"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SEO & Social Metadata */}
          <div className="p-6 bg-white dark:bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              SEO & Search Enhancements
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Custom SEO Title
              </label>
              <input
                type="text"
                placeholder={title || 'Custom meta title tag'}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Meta Description
              </label>
              <textarea
                rows={2}
                placeholder={description || 'Search snippet description'}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white rounded-lg outline-none resize-none"
              />
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Direct Answer / Quick Summary
              </label>
              <textarea
                rows={3}
                placeholder="Self-contained direct answer shown in executive summary box..."
                value={directAnswer}
                onChange={(e) => setDirectAnswer(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white rounded-lg outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Key Takeaways (1 per line)
              </label>
              <textarea
                rows={3}
                placeholder="Takeaway 1&#10;Takeaway 2"
                value={keyTakeawaysInput}
                onChange={(e) => setKeyTakeawaysInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white rounded-lg outline-none resize-none font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
