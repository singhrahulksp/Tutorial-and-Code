import React from 'react';
import { useBlog } from '../context/BlogContext';
import { useRouter } from '../router/RouterContext';
import { AdminLayout } from './AdminLayout';
import {
  FileText,
  CheckCircle2,
  FileEdit,
  FolderTree,
  Users,
  Eye,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Mail,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { posts, categories, authors, subscribers, togglePostStatus, deletePost } = useBlog();
  const { navigate } = useRouter();

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 6);

  return (
    <AdminLayout
      title="Editorial Command Center"
      subtitle="Overview of published research, drafts, readership telemetry, and taxonomic categories."
      actionButton={
        <button
          id="admin-dashboard-new-post-btn"
          onClick={() => navigate('/admin/posts/new')}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Article</span>
        </button>
      }
    >
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Total Posts */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono mb-2">
            <span>Total Publications</span>
            <FileText className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
            {posts.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{publishedCount} live</span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{draftCount} drafts</span>
          </div>
        </div>

        {/* Readership Views */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono mb-2">
            <span>Total Readership</span>
            <Eye className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Lifetime article page reads
          </div>
        </div>

        {/* Categories */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono mb-2">
            <span>Active Tracks</span>
            <FolderTree className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
            {categories.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Across {authors.length} verified contributors
          </div>
        </div>

        {/* Subscribers */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono mb-2">
            <span>Newsletter Audience</span>
            <Mail className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
            {subscribers.length.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Subscribed to Weekly Dispatch
          </div>
        </div>

      </div>

      {/* Quick Action Bar */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          <span>Quick Actions:</span>
          <button
            onClick={() => navigate('/admin/posts/new')}
            className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs transition-colors"
          >
            + Write Article
          </button>
          <button
            onClick={() => navigate('/admin/categories')}
            className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs transition-colors"
          >
            Manage Categories
          </button>
          <button
            onClick={() => navigate('/admin/authors')}
            className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs transition-colors"
          >
            Manage Authors
          </button>
        </div>

        <button
          onClick={() => navigate('/admin/settings')}
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
        >
          Backup & Settings <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Recent Editorial Publications
            </h3>
            <p className="text-xs text-neutral-500">Manage drafts, toggle publish status, and edit research pieces</p>
          </div>
          <button
            onClick={() => navigate('/admin/posts')}
            className="text-xs font-semibold text-neutral-900 dark:text-white hover:underline flex items-center gap-1"
          >
            View All ({posts.length}) <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 font-mono">
              <tr>
                <th className="px-6 py-3 font-medium uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider">Views</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {recentPosts.map((post) => {
                const cat = categories.find((c) => c.slug === post.category);
                const isPublished = post.status === 'published';

                return (
                  <tr key={post.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-850 transition-colors">
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-semibold text-neutral-900 dark:text-white truncate">
                        {post.title}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400 truncate">
                        /blog/{post.slug}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                        {cat?.name || post.category}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => togglePostStatus(post.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold transition-transform active:scale-95 ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="capitalize">{post.status}</span>
                      </button>
                    </td>

                    <td className="px-4 py-4 font-mono text-neutral-600 dark:text-neutral-400">
                      {post.views.toLocaleString()}
                    </td>

                    <td className="px-4 py-4 font-mono text-neutral-500">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/blog/${post.slug}`)}
                        className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                        className="px-2.5 py-1 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:opacity-90 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
