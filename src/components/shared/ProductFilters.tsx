import { useMemo } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Product, ProductCategory } from "@/data/products"

export interface Filters {
  category: string
  brand: string
  ram: string
  screenSize: string
  condition: string
  sort: string
}

export const defaultFilters: Filters = {
  category: "all",
  brand: "all",
  ram: "all",
  screenSize: "all",
  condition: "all",
  sort: "relevance",
}

const categories: ProductCategory[] = ["Business", "Student", "Gaming", "Workstation", "MacBook", "2-in-1"]

interface ProductFiltersProps {
  filters: Filters
  onChange: (f: Filters) => void
  showCondition?: boolean
  resultCount: number
  products?: Product[]
}

export function ProductFilters({ filters, onChange, showCondition, resultCount, products = [] }: ProductFiltersProps) {
  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value })
  const active = Object.entries(filters).filter(([k, v]) => k !== "sort" && v !== "all").length

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products])
  const ramOptions = useMemo(() => Array.from(new Set(products.map((p) => p.ram))).sort(), [products])
  const screenSizes = useMemo(
    () => Array.from(new Set(products.map((p) => p.screenSize))).sort((a, b) => a - b),
    [products]
  )

  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {active > 0 && <span className="text-blue-600">({active})</span>}
        </div>
        <span className="text-sm text-ink/45">{resultCount} results</span>
        {active > 0 && (
          <button
            onClick={() => onChange(defaultFilters)}
            className="flex items-center gap-1 text-xs font-semibold text-ink/45 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div>
          <label className="text-xs font-semibold text-ink/50 mb-1 block">Category</label>
          <Select value={filters.category} onChange={(e) => set("category", e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-ink/50 mb-1 block">Brand</label>
          <Select value={filters.brand} onChange={(e) => set("brand", e.target.value)}>
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-ink/50 mb-1 block">RAM</label>
          <Select value={filters.ram} onChange={(e) => set("ram", e.target.value)}>
            <option value="all">Any RAM</option>
            {ramOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-ink/50 mb-1 block">Screen Size</label>
          <Select value={filters.screenSize} onChange={(e) => set("screenSize", e.target.value)}>
            <option value="all">Any Size</option>
            {screenSizes.map((s) => (
              <option key={s} value={String(s)}>{s}"</option>
            ))}
          </Select>
        </div>
        {showCondition && (
          <div>
            <label className="text-xs font-semibold text-ink/50 mb-1 block">Condition</label>
            <Select value={filters.condition} onChange={(e) => set("condition", e.target.value)}>
              <option value="all">Any Condition</option>
              <option value="New">New</option>
              <option value="Certified Refurbished">Certified Refurbished</option>
            </Select>
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-ink/50 mb-1 block">Sort By</label>
          <Select value={filters.sort} onChange={(e) => set("sort", e.target.value)}>
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </Select>
        </div>
      </div>
    </div>
  )
}

export function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      Clear Filters
    </Button>
  )
}
