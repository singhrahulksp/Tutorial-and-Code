import React, { useState, useMemo } from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { AdminLayout } from './AdminLayout';
import {
  PlusCircle,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AdminPostsPage: React.FC = () => {
  const { posts, categories, getAuthorById, togglePostStatus, deletePost } = useBlog();
  const { navigate } = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [posts, statusFilter, categoryFilter, searchQuery]);

  const handleDelete = (id: string) => {
    deletePost(id);
    setDeleteConfirmId(null);
  };

  return (
    <AdminLayout
      title="Articles & Research Archive"
      subtitle={`Manage all ${posts.length} technical publications, drafts, and taxonomy bindings.`}
      actionButton={
        <button
          onClick={() => navigate('/admin/posts/new')}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Article</span>
        </button>
      }
    >
      {/* Controls Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search articles by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'published'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Published ({posts.filter((p) => p.status === 'published').length})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'draft'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Drafts ({posts.filter((p) => p.status === 'draft').length})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 font-mono">
              <tr>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider">Article Title</th>
                <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Category</th>
                <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Author</th>
                <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Views</th>
                <th className="px-4 py-3.5 font-medium uppercase tracking-wider">Published</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredPosts.map((post) => {
                const cat = categories.find((c) => c.slug === post.category);
                const author = getAuthorById(post.authorId);
                const isPublished = post.status === 'published';

                return (
                  <tr key={post.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-850 transition-colors">
                    <td className="px-6 py-4 max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-2">
                        {post.featured && (
                          <span title="Featured Story">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          </span>
                        )}
                        <span className="font-bold text-neutral-900 dark:text-white truncate">
                          {post.title}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                        /blog/{post.slug}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                        {cat?.name || post.category}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                      {author?.name || 'Staff'}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePostStatus(post.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold transition-all active:scale-95 ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                        title="Click to toggle Draft / Published"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="capitalize">{post.status}</span>
                      </button>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap font-mono text-neutral-600 dark:text-neutral-400">
                      {post.views.toLocaleString()}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap font-mono text-neutral-500">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => navigate(`/blog/${post.slug}`)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Preview Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit Article"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(post.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="py-16 text-center text-neutral-500 text-xs">
            No articles match the current filter criteria.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Delete Article?</h2>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                This action will permanently remove this publication from the local database and public feeds.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
