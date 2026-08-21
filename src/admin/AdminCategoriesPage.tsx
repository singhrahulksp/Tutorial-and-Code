import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { AdminLayout } from './AdminLayout';
import { FolderTree, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Category } from '../types';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, posts, addCategory, updateCategory, deleteCategory } = useBlog();

  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [toast, setToast] = useState<string | null>(null);

  const startCreate = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setDescription('');
    setColor('blue');
  };

  const startEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setColor(cat.color || 'blue');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedSlug = slug.trim() || name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    if (editingCat) {
      updateCategory(editingCat.id, {
        name,
        slug: formattedSlug,
        description,
        color,
      });
      setToast(`Updated category "${name}" in Firestore.`);
    } else {
      addCategory({
        name,
        slug: formattedSlug,
        description,
        color,
        iconName: 'Folder',
      });
      setToast(`Created category "${name}" in Firestore.`);
    }

    startCreate();
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    const postCount = posts.filter((p) => p.category === id || p.category === categories.find((c) => c.id === id)?.slug).length;
    if (postCount > 0) {
      alert(`Cannot delete category "${name}" because it has ${postCount} associated articles.`);
      return;
    }

    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteCategory(id);
      setToast(`Deleted category "${name}"`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <AdminLayout
      title="Category & Domain Taxonomy"
      subtitle="Organize technical disciplines, filter tracks, and navigation categories synced with Firestore."
    >
      {toast && (
        <div className="mb-6 p-4 border border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Add / Edit Category */}
        <div className="lg:col-span-5">
          <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              {editingCat ? `Edit Category: ${editingCat.name}` : 'Create New Category Track'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCat) {
                      setSlug(e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'));
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  URL Slug (/category/[slug])
                </label>
                <input
                  type="text"
                  placeholder="distributed-systems"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Focus areas covered under this engineering track..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                >
                  {editingCat ? 'Update Category' : 'Create Category'}
                </button>
                {editingCat && (
                  <button
                    type="button"
                    onClick={startCreate}
                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right List: All Categories */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Taxonomy Tracks: {categories.length}
            </span>
            <button
              onClick={startCreate}
              className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>New Category</span>
            </button>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const count = posts.filter(
                (p) => p.category === cat.slug || p.category === cat.id
              ).length;

              return (
                <div
                  key={cat.id}
                  className="p-5 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white">
                        {cat.name}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">/category/{cat.slug}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="text-[11px] font-mono text-zinc-400 pt-1">
                      {count} published articles in track
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
