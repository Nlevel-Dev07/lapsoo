import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, X, Plus, UploadCloud, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { fetchBlogPostById, createBlogPost, updateBlogPost, uploadImage, ApiError } from "@/lib/api"

const schema = z.object({
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  title: z.string().min(2, "Title is required"),
  excerpt: z.string().min(10, "Excerpt should be at least 10 characters").max(500),
  category: z.enum(["Buying Guide", "Comparison", "Repair Tips", "Upgrade Guide", "Business IT", "Student Guide"]),
  readTime: z.string().min(1, "e.g. 6 min read"),
  published: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export default function BlogForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [paragraphs, setParagraphs] = useState<string[]>([""])
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined)
  const [uploading, setUploading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: existing } = useQuery({
    queryKey: ["admin-blog-post", id],
    queryFn: () => fetchBlogPostById(id as string),
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "Buying Guide", published: true },
  })

  useEffect(() => {
    if (existing) {
      reset({
        slug: existing.slug,
        title: existing.title,
        excerpt: existing.excerpt,
        category: existing.category,
        readTime: existing.readTime,
        published: existing.published,
      })
      setParagraphs(existing.content.length ? existing.content : [""])
      setCoverImage(existing.coverImage ?? undefined)
    }
  }, [existing, reset])

  const handleCoverUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const url = await uploadImage(files[0])
      setCoverImage(url)
    } catch {
      setServerError("Image upload failed. Check Cloudinary configuration.")
    } finally {
      setUploading(false)
    }
  }

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const content = paragraphs.map((p) => p.trim()).filter(Boolean)
      const payload = { ...data, content, coverImage }
      if (isEdit) return updateBlogPost(id as string, payload)
      return createBlogPost(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] })
      navigate("/admin/blog")
    },
    onError: (err) => {
      setServerError(err instanceof ApiError ? err.message : "Failed to save post.")
    },
  })

  const onSubmit = (data: FormValues) => {
    if (paragraphs.map((p) => p.trim()).filter(Boolean).length === 0) {
      setServerError("Add at least one content paragraph.")
      return
    }
    setServerError(null)
    mutation.mutate(data)
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link to="/admin/blog" className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to Blog
      </Link>
      <h1 className="font-display text-2xl font-bold">{isEdit ? "Edit Post" : "Add Post"}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
        <section className="rounded-2xl border border-ink/8 bg-white p-6 space-y-5">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Certified Refurbished vs New Laptop..." {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" placeholder="certified-refurbished-vs-new-laptop" {...register("slug")} />
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select id="category" {...register("category")}>
                <option value="Buying Guide">Buying Guide</option>
                <option value="Comparison">Comparison</option>
                <option value="Repair Tips">Repair Tips</option>
                <option value="Upgrade Guide">Upgrade Guide</option>
                <option value="Business IT">Business IT</option>
                <option value="Student Guide">Student Guide</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="readTime">Read Time *</Label>
              <Input id="readTime" placeholder="6 min read" {...register("readTime")} />
              {errors.readTime && <p className="mt-1 text-xs text-red-500">{errors.readTime.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea id="excerpt" placeholder="A short summary shown on the blog listing page..." {...register("excerpt")} />
            {errors.excerpt && <p className="mt-1 text-xs text-red-500">{errors.excerpt.message}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-ink/8 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-sm text-ink/60 uppercase tracking-wide">Cover Image</h3>
          {coverImage ? (
            <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden bg-paper-soft">
              <img src={coverImage} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage(undefined)}
                className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 p-8 text-sm text-ink/45 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Click to upload cover image (Cloudinary)"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverUpload(e.target.files)} />
            </label>
          )}
        </section>

        <section className="rounded-2xl border border-ink/8 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-sm text-ink/60 uppercase tracking-wide">Content Paragraphs</h3>
          {paragraphs.map((para, i) => (
            <div key={i} className="flex gap-2">
              <Textarea
                value={para}
                onChange={(e) => setParagraphs((ps) => ps.map((p, idx) => (idx === i ? e.target.value : p)))}
                placeholder={`Paragraph ${i + 1}`}
              />
              {paragraphs.length > 1 && (
                <button
                  type="button"
                  onClick={() => setParagraphs((ps) => ps.filter((_, idx) => idx !== i))}
                  className="h-fit p-2 rounded-lg hover:bg-red-50"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setParagraphs((ps) => [...ps, ""])}>
            <Plus className="h-4 w-4" /> Add Paragraph
          </Button>
        </section>

        <section className="rounded-2xl border border-ink/8 bg-white p-6">
          <Controller
            control={control}
            name="published"
            render={({ field }) => (
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4" />
                Published (visible on the public site)
              </label>
            )}
          />
        </section>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <div className="flex gap-3">
          <Button type="submit" variant="accent" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Post"}
          </Button>
          <Link to="/admin/blog">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
