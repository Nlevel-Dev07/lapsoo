import { ProductCard } from "@/components/shared/ProductCard"
import type { Product } from "@/data/products"

export function RecentlyViewed({ products }: { products: Product[] }) {
  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
      {products.map((p, i) => (
        <div key={p.slug} className="w-64 shrink-0">
          <ProductCard p={p} index={i} />
        </div>
      ))}
    </div>
  )
}
