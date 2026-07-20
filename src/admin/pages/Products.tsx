import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Eye, EyeOff, UploadCloud, Search, ImageOff, Trash2, Package, CheckCircle2, EyeOff as EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { LeadTable, DeleteButton } from "@/admin/components/LeadTable"
import { PageHeader } from "@/admin/components/PageHeader"
import { StatCard } from "@/admin/components/StatCard"
import { useConfirm } from "@/admin/components/ConfirmDialog"
import { useToast } from "@/admin/components/Toast"
import { fetchProducts, deleteProduct, updateProduct } from "@/lib/api"
import { formatPrice } from "@/data/products"

const categories = ["Business", "Student", "Gaming", "Workstation", "MacBook", "2-in-1"]

function RowCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate ?? false
      }}
      className="h-4 w-4 rounded border-ink/25 text-blue-500 focus:ring-blue-500/30"
    />
  )
}

export default function Products() {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const { data: products, isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: () => fetchProducts() })

  const [search, setSearch] = useState("")
  const [ecosystem, setEcosystem] = useState("all")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      toast.success("Product deleted.")
    },
    onError: () => toast.error("Could not delete product."),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteProduct(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      setSelected(new Set())
      toast.success("Selected products deleted.")
    },
    onError: () => toast.error("Could not delete selected products."),
  })

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) => updateProduct(id, { published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (products ?? []).filter((p) => {
      if (ecosystem !== "all" && p.ecosystem !== ecosystem) return false
      if (category !== "all" && p.category !== category) return false
      if (status !== "all" && (status === "published") !== p.published) return false
      if (q && !`${p.brand} ${p.model} ${p.slug}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [products, search, ecosystem, category, status])

  const publishedCount = products?.filter((p) => p.published).length ?? 0
  const hiddenCount = (products?.length ?? 0) - publishedCount

  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id))
  const someFilteredSelected = filtered.some((p) => selected.has(p.id))

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        filtered.forEach((p) => next.delete(p.id))
      } else {
        filtered.forEach((p) => next.add(p.id))
      }
      return next
    })
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    const ok = await confirm({
      title: `Delete ${ids.length} selected product${ids.length > 1 ? "s" : ""}?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    })
    if (ok) bulkDeleteMutation.mutate(ids)
  }

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        title="Products"
        subtitle="Manage your LapAndTop and LaptopBazaar catalog."
        actions={
          <>
            <Link to="/admin/products/bulk-import">
              <Button variant="outline"><UploadCloud className="h-4 w-4" /> Bulk Import</Button>
            </Link>
            <Link to="/admin/products/new">
              <Button variant="accent"><Plus className="h-4 w-4" /> Add Product</Button>
            </Link>
          </>
        }
      />

      <div className="mt-6 grid grid-cols-3 gap-4 sm:max-w-lg">
        <StatCard icon={Package} label="Total" value={products?.length ?? 0} />
        <StatCard icon={CheckCircle2} label="Published" value={publishedCount} />
        <StatCard icon={EyeOffIcon} label="Hidden" value={hiddenCount} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, model, or slug..."
            className="h-10 pl-10"
          />
        </div>
        <Select value={ecosystem} onChange={(e) => setEcosystem(e.target.value)} className="h-10 w-auto min-w-[160px]">
          <option value="all">All Ecosystems</option>
          <option value="lapandtop">LapAndTop</option>
          <option value="laptopbazaar">LaptopBazaar</option>
        </Select>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-auto min-w-[150px]">
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-auto min-w-[130px]">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </Select>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-ink/40">
          Showing {filtered.length} of {products?.length ?? 0} products
        </p>
        {selected.size > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-2">
            <span className="text-xs font-semibold text-red-700">{selected.size} selected</span>
            <button onClick={() => setSelected(new Set())} className="text-xs font-medium text-ink/50 hover:text-ink">
              Clear
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 border-red-200 px-3 text-xs text-red-600 hover:border-red-300 hover:bg-red-50"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {bulkDeleteMutation.isPending ? "Deleting..." : "Delete Selected"}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-2">
        <LeadTable
          isLoading={isLoading}
          empty={!filtered.length}
          columns={[
            <RowCheckbox checked={allFilteredSelected} indeterminate={someFilteredSelected && !allFilteredSelected} onChange={toggleAll} label="Select all products" />,
            "Product", "Ecosystem", "Category", "Condition", "Price", "Status", "",
          ]}
          rows={filtered.map((p) => [
            <RowCheckbox checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} label={`Select ${p.brand} ${p.model}`} />,
            <div className="flex items-center gap-3 max-w-[240px]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper-soft">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageOff className="h-4 w-4 text-ink/25" />
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold" title={`${p.brand} ${p.model}`}>{p.brand} {p.model}</div>
                <div className="truncate text-xs text-ink/40" title={p.slug}>{p.slug}</div>
              </div>
            </div>,
            <span className="text-ink/60">{p.ecosystem === "lapandtop" ? "LapAndTop" : "LaptopBazaar"}</span>,
            <span className="text-ink/60">{p.category}</span>,
            <Badge variant={p.condition === "New" ? "success" : "blue"}>{p.condition}</Badge>,
            <span className="text-ink/70">{formatPrice(p.priceFrom)}</span>,
            <button
              onClick={() => togglePublish.mutate({ id: p.id, published: !p.published })}
              className="flex items-center gap-1.5 text-xs font-semibold text-ink/50 hover:text-ink"
            >
              {p.published ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5" />}
              {p.published ? "Published" : "Hidden"}
            </button>,
            <div className="flex items-center justify-end gap-2">
              <Link to={`/admin/products/${p.id}/edit`} className="p-2 rounded-lg hover:bg-ink/5">
                <Pencil className="h-4 w-4 text-ink/50" />
              </Link>
              <DeleteButton
                onClick={async () => {
                  const ok = await confirm({
                    title: `Delete ${p.brand} ${p.model}?`,
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
