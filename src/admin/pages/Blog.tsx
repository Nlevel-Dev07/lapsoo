import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchBlogPosts, deleteBlogPost, updateBlogPost } from "@/lib/api"
import { LeadTable, DeleteButton } from "@/admin/components/LeadTable"
import { PageHeader } from "@/admin/components/PageHeader"
import { useConfirm } from "@/admin/components/ConfirmDialog"
import { useToast } from "@/admin/components/Toast"

export default function AdminBlog() {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const { data: posts, isLoading } = useQuery({ queryKey: ["admin-blog"], queryFn: fetchBlogPosts })

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] })
      toast.success("Post deleted.")
    },
    onError: () => toast.error("Could not delete post."),
  })

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) => updateBlogPost(id, { published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog"] }),
    onError: () => toast.error("Could not update post."),
  })

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Blog"
        subtitle="Manage buying guides, comparisons, and tips."
        actions={
          <Link to="/admin/blog/new">
            <Button variant="accent"><Plus className="h-4 w-4" /> Add Post</Button>
          </Link>
        }
      />

      <div className="mt-8">
        <LeadTable
          isLoading={isLoading}
          empty={!posts?.length}
          columns={["Title", "Category", "Status", ""]}
          rows={posts?.map((p) => [
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-xs text-ink/40">{p.slug}</div>
            </div>,
            <span className="text-ink/60">{p.category}</span>,
            <button
              onClick={() => togglePublish.mutate({ id: p.id, published: !p.published })}
              className="flex items-center gap-1.5 text-xs font-semibold text-ink/50 hover:text-ink"
            >
              {p.published ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5" />}
              {p.published ? "Published" : "Hidden"}
            </button>,
            <div className="flex items-center justify-end gap-2">
              <Link to={`/admin/blog/${p.id}/edit`} className="p-2 rounded-lg hover:bg-ink/5">
                <Pencil className="h-4 w-4 text-ink/50" />
              </Link>
              <DeleteButton
                onClick={async () => {
                  const ok = await confirm({
                    title: `Delete "${p.title}"?`,
                    description: "This cannot be undone.",
                    confirmLabel: "Delete",
                    danger: true,
                  })
                  if (ok) deleteMutation.mutate(p.id)
                }}
              />
            </div>,
          ])}
        />
      </div>
    </div>
  )
}
