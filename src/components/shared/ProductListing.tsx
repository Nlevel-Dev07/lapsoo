import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/shared/ProductCard"
import { ProductFilters, defaultFilters, type Filters } from "@/components/shared/ProductFilters"
import { fetchProducts } from "@/lib/api"
import { useSeo } from "@/lib/useSeo"

interface ProductListingProps {
  ecosystem: "lapandtop" | "laptopbazaar"
  eyebrow: string
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  logo?: string
}

export function ProductListing({ ecosystem, eyebrow, title, description, seoTitle, seoDescription, logo }: ProductListingProps) {
  useSeo({ title: seoTitle, description: seoDescription })
  const [params] = useSearchParams()
  const [filters, setFilters] = useState<Filters>(defaultFilters)

  useEffect(() => {
    const category = params.get("category")
    if (category) setFilters((f) => ({ ...f, category }))
  }, [params])

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products", ecosystem],
    queryFn: () => fetchProducts({ ecosystem }),
  })

  const list = useMemo(() => {
    let items = products ?? []
    if (filters.category !== "all") items = items.filter((p) => p.category === filters.category)
    if (filters.brand !== "all") items = items.filter((p) => p.brand === filters.brand)
    if (filters.ram !== "all") items = items.filter((p) => p.ram === filters.ram)
    if (filters.screenSize !== "all") items = items.filter((p) => String(p.screenSize) === filters.screenSize)
    if (filters.condition !== "all") items = items.filter((p) => p.condition === filters.condition)
    if (filters.sort === "price-asc") items = [...items].sort((a, b) => a.priceFrom - b.priceFrom)
    if (filters.sort === "price-desc") items = [...items].sort((a, b) => b.priceFrom - a.priceFrom)
    return items
  }, [products, filters])

  return (
    <div>
      <section className="pt-16 pb-10 md:pt-24 md:pb-14 border-b border-ink/8">
        <div className="container-lap grid lg:grid-cols-[1fr_auto] gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="blue">{eyebrow}</Badge>
            <h1 className="font-display mt-5 text-[36px] md:text-[48px] font-extrabold tracking-tight leading-[1.05] text-balance max-w-2xl">
              {title}
            </h1>
            <p className="mt-4 text-ink/55 max-w-xl leading-relaxed">{description}</p>
          </motion.div>
          {logo && (
            <motion.img
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              src={logo}
              alt={eyebrow}
              className="hidden lg:block h-16 w-auto justify-self-end mr-36"
            />
          )}
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-lap">
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            showCondition={false}
            resultCount={list.length}
            products={products}
          />

          {isLoading ? (
            <div className="mt-16 text-center text-ink/45">Loading laptops…</div>
          ) : isError ? (
            <div className="mt-16 text-center text-ink/45">
              Couldn't load products right now. Please refresh or WhatsApp us directly.
            </div>
          ) : list.length === 0 ? (
            <div className="mt-16 text-center text-ink/45">
              No laptops match your filters right now. Try adjusting your filters or WhatsApp us — we likely have it in stock.
            </div>
          ) : (
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {list.map((p, i) => (
                <ProductCard key={p.slug} p={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
