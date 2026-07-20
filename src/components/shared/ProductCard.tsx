import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { LaptopMock } from "@/components/shared/LaptopMock"
import { formatPrice, type Product } from "@/data/products"
import { productGradient } from "@/lib/gradient"

export function ProductCard({ p, index = 0 }: { p: Product & { images?: string[] }; index?: number }) {
  const gradient = p.gradientFrom && p.gradientTo ? { from: p.gradientFrom, to: p.gradientTo } : productGradient(p.slug)
  const image = p.images?.[0]
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/products/${p.slug}`}
        className="group block h-full rounded-3xl border border-ink/8 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
      >
        <div className="bg-paper-soft relative">
          {p.availability !== "In Stock" && (
            <Badge variant="outline" className="absolute top-4 left-4 z-10 bg-white">
              {p.availability}
            </Badge>
          )}
          {image ? (
            <div className="relative w-full aspect-[4/3]">
              <img src={image} alt={`${p.brand} ${p.model}`} className="h-full w-full object-cover" />
            </div>
          ) : (
            <LaptopMock glyph={p.brand[0]} from={gradient.from} to={gradient.to} className="p-6" />
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={p.condition === "New" ? "success" : "blue"}>{p.condition}</Badge>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/35">{p.category}</span>
          </div>
          <h4 className="font-semibold text-[15px] leading-snug">{p.brand} {p.model}</h4>
          <p className="mt-1 text-sm text-ink/45">{p.processor.split(" (")[0]} · {p.ram}</p>
          <p className="mt-3 font-display font-bold text-lg">
            {formatPrice(p.priceFrom)} <span className="text-xs font-medium text-ink/40">onwards</span>
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
