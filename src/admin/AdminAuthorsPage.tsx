import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { AdminLayout } from './AdminLayout';
import { Plus, Edit2, Trash2, CheckCircle2, User } from 'lucide-react';
import { Author } from '../types';
import { LocalImageUploader } from '../components/LocalImageUploader';

export const AdminAuthorsPage: React.FC = () => {
  const { authors, posts, addAuthor, updateAuthor, deleteAuthor } = useBlog();

  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const startCreate = () => {
    setEditingAuthor(null);
    setName('');
    setSlug('');
    setRole('');
    setBio('');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setTwitter('');
    setGithub('');
    setWebsite('');
  };

  const startEdit = (author: Author) => {
    setEditingAuthor(author);
    setName(author.name || '');
    setSlug(author.slug || '');
    setRole(author.role || '');
    setBio(author.bio || '');
    setAvatar(author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setTwitter(author.twitter || '');
    setGithub(author.github || '');
    setWebsite(author.website || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedSlug = slug.trim() || name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    if (editingAuthor) {
      updateAuthor(editingAuthor.id, {
        name,
        slug: formattedSlug,
        role,
        bio,
        avatar,
        twitter,
        github,
        website,
      });
      setToast(`Updated author profile "${name}" in Firestore.`);
    } else {
      addAuthor({
        name,
        slug: formattedSlug,
        role: role || 'Contributing Writer',
        bio: bio || 'Technical author on Tutorials and Code.',
        avatar,
        twitter,
        github,
        website,
      });
      setToast(`Added new staff author "${name}" to Firestore.`);
    }

    startCreate();
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    const postCount = posts.filter((p) => p.authorId === id).length;
    if (postCount > 0) {
      alert(`Cannot delete author "${name}" because they have ${postCount} authored articles.`);
      return;
    }

    if (confirm(`Are you sure you want to remove author "${name}"?`)) {
      deleteAuthor(id);
      setToast(`Removed author "${name}"`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <AdminLayout
      title="Editorial Staff & Contributors"
      subtitle="Manage researcher profiles, author bios, social links, and avatars stored in Firestore."
    >
      {toast && (
        <div className="mb-6 p-4 border border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Author Form */}
        <div className="lg:col-span-5">
          <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
              <User className="w-4 h-4" />
              {editingAuthor ? `Edit Profile: ${editingAuthor.name}` : 'Add New Contributor'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Dr. Elena Rostova"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingAuthor) {
                      setSlug(e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'));
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  URL Slug (/author/[slug])
                </label>
                <input
                  type="text"
                  placeholder="elena-rostova"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Role / Specialization
                </label>
                <input
                  type="text"
                  placeholder="Principal AI Systems Architect"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                  required
                />
              </div>

              {/* Local Device Avatar Uploader */}
              <div className="pt-2">
                <LocalImageUploader
                  label="Author Avatar Photo"
                  value={avatar}
                  onChange={setAvatar}
                  aspectRatio="square"
                  maxWidth={600}
                  maxHeight={600}
                  helperText="Upload profile photo from your device (PNG, JPG, WebP)."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Bio / Editorial Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Short bio detailing technical experience and engineering pedigree..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Twitter / X</label>
                  <input
                    type="text"
                    placeholder="https://twitter.com/..."
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">GitHub</label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                >
                  {editingAuthor ? 'Save Profile' : 'Add Contributor'}
                </button>
                {editingAuthor && (
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

        {/* Authors List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Total Staff: {authors.length}
            </span>
            <button
              onClick={startCreate}
              className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>New Author</span>
            </button>
          </div>

          {authors.map((author) => {
            const count = posts.filter((p) => p.authorId === author.id).length;

            return (
              <div
                key={author.id}
                className="p-5 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-800 flex items-start gap-4"
              >
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-16 h-16 object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-sm uppercase tracking-tight text-neutral-900 dark:text-white">
                      {author.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(author)}
                        className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Edit Author"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(author.id, author.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete Author"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-0.5">
                    {author.role}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {author.bio}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span>{count} authored articles</span>
                    <span>/author/{author.slug}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </AdminLayout>
  );
};
