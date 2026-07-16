import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchBlogPosts, deleteBlogPost, updateBlogPost } from "@/lib/api"

export default function AdminBlog() {
  const queryClient = useQueryClient()
  const { data: posts, isLoading } = useQuery({ queryKey: ["admin-blog"], queryFn: fetchBlogPosts })

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog"] }),
  })

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) => updateBlogPost(id, { published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog"] }),
  })

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Blog</h1>
          <p className="mt-1 text-sm text-ink/50">Manage buying guides, comparisons, and tips.</p>
        </div>
        <Link to="/admin/blog/new">
          <Button variant="accent"><Plus className="h-4 w-4" /> Add Post</Button>
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-ink/8 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-soft text-left text-xs font-semibold uppercase tracking-wide text-ink/45">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/6">
            {isLoading && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-ink/40">Loading…</td></tr>
            )}
            {!isLoading && posts?.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-ink/40">No blog posts yet.</td></tr>
            )}
            {posts?.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-ink/40">{p.slug}</div>
                </td>
                <td className="px-5 py-3 text-ink/60">{p.category}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => togglePublish.mutate({ id: p.id, published: !p.published })}
                    className="flex items-center gap-1.5 text-xs font-semibold text-ink/50 hover:text-ink"
                  >
                    {p.published ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {p.published ? "Published" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/admin/blog/${p.id}/edit`} className="p-2 rounded-lg hover:bg-ink/5">
                      <Pencil className="h-4 w-4 text-ink/50" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.title}"? This cannot be undone.`)) {
                          deleteMutation.mutate(p.id)
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
