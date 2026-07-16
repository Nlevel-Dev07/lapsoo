import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, X, Plus, UploadCloud, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { fetchProductById, createProduct, updateProduct, uploadImage, ApiError } from "@/lib/api"

const schema = z.object({
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  brandName: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  category: z.enum(["Business", "Student", "Gaming", "Workstation", "MacBook", "2-in-1"]),
  condition: z.enum(["New", "Certified Refurbished"]),
  ecosystem: z.enum(["lapandtop", "laptopbazaar"]),
  priceFrom: z.number().int().positive("Price must be a positive number"),
  processor: z.string().min(1, "Required"),
  ram: z.string().min(1, "Required"),
  storage: z.string().min(1, "Required"),
  display: z.string().min(1, "Required"),
  graphics: z.string().min(1, "Required"),
  battery: z.string().min(1, "Required"),
  warranty: z.string().min(1, "Required"),
  screenSize: z.number().positive("Required"),
  availability: z.enum(["In Stock", "Limited Stock", "On Order"]),
  published: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [highlights, setHighlights] = useState<string[]>([])
  const [highlightDraft, setHighlightDraft] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: existing } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => fetchProductById(id as string),
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
    defaultValues: {
      category: "Business",
      condition: "New",
      ecosystem: "laptopbazaar",
      availability: "In Stock",
      published: true,
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        slug: existing.slug,
        brandName: existing.brand,
        model: existing.model,
        category: existing.category,
        condition: existing.condition,
        ecosystem: existing.ecosystem,
        priceFrom: existing.priceFrom,
        processor: existing.processor,
        ram: existing.ram,
        storage: existing.storage,
        display: existing.display,
        graphics: existing.graphics,
        battery: existing.battery,
        warranty: existing.warranty,
        screenSize: existing.screenSize,
        availability: existing.availability,
        published: existing.published,
      })
      setHighlights(existing.highlights ?? [])
      setImages(existing.images ?? [])
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = { ...data, highlights, images }
      if (isEdit) {
        return updateProduct(id as string, payload)
      }
      return createProduct(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      navigate("/admin/products")
    },
    onError: (err) => {
      setServerError(err instanceof ApiError ? err.message : "Failed to save product.")
    },
  })

  const onSubmit = (data: FormValues) => {
    setServerError(null)
    mutation.mutate(data)
  }

  const addHighlight = () => {
    if (highlightDraft.trim()) {
      setHighlights((h) => [...h, highlightDraft.trim()])
      setHighlightDraft("")
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadImage))
      setImages((imgs) => [...imgs, ...uploaded])
    } catch {
      setServerError("Image upload failed. Check Cloudinary configuration.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link to="/admin/products" className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to Products
      </Link>
      <h1 className="font-display text-2xl font-bold">{isEdit ? "Edit Product" : "Add Product"}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
        <section className="rounded-2xl border border-ink/8 bg-white p-6 space-y-5">
          <h3 className="font-semibold text-sm text-ink/60 uppercase tracking-wide">Basics</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" placeholder="dell-latitude-7420-refurb" {...register("slug")} />
              {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
            </div>
            <div>
              <Label htmlFor="brandName">Brand *</Label>
              <Input id="brandName" placeholder="Dell" {...register("brandName")} />
              {errors.brandName && <p className="mt-1 text-xs text-red-500">{errors.brandName.message}</p>}
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input id="model" placeholder="Latitude 7420" {...register("model")} />
              {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model.message}</p>}
            </div>
            <div>
              <Label htmlFor="priceFrom">Price (₹) *</Label>
              <Input id="priceFrom" type="number" placeholder="34999" {...register("priceFrom", { valueAsNumber: true })} />
              {errors.priceFrom && <p className="mt-1 text-xs text-red-500">{errors.priceFrom.message}</p>}
            </div>
            <div>
              <Label htmlFor="ecosystem">Ecosystem *</Label>
              <Select id="ecosystem" {...register("ecosystem")}>
                <option value="lapandtop">LapAndTop (Refurbished)</option>
                <option value="laptopbazaar">LaptopBazaar (New)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select id="condition" {...register("condition")}>
                <option value="New">New</option>
                <option value="Certified Refurbished">Certified Refurbished</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select id="category" {...register("category")}>
                <option value="Business">Business</option>
                <option value="Student">Student</option>
                <option value="Gaming">Gaming</option>
                <option value="Workstation">Workstation</option>
                <option value="MacBook">MacBook</option>
                <option value="2-in-1">2-in-1</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="availability">Availability *</Label>
              <Select id="availability" {...register("availability")}>
                <option value="In Stock">In Stock</option>
                <option value="Limited Stock">Limited Stock</option>
                <option value="On Order">On Order</option>
              </Select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink/8 bg-white p-6 space-y-5">
          <h3 className="font-semibold text-sm text-ink/60 uppercase tracking-wide">Specifications</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="processor">Processor *</Label>
              <Input id="processor" placeholder="Intel Core i5-1145G7 (11th Gen)" {...register("processor")} />
              {errors.processor && <p className="mt-1 text-xs text-red-500">{errors.processor.message}</p>}
            </div>
            <div>
              <Label htmlFor="ram">RAM *</Label>
              <Input id="ram" placeholder="16GB DDR4" {...register("ram")} />
              {errors.ram && <p className="mt-1 text-xs text-red-500">{errors.ram.message}</p>}
            </div>
            <div>
              <Label htmlFor="storage">Storage *</Label>
              <Input id="storage" placeholder="512GB NVMe SSD" {...register("storage")} />
              {errors.storage && <p className="mt-1 text-xs text-red-500">{errors.storage.message}</p>}
            </div>
            <div>
              <Label htmlFor="display">Display *</Label>
              <Input id="display" placeholder="14&quot; FHD IPS" {...register("display")} />
              {errors.display && <p className="mt-1 text-xs text-red-500">{errors.display.message}</p>}
            </div>
            <div>
              <Label htmlFor="graphics">Graphics *</Label>
              <Input id="graphics" placeholder="Intel Iris Xe" {...register("graphics")} />
              {errors.graphics && <p className="mt-1 text-xs text-red-500">{errors.graphics.message}</p>}
            </div>
            <div>
              <Label htmlFor="screenSize">Screen Size (inches) *</Label>
              <Input id="screenSize" type="number" step="0.1" placeholder="14" {...register("screenSize", { valueAsNumber: true })} />
              {errors.screenSize && <p className="mt-1 text-xs text-red-500">{errors.screenSize.message}</p>}
            </div>
            <div>
              <Label htmlFor="battery">Battery *</Label>
              <Input id="battery" placeholder="Up to 10 hours" {...register("battery")} />
              {errors.battery && <p className="mt-1 text-xs text-red-500">{errors.battery.message}</p>}
            </div>
            <div>
              <Label htmlFor="warranty">Warranty *</Label>
              <Input id="warranty" placeholder="6 Months Lapsoo Warranty" {...register("warranty")} />
              {errors.warranty && <p className="mt-1 text-xs text-red-500">{errors.warranty.message}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink/8 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-sm text-ink/60 uppercase tracking-wide">Highlights</h3>
          <div className="flex gap-2">
            <Input
              value={highlightDraft}
              onChange={(e) => setHighlightDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addHighlight()
                }
              }}
              placeholder="e.g. Backlit Keyboard"
            />
            <Button type="button" variant="outline" onClick={addHighlight}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {highlights.map((h, i) => (
              <span key={i} className="flex items-center gap-1.5 rounded-full bg-paper-soft px-3 py-1.5 text-xs font-medium">
                {h}
                <button type="button" onClick={() => setHighlights((hs) => hs.filter((_, idx) => idx !== i))}>
                  <X className="h-3 w-3 text-ink/40" />
                </button>
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-ink/8 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-sm text-ink/60 uppercase tracking-wide">Images</h3>
          <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 p-8 text-sm text-ink/45 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Click to upload images (Cloudinary)"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-paper-soft">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </Button>
          <Link to="/admin/products">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
