import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { LaptopMock } from "@/components/shared/LaptopMock"
import { formatPrice, type Product } from "@/data/products"
import { productGradient } from "@/lib/gradient"

export function ProductCard({ p, index = 0 }: { p: Product & { images?: string[] }; index?: number }) {
  const gradient = p.gradientFrom && p.gradientTo ? { from: p.gradientFrom, to: p.gradientTo } : productGradient(p.slug)
  const images = p.images ?? []
  const [hoverIndex, setHoverIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const image = images[hoverIndex] ?? images[0]

  const startCycling = () => {
    if (images.length < 2) return
    intervalRef.current = setInterval(() => {
      setHoverIndex((i) => (i + 1) % images.length)
    }, 1000)
  }

  const stopCycling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setHoverIndex(0)
  }

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/products/${p.slug}`}
        onMouseEnter={startCycling}
        onMouseLeave={stopCycling}
        className="group block h-full rounded-3xl border border-ink/8 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
      >
        <div className="bg-paper-soft relative">
          {p.availability !== "In Stock" && (
            <Badge variant="outline" className="absolute top-4 left-4 z-10 bg-white">
              {p.availability}
            </Badge>
          )}
          {image ? (
            <div className="relative w-full aspect-[4/3] flex items-center justify-center">
              <img src={image} alt={`${p.brand} ${p.model}`} className="h-full w-full object-contain" />
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${i === hoverIndex ? "bg-blue-500" : "bg-ink/20"}`}
                    />
                  ))}
                </div>
              )}
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
